// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

// Import nutrient configuration
const NUTRIENTS = {
  'Omega-3': {
    target: 2,
    unit: 'g',
    purpose: 'Brain function & mood regulation',
    sources: 'Fatty fish (salmon, mackerel, sardines), flaxseeds, chia seeds, walnuts',
    recommendations: 'Eat fatty fish 2-3 times per week or take a fish oil supplement'
  },
  'Choline': {
    target: 500,
    unit: 'mg', 
    purpose: 'Focus & memory support',
    sources: 'Eggs, liver, beef, chicken, fish, soybeans, quinoa',
    recommendations: 'Eat 2-3 eggs daily or include organ meats weekly'
  },
  'Magnesium': {
    target: 400,
    unit: 'mg',
    purpose: 'Neurotransmitter regulation & stress management', 
    sources: 'Dark leafy greens, nuts, seeds, whole grains, dark chocolate',
    recommendations: 'Include magnesium-rich foods daily or supplement with magnesium glycinate if needed'
  },
  'Vitamin D3': {
    target: 4000,
    unit: 'IU',
    purpose: 'Hormonal & bone health, cognitive support',
    sources: 'Sunlight exposure, fatty fish, egg yolks, fortified foods',
    recommendations: 'Get 15-30 minutes of sunlight daily or supplement, especially in winter months'
  },
  'L-Theanine': {
    target: 200,
    unit: 'mg',
    purpose: 'Focus, relaxation, and alpha brain wave enhancement',
    sources: 'Green tea, matcha',
    recommendations: 'Drink 2-3 cups of green tea daily or supplement for relaxation and focus'
  },
  'Curcumin': {
    target: 500,
    unit: 'mg',
    purpose: 'Neuroprotection & anti-inflammatory effects',
    sources: 'Turmeric (with black pepper for better absorption)',
    recommendations: 'Use turmeric in cooking or supplement with a curcumin extract with piperine'
  },
  'Vitamin B Complex': {
    target: 'Varies',
    unit: 'mg/mcg',
    purpose: 'Neurotransmitter production, energy metabolism, and myelin health',
    sources: 'Leafy greens, eggs, meat, fortified foods',
    recommendations: 'Include B-rich foods daily or supplement with a high-quality B-complex'
  },
  'Phosphatidylserine': {
    target: 300,
    unit: 'mg',
    purpose: 'Cognitive function & memory',
    sources: 'Soy lecithin, white beans, egg yolks, chicken liver, mackerel',
    recommendations: 'Include soy products and organ meats in diet, or consider supplementation'
  },
  'Iron': {
    target: 18,
    unit: 'mg',
    purpose: 'Oxygen transport & cognitive focus',
    sources: 'Red meat, spinach, legumes, fortified cereals',
    recommendations: 'Consume iron-rich foods with vitamin C for better absorption; supplement if deficient'
  },
  'Zinc': {
    target: 11,
    unit: 'mg',
    purpose: 'Neurogenesis & immune support',
    sources: 'Shellfish, seeds, nuts, meat',
    recommendations: 'Include zinc-rich foods regularly or supplement during periods of stress or illness'
  },
  'Selenium': {
    target: 55,
    unit: 'mcg',
    purpose: 'Antioxidant protection & cognitive health',
    sources: 'Brazil nuts, fish, eggs, whole grains',
    recommendations: 'Eat 1-2 Brazil nuts daily or include selenium-rich foods in meals'
  },
  'Alpha-GPC': {
    target: 500,
    unit: 'mg',
    purpose: 'Acetylcholine production & focus',
    sources: 'Supplements (rare in significant quantities in food)',
    recommendations: 'Supplement daily for enhanced memory and focus, especially in aging adults'
  }
};

interface RequestBody {
  user_id: string
  image_base64: string
}

type NutrientEstimates = {
  [K in keyof typeof NUTRIENTS]: number
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
  try {
    const { user_id, image_base64 } = await req.json() as RequestBody

    if (!user_id || !image_base64) {
      throw new Error('Missing required fields')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('BACKEND_SUPABASE_URL')
    const supabaseKey = Deno.env.get('BACKEND_SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      throw new Error('Missing Supabase environment variables')
    }

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
  "name": "Example Meal Name",  // Short descriptive name of the meal
  ${Object.entries(NUTRIENTS).map(([nutrient, { unit }]) => 
    `  "${nutrient}": ${NUTRIENTS[nutrient].target/10},        // in ${unit}`
  ).join('\n')}
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

    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    let parsedResponse;
    let estimates: NutrientEstimates;
    let mealName: string;
    try {
      parsedResponse = JSON.parse(responseText)
      mealName = parsedResponse.name || 'Meal'
      estimates = Object.keys(NUTRIENTS).reduce((acc, nutrient) => {
        acc[nutrient] = parsedResponse[nutrient] || 0;
        return acc;
      }, {} as NutrientEstimates);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      mealName = 'Untitled Meal'
      estimates = Object.keys(NUTRIENTS).reduce((acc, nutrient) => {
        acc[nutrient] = 0;
        return acc;
      }, {} as NutrientEstimates);
    }

    // Generate unique image ID
    const image_id = crypto.randomUUID()

    // Convert base64 to binary data
    const imageData = base64ToBuffer(image_base64)

    // Save image to storage
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

    // Save meal entry to database
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
