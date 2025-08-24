import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { whatsappNumber } = await req.json()

    if (!whatsappNumber) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the admin settings with the new WhatsApp number
    const { error: updateError } = await supabaseClient
      .from('admin_settings')
      .update({ whatsapp_number: whatsappNumber })
      .eq('owner_user_id', user.id)

    if (updateError) {
      console.error('Error updating WhatsApp number:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update WhatsApp number' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the activity
    await supabaseClient.from('activities').insert({
      user_id: user.id,
      type: 'whatsapp_number_updated',
      description: 'WhatsApp number configured for admin account',
      details: {
        whatsappNumber: whatsappNumber,
        updatedAt: new Date().toISOString()
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp number updated successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})