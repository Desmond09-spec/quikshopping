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

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
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

    const { pin } = await req.json()

    if (!pin) {
      return new Response(
        JSON.stringify({ error: 'PIN is required' }),
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

    // Verify PIN
    const isValid = await verifyPassword(pin, adminSettings.pin_hash)

    if (!isValid) {
      // Log failed attempt
      await supabaseClient.from('activities').insert({
        user_id: user.id,
        type: 'admin_signin_failed',
        description: 'Admin sign-in failed - incorrect PIN',
        details: {
          attemptTime: new Date().toISOString(),
          adminEmail: adminSettings.admin_email
        }
      })

      return new Response(
        JSON.stringify({ error: 'Invalid PIN' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create admin session token (expires in 30 minutes)
    const sessionToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Log successful signin
    await supabaseClient.from('activities').insert({
      user_id: user.id,
      type: 'admin_signin',
      description: 'Admin signed in successfully',
      details: {
        adminEmail: adminSettings.admin_email,
        sessionToken: sessionToken,
        expiresAt: expiresAt.toISOString()
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        adminSettings: {
          disableCashierDialog: adminSettings.disable_cashier_dialog,
          requireAdminForProductActions: adminSettings.require_admin_for_product_actions,
          deviceCacheEnabled: adminSettings.device_cache_enabled
        }
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