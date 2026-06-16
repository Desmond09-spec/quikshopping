import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: "manager" | "cashier";
  store_id: string;
  personal_message?: string;
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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, role, store_id, personal_message }: InvitationRequest = await req.json();

    console.log("Sending invitation:", { email, role, store_id, invited_by: user.id });

    // Verify user is store owner
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("store_name, owner_user_id")
      .eq("id", store_id)
      .single();

    if (storeError || !store) {
      return new Response(
        JSON.stringify({ error: "Store not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (store.owner_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Only store owners can send invitations" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invitation already exists
    const { data: existingInvite } = await supabase
      .from("store_invitations")
      .select("id")
      .eq("store_id", store_id)
      .eq("email", email)
      .is("accepted_at", null)
      .single();

    let invitation_token: string;

    if (existingInvite) {
      // Use existing invitation
      const { data: inviteData } = await supabase
        .from("store_invitations")
        .select("invitation_token")
        .eq("id", existingInvite.id)
        .single();
      
      invitation_token = inviteData!.invitation_token;
      
      console.log("Resending existing invitation:", existingInvite.id);
    } else {
      // Create new invitation
      const { data: newInvite, error: inviteError } = await supabase
        .from("store_invitations")
        .insert({
          store_id,
          email,
          role,
          invited_by: user.id,
        })
        .select("invitation_token")
        .single();

      if (inviteError) {
        console.error("Error creating invitation:", inviteError);
        return new Response(
          JSON.stringify({ error: inviteError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      invitation_token = newInvite.invitation_token;
      console.log("Created new invitation:", newInvite);
    }

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const inviteUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}/accept-invite/${invitation_token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p><strong>${user.user_metadata?.full_name || user.email}</strong> has invited you to join <strong>${store.store_name}</strong> as a <strong>${role}</strong>.</p>
              
              ${personal_message ? `<div class="info-box"><p><em>"${personal_message}"</em></p></div>` : ''}
              
              <div class="info-box">
                <h3>What you'll be able to do:</h3>
                <ul>
                  ${role === 'manager' 
                    ? '<li>✓ Manage products and inventory</li><li>✓ Process sales transactions</li><li>✓ View detailed reports</li><li>✓ Manage team members</li>' 
                    : '<li>✓ Process sales transactions</li><li>✓ View inventory</li><li>✓ Access sales reports</li><li>✓ Use barcode scanner (on terminal)</li>'}
                </ul>
              </div>
              
              <center>
                <a href="${inviteUrl}" class="button">Join Store →</a>
              </center>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                This invitation will expire in 7 days. If you have any questions, contact ${user.email}.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Quik Shopping. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Quik Shopping <noreply@resend.dev>",
      to: [email],
      subject: `You're invited to join ${store.store_name}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send invitation email", details: emailError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation_token,
        message: "Invitation sent successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-cashier-invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
