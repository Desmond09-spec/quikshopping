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

    // Find the user by WhatsApp number from admin_settings
    const { data: adminData, error: adminError } = await supabaseClient
      .from('admin_settings')
      .select('owner_user_id')
      .eq('whatsapp_number', whatsappNumber)
      .single()

    if (adminError || !adminData) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp number not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    const { error: insertError } = await supabaseClient
      .from('otp_codes')
      .insert({
        user_id: adminData.owner_user_id,
        email: '', // Empty for WhatsApp OTP
        whatsapp_number: whatsappNumber,
        code: otp,
        type: 'pin_reset',
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // In a real implementation, you would send the OTP via WhatsApp API
    // For now, we'll log it for development purposes
    console.log(`WhatsApp OTP for ${whatsappNumber}: ${otp}`)

    // Log the activity
    await supabaseClient.from('activities').insert({
      user_id: adminData.owner_user_id,
      type: 'whatsapp_otp_sent',
      description: 'WhatsApp OTP sent for PIN reset',
      details: {
        whatsappNumber: whatsappNumber,
        sentAt: new Date().toISOString()
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully to your WhatsApp'
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