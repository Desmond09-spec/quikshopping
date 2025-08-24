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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { email, whatsappNumber, otp } = await req.json()

    if ((!email && !whatsappNumber) || !otp) {
      return new Response(
        JSON.stringify({ error: 'Email or WhatsApp number and OTP are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build query based on whether we have email or WhatsApp number
    let query = supabaseClient
      .from('otp_codes')
      .select('*')
      .eq('code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString());

    if (email) {
      query = query.eq('email', email);
    } else {
      query = query.eq('whatsapp_number', whatsappNumber);
    }

    // Find valid OTP
    const { data: otpData, error: otpError } = await query.single()

    if (otpError || !otpData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Mark OTP as used
    const { error: updateError } = await supabaseClient
      .from('otp_codes')
      .update({ 
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', otpData.id)

    if (updateError) {
      console.error('Error marking OTP as used:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        verified: true,
        otp_id: otpData.id,
        message: 'OTP verified successfully'
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