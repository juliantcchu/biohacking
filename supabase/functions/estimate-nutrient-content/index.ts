// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

interface RequestBody {
  user_id: string
  image_base64: string
}

const NutrientSchema = z.object({
  'Omega-3': z.number(),
  'Phosphatidylserine': z.number(),
  'Choline': z.number(),
  'Creatine': z.number(),
  'Vitamin D3': z.number()
})

serve(async (req) => {
  try {
    const { user_id, image_base64 } = await req.json() as RequestBody

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Initialize OpenAI client
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const openai = new OpenAI({
      apiKey: openaiKey,
    })

    // Call OpenAI API with GPT-4 Vision
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this image of the food and estimate the content of these nutrients. Return ONLY a JSON object in this exact format:
{
  "Omega-3": 0.5,
  "Phosphatidylserine": 25,
  "Choline": 150,
  "Creatine": 0.2,
  "Vitamin D3": 400
}
Units should be: Omega-3 (g), Phosphatidylserine (mg), Choline (mg), Creatine (g), and Vitamin D3 (IU).`
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
      max_tokens: 1000,
    })

    const responseText = chatCompletion.choices[0].message.content;
    const estimates = NutrientSchema.parse(JSON.parse(responseText));

    // Generate unique image ID
    const image_id = crypto.randomUUID()

    // Save image to storage
    const { error: uploadError } = await supabase
      .storage
      .from('uploaded-images')
      .uploadBinary(`${user_id}/${image_id}.jpg`, Uint8Array.from(atob(image_base64), c => c.charCodeAt(0)))

    if (uploadError) {
      throw new Error('Failed to upload image')
    }

    // Save meal entry to database
    const { error: dbError } = await supabase
      .from('meals')
      .insert({
        user_id,
        image_id,
        created_at: new Date().toISOString(),
        nutrient_content: estimates,
        confirmed: false
      })

    if (dbError) {
      throw new Error('Failed to save meal data')
    }

    return new Response(
      JSON.stringify({
        image_id,
        estimates,
        message: 'Nutrient content estimated and saved'
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400 }
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
