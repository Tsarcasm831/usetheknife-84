
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, excerpt } = await req.json()

    if (!title || !excerpt) {
      return new Response(
        JSON.stringify({ error: 'Title and excerpt are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const token = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')

    if (!token) {
      console.error('HUGGING_FACE_ACCESS_TOKEN env var not set')
      return new Response(
        JSON.stringify({ error: 'HUGGING_FACE_ACCESS_TOKEN environment variable is missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const hf = new HfInference(token)

    // Create a fantasy-futuristic prompt based on the devlog content
    const prompt = `Fantasy futuristic digital art, cyberpunk aesthetic, glowing neon colors, sci-fi technology theme related to: ${title}. ${excerpt}. High quality, detailed, cinematic lighting, 4K resolution`

    console.log('Generating image with prompt:', prompt)

    const image = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    })

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    return new Response(
      JSON.stringify({ 
        image: `data:image/png;base64,${base64}`,
        prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating devlog image:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate image', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
