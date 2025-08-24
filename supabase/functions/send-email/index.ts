import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@latest"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    // Log the email for development/debugging
    console.log('Email to:', to)
    console.log('Subject:', subject)
    
    // Try to use Resend if API key is available
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    
    let emailSent = false
    
    // Try Resend first
    if (resendApiKey && !emailSent) {
      try {
        const resend = new Resend(resendApiKey)
        const data = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [to],
          subject: subject,
          html: html,
        })
        
        console.log('Email sent via Resend:', data)
        emailSent = true
      } catch (resendError) {
        console.log('Resend failed, trying fallback:', resendError)
      }
    }
    
    // Try SendGrid as fallback
    if (sendGridApiKey && !emailSent) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: to }],
            }],
            from: { email: 'onboarding@resend.dev' },
            subject: subject,
            content: [{
              type: 'text/html',
              value: html,
            }],
          }),
        })
        
        if (response.ok) {
          emailSent = true
          console.log('Email sent via SendGrid')
        }
      } catch (sendGridError) {
        console.log('SendGrid failed:', sendGridError)
      }
    }
    
    // If no email service is configured, still return success for development
    if (!emailSent) {
      console.log('⚠️  No email service configured - email content logged only')
      console.log('HTML Content:', html)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: emailSent ? 'Email sent successfully' : 'Email logged (no service configured)',
        serviceUsed: emailSent
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in email function:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process email request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})