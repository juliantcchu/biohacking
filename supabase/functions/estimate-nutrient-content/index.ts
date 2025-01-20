// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

interface RequestBody {
  user_id: string
  image_base64: string
}

interface NutrientEstimates {
  'Omega-3': number
  'Phosphatidylserine': number
  'Choline': number
  'Creatine': number
  'Vitamin D3': number
}

function base64ToBuffer(base64: string): Uint8Array {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  
  // Decode base64 to binary string
  const binaryString = atob(base64Data)
  
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  return bytes
}

serve(async (req) => {
  console.log('Request received')
  try {
    const { user_id, image_base64 } = await req.json() as RequestBody

    if (!user_id || !image_base64) {
      throw new Error('Missing required fields')
    }

    console.log('User ID:', user_id)
    console.log('Image base64 length:', image_base64.length)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('BACKEND_SUPABASE_URL')
    const supabaseKey = Deno.env.get('BACKEND_SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      console.log('Available env vars:', Object.keys(Deno.env.toObject()))
      throw new Error('Missing Supabase environment variables')
    }

    console.log('Supabase URL:', supabaseUrl)
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Initialize OpenAI client
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('Missing OpenAI API key')
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    })

    // Call OpenAI API with GPT-4 Vision
    console.log('Calling OpenAI API...')
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Based on this image, give the meal a short descriptive name and estimate the content of these nutrients. Return a JSON object with the name and estimated nutrient values:
{
  "name": "Grilled Salmon with Rice",  // Short descriptive name of the meal
  "Omega-3": 0.5,        // in grams
  "Phosphatidylserine": 25,  // in mg
  "Choline": 150,        // in mg
  "Creatine": 0.2,       // in grams
  "Vitamin D3": 400      // in IU
}`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image_base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    const responseText = chatCompletion.choices[0].message?.content;
    console.log('OpenAI response:', responseText)

    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    let parsedResponse;
    let estimates: NutrientEstimates;
    let mealName: string;
    try {
      parsedResponse = JSON.parse(responseText)
      mealName = parsedResponse.name || 'Meal'
      estimates = {
        'Omega-3': parsedResponse['Omega-3'],
        'Phosphatidylserine': parsedResponse['Phosphatidylserine'],
        'Choline': parsedResponse['Choline'],
        'Creatine': parsedResponse['Creatine'],
        'Vitamin D3': parsedResponse['Vitamin D3']
      }
      console.log('Parsed estimates:', estimates)
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      mealName = 'Untitled Meal'
      estimates = {
        'Omega-3': 0,
        'Phosphatidylserine': 0,
        'Choline': 0,
        'Creatine': 0,
        'Vitamin D3': 0
      }
    }

    // Generate unique image ID
    const image_id = crypto.randomUUID()
    console.log('Generated image_id:', image_id)

    // Convert base64 to binary data
    const imageData = base64ToBuffer(image_base64)
    console.log('Converted image data length:', imageData.length)

    // Save image to storage
    console.log('Uploading to storage...')
    const { error: uploadError } = await supabase.storage
      .from('uploaded-images')
      .upload(`${user_id}/${image_id}.jpg`, imageData, {
        contentType: 'image/jpeg',
        duplex: 'half'
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    console.log('Upload successful')

    // Save meal entry to database
    console.log('Saving to database...')
    const { error: dbError, data: dbData } = await supabase
      .from('meals')
      .insert({
        user_id,
        image_id,
        created_at: new Date().toISOString(),
        nutrient_content: estimates,
        notes: mealName,
        confirmed: false
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Failed to save meal data: ${dbError.message}`)
    }

    console.log('Database insert successful:', dbData)

    return new Response(
      JSON.stringify({
        image_id,
        estimates,
        name: mealName,
        message: 'Nutrient content estimated and saved'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request'
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/estimate-nutrient-content' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"user_id":"123","image_base64":"..."}'

*/
