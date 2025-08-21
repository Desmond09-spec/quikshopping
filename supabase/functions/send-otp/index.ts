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

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For PIN reset, we need to find the user by email instead of requiring authentication
    // Get user by email from admin_settings
    const { data: adminData, error: adminError } = await supabaseClient
      .from('admin_settings')
      .select('owner_user_id')
      .eq('admin_email', email)
      .single()

    if (adminError || !adminData) {
      return new Response(
        JSON.stringify({ error: 'Admin email not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database with correct schema
    const { error: insertError } = await supabaseClient
      .from('otp_codes')
      .insert({
        user_id: adminData.owner_user_id,
        email: email,
        code: otp, // Fixed: changed from otp_code to code
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

    // Send email via send-email function
    try {
      const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Admin PIN Reset - Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Admin PIN Reset</h2>
              <p>You requested to reset your admin PIN. Use the verification code below:</p>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `
        }
      })

      if (emailError) {
        console.log('Email sending failed, but OTP stored for development:', emailError)
      }
    } catch (emailError) {
      console.log('Email function failed, but OTP stored for development:', emailError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        // Include OTP in response for development (remove in production)
        devOtp: otp
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