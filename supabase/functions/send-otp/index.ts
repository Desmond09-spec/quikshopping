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
    // Use anon key but create a service client for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
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

    // Create HTML email template for OTP
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; letter-spacing: 3px; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 2px dashed #cbd5e1; }
          .warning { background-color: #fef3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #1f2937; margin: 0;">Admin PIN Reset</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Your One-Time Password</p>
          </div>
          
          <p>Hello,</p>
          <p>You requested to reset your admin PIN. Please use the following 6-digit code to verify your identity:</p>
          
          <div class="otp-code">${otp}</div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
          </div>
          
          <p>If you didn't request this PIN reset, please ignore this email and your PIN will remain unchanged.</p>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send OTP via email using the send-email function
    try {
      const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Admin PIN Reset - Verification Code',
          html: emailHtml
        })
      })

      const emailResult = await emailResponse.json()
      
      if (!emailResponse.ok) {
        console.error('Failed to send email:', emailResult)
        return new Response(
          JSON.stringify({ error: 'Failed to send OTP email' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('OTP email sent successfully')
      
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return new Response(
        JSON.stringify({ error: 'Failed to send OTP email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully to your email'
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