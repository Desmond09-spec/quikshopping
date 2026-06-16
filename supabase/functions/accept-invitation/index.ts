import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AcceptInvitationRequest {
  action?: 'get_details' | 'accept';
  invitation_token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Read body
    const body: AcceptInvitationRequest = await req.json();
    const { action, invitation_token } = body;

    if (!invitation_token) {
      return new Response(JSON.stringify({ error: "No invitation token provided" }), { status: 400, headers: corsHeaders });
    }

    if (action === 'get_details') {
      const { data: invitation, error: inviteError } = await supabase
        .from("store_invitations")
        .select("email, phone_number, role, expires_at, created_at, accepted_at, invited_by, stores(store_name)")
        .eq("invitation_token", invitation_token)
        .single();
        
      if (inviteError || !invitation) {
        return new Response(JSON.stringify({ error: "Invitation not found", details: inviteError }), { status: 404, headers: corsHeaders });
      }

      // Securely fetch the inviter's details using the Admin API to avoid cross-schema join crashes
      let invited_by_user = null;
      if (invitation.invited_by) {
        const { data: userData } = await supabase.auth.admin.getUserById(invitation.invited_by);
        if (userData && userData.user) {
          invited_by_user = {
            email: userData.user.email,
            raw_user_meta_data: userData.user.user_metadata
          };
        }
      }

      return new Response(JSON.stringify({ ...invitation, invited_by_user }), { status: 200, headers: corsHeaders });
    }

    // Default action: accept
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    console.log("Accepting invitation:", { invitation_token, user_id: user.id });

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from("store_invitations")
      .select("*, stores(store_name)")
      .eq("invitation_token", invitation_token)
      .single();

    if (inviteError || !invitation) {
      return new Response(JSON.stringify({ error: "Invitation not found" }), { status: 200, headers: corsHeaders });
    }

    // Validate invitation
    if (invitation.accepted_at) {
      return new Response(JSON.stringify({ error: "Invitation already accepted" }), { status: 200, headers: corsHeaders });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Invitation has expired" }), { status: 200, headers: corsHeaders });
    }

    // We no longer strictly verify email. The invitation_token acts as a single-use Golden Ticket.

    // Check if user already has a role in this store
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id, is_active")
      .eq("user_id", user.id)
      .eq("store_id", invitation.store_id)
      .maybeSingle();

    if (existingRole) {
      if (existingRole.is_active) {
        return new Response(JSON.stringify({ error: "You already belong to this store" }), { status: 200, headers: corsHeaders });
      } else {
        // User was previously in the store but was removed (soft-deleted). Reactivate them!
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({
            role: invitation.role,
            invited_by: invitation.invited_by,
            invited_at: invitation.created_at,
            accepted_at: new Date().toISOString(),
            is_active: true,
          })
          .eq("id", existingRole.id);

        if (roleError) {
          console.error("Error reactivating user role:", roleError);
          return new Response(JSON.stringify({ error: "Failed to reactivate user role", details: roleError }), { status: 200, headers: corsHeaders });
        }
      }
    } else {
      // Create a brand new user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          store_id: invitation.store_id,
          role: invitation.role,
          invited_by: invitation.invited_by,
          invited_at: invitation.created_at,
          accepted_at: new Date().toISOString(),
          is_active: true,
        });

      if (roleError) {
        console.error("Error creating user role:", roleError);
        return new Response(JSON.stringify({ error: "Failed to create user role", details: roleError }), { status: 200, headers: corsHeaders });
      }
    }

    // Mark invitation as accepted
    const { data: updateData, error: updateError } = await supabase
      .from("store_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id)
      .select();

    if (updateError || !updateData || updateData.length === 0) {
      console.error("CRITICAL Error updating invitation:", updateError, "Data:", updateData);
    } else {
      console.log("Invitation updated successfully", updateData);
    }

    // Log activity
    await supabase.from("activities").insert({
      type: "team_member_joined",
      description: `${user.user_metadata?.full_name || user.email} joined as ${invitation.role}`,
      user_id: user.id,
      store_id: invitation.store_id,
    });

    console.log("Invitation accepted successfully");

    return new Response(
      JSON.stringify({
        success: true,
        store_id: invitation.store_id,
        store_name: invitation.stores?.store_name,
        role: invitation.role,
        message: "Successfully joined store",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in accept-invitation:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

serve(handler);
