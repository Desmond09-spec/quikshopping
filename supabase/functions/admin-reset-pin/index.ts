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

    const { newPin } = await req.json()

    if (!newPin) {
      return new Response(
        JSON.stringify({ error: 'New PIN is required' }),
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
      return new Response(
        JSON.stringify({ error: 'Admin not configured' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Hash the new PIN
    const newPinHash = await hashPassword(newPin)

    // Update admin settings
    const { error: updateError } = await supabaseClient
      .from('admin_settings')
      .update({ pin_hash: newPinHash })
      .eq('owner_user_id', user.id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update PIN' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log PIN reset activity
    await supabaseClient.from('activities').insert({
      user_id: user.id,
      type: 'admin_pin_reset',
      description: 'Admin PIN reset via email OTP',
      details: {
        adminEmail: adminSettings.admin_email,
        resetTime: new Date().toISOString()
      }
    })

    return new Response(
      JSON.stringify({ success: true, message: 'PIN reset successfully' }),
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