import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import InviteCashierDialog from './InviteCashierDialog';
import { UserPlus, Mail, Trash2, Clock, CheckCircle2, XCircle, Crown, Shield, User, Copy, Link as LinkIcon } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'cashier';
  user_email: string;
  user_phone?: string;
  user_name: string;
  joined_at: string;
  is_active: boolean;
}

interface PendingInvite {
  id: string;
  email?: string | null;
  phone_number?: string | null;
  role: 'manager' | 'cashier';
  created_at: string;
  expires_at: string;
  invited_by_name: string;
  invitation_token: string;
}

const TeamManagement: React.FC = () => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<PendingInvite | null>(null);
  const { activeStore, userRole } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    if (activeStore) {
      loadTeamData();
    }
  }, [activeStore]);

  const loadTeamData = async () => {
    if (!activeStore) return;

    setLoading(true);
    try {
      // Load team members using RPC to securely access auth.users
      const { data: membersData, error: membersError } = await supabase
        .rpc('get_store_team', { p_store_id: activeStore.id });

      if (membersError) throw membersError;

      const members: TeamMember[] = (membersData || []).map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        user_email: m.user_email || '',
        user_phone: m.user_phone || '',
        user_name: m.user_name || m.user_phone || m.user_email || '',
        joined_at: m.accepted_at,
        is_active: m.is_active,
      }));

      setTeamMembers(members);

      // Load pending invites (only if owner)
      if (userRole === 'owner') {
        const { data: invitesData, error: invitesError } = await supabase
          .from('store_invitations')
          .select(`
            id,
            email,
            phone_number,
            role,
            created_at,
            expires_at,
            invitation_token
          `)
          .eq('store_id', activeStore.id)
          .is('accepted_at', null);

        if (invitesError) throw invitesError;

        const invites: PendingInvite[] = (invitesData || []).map((i: any) => ({
          id: i.id,
          email: i.email,
          phone_number: i.phone_number,
          role: i.role,
          created_at: i.created_at,
          expires_at: i.expires_at,
          invited_by_name: 'Store Owner',
          invitation_token: i.invitation_token,
        }));

        setPendingInvites(invites);
      }

    } catch (error: any) {
      console.error('Error loading team data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !activeStore) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', memberToRemove.id);

      if (error) throw error;

      toast({
        title: 'Team Member Removed',
        description: `${memberToRemove.user_name} has been removed from the team`,
      });

      await loadTeamData();
      setMemberToRemove(null);

    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvite = async () => {
    if (!inviteToCancel) return;

    try {
      const { error } = await supabase
        .from('store_invitations')
        .delete()
        .eq('id', inviteToCancel.id);

      if (error) throw error;

      toast({
        title: 'Invitation Canceled',
        description: `Invitation link has been canceled`,
      });

      await loadTeamData();
      setInviteToCancel(null);

    } catch (error: any) {
      console.error('Error canceling invite:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />;
      case 'manager': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  if (!activeStore) return null;

  // Only owners can manage team
  if (userRole !== 'owner') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View your store's team members</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Only store owners can manage team members.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage your store's team members and invitations</CardDescription>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Invitations ({pendingInvites.length})
              </h3>
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <LinkIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">
                          {invite.phone_number || invite.email || "Pending Invite Link"}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Invited as {invite.role} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = `${window.location.origin}/accept-invite/${invite.invitation_token}?role=${invite.role}&store_name=${encodeURIComponent(activeStore.store_name)}&expires_at=${encodeURIComponent(invite.expires_at)}`;
                          navigator.clipboard.writeText(link);
                          toast({ title: "Copied!", description: "Invite link copied to clipboard" });
                        }}
                        title="Copy Invite Link"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground hover:text-primary transition-smooth" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInviteToCancel(invite)}
                        title="Cancel Invitation"
                      >
                        <XCircle className="w-4 h-4 text-destructive/70 hover:text-destructive transition-smooth" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Team Members */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Team Members ({teamMembers.length})
            </h3>
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading team members...</p>
              ) : teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No team members yet. Invite your first member!</p>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getRoleIcon(member.role)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.user_name}</span>
                        <span className="text-sm text-muted-foreground">{member.user_phone || member.user_email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      {member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <InviteCashierDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.user_name}</strong> from your team?
              They will lose access to the store immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive hover:bg-destructive/90">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invite Confirmation */}
      <AlertDialog open={!!inviteToCancel} onOpenChange={() => setInviteToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation to <strong>{inviteToCancel?.phone_number || inviteToCancel?.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelInvite}>
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamManagement;
