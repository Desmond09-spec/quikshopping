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

    const { adminEmail, pin } = await req.json()

    if (!adminEmail || !pin) {
      return new Response(
        JSON.stringify({ error: 'Admin email and PIN are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate PIN (at least 4 digits)
    if (!/^\d{4,}$/.test(pin)) {
      return new Response(
        JSON.stringify({ error: 'PIN must be at least 4 digits' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Hash the PIN
    const pinHash = await hashPassword(pin)

    // Insert admin settings
    const { data, error } = await supabaseClient
      .from('admin_settings')
      .insert({
        owner_user_id: user.id,
        admin_email: adminEmail,
        pin_hash: pinHash
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating admin settings:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to setup admin' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the admin setup activity
    await supabaseClient.from('activities').insert({
      user_id: user.id,
      type: 'admin_setup',
      description: 'Admin settings configured',
      details: {
        adminEmail: adminEmail,
        setupDate: new Date().toISOString()
      }
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Admin setup completed' }),
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