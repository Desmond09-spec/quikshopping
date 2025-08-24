import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt_for_pin_hashing_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

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

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { adminEmail, securityAnswer, newPin } = await req.json()

    if (!adminEmail || !securityAnswer || !newPin) {
      return new Response(
        JSON.stringify({ error: 'Admin email, security answer, and new PIN are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate PIN (at least 4 digits)
    if (!/^\d{4,}$/.test(newPin)) {
      return new Response(
        JSON.stringify({ error: 'PIN must be at least 4 digits' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get admin settings
    const { data: adminSettings, error: settingsError } = await supabaseClient
      .from('admin_settings')
      .select('*')
      .eq('owner_user_id', user.id)
      .single()

    if (settingsError || !adminSettings) {
      console.log('Admin settings not found for user:', user.id, settingsError)
      return new Response(
        JSON.stringify({ error: 'Admin not configured' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the email matches the admin settings
    if (adminSettings.admin_email !== adminEmail) {
      console.log('Email mismatch:', { adminEmail: adminSettings.admin_email, providedEmail: adminEmail })
      return new Response(
        JSON.stringify({ error: 'Email does not match admin email' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check rate limiting
    const now = new Date()
    const { data: attempts, error: attemptError } = await supabaseClient
      .from('pin_reset_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('admin_email', adminEmail)
      .single()

    if (attempts && attempts.locked_until && new Date(attempts.locked_until) > now) {
      const remainingTime = Math.ceil((new Date(attempts.locked_until).getTime() - now.getTime()) / 60000)
      return new Response(
        JSON.stringify({ 
          error: `Too many failed attempts. Account locked for ${remainingTime} more minutes.` 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Hash the provided security answer
    const providedAnswerHash = await hashPassword(securityAnswer.toLowerCase().trim())

    // Verify security answer
    if (adminSettings.security_answer_hash !== providedAnswerHash) {
      console.log('Security answer mismatch for user:', user.id)

      // Update or create attempt record
      const newAttemptCount = (attempts?.attempts || 0) + 1
      const isLocked = newAttemptCount >= 3
      const lockUntil = isLocked ? new Date(now.getTime() + 15 * 60 * 1000) : null // 15 minutes

      if (attempts) {
        await supabaseClient
          .from('pin_reset_attempts')
          .update({
            attempts: newAttemptCount,
            last_attempt_at: now.toISOString(),
            locked_until: lockUntil?.toISOString() || null
          })
          .eq('id', attempts.id)
      } else {
        await supabaseClient
          .from('pin_reset_attempts')
          .insert({
            user_id: user.id,
            admin_email: adminEmail,
            attempts: newAttemptCount,
            last_attempt_at: now.toISOString(),
            locked_until: lockUntil?.toISOString() || null
          })
      }

      // Log failed attempt
      await supabaseClient.from('activities').insert({
        user_id: user.id,
        type: 'admin_pin_reset_failed',
        description: `Failed PIN reset attempt via security question (attempt ${newAttemptCount}/3)`,
        details: {
          adminEmail: adminEmail,
          attemptNumber: newAttemptCount,
          locked: isLocked,
          attemptTime: now.toISOString()
        }
      })

      const remainingAttempts = Math.max(0, 3 - newAttemptCount)
      const errorMessage = isLocked 
        ? 'Too many failed attempts. Account locked for 15 minutes.'
        : `Incorrect security answer. ${remainingAttempts} attempts remaining.`

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Security answer is correct, reset the PIN
    const newPinHash = await hashPassword(newPin)

    // Update admin settings with new PIN
    const { error: updateError } = await supabaseClient
      .from('admin_settings')
      .update({ pin_hash: newPinHash })
      .eq('owner_user_id', user.id)

    if (updateError) {
      console.log('Failed to update PIN:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update PIN' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Clear any existing attempt records
    if (attempts) {
      await supabaseClient
        .from('pin_reset_attempts')
        .delete()
        .eq('id', attempts.id)
    }

    // Log successful PIN reset
    await supabaseClient.from('activities').insert({
      user_id: user.id,
      type: 'admin_pin_reset',
      description: 'Admin PIN reset successfully via security question',
      details: {
        adminEmail: adminEmail,
        resetTime: now.toISOString(),
        method: 'security_question'
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'PIN reset successfully' 
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