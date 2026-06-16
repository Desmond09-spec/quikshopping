import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Mail, UserPlus, Link as LinkIcon, Copy, Check, Phone, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InviteCashierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteCashierDialog: React.FC<InviteCashierDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [role, setRole] = useState<'cashier' | 'manager'>('cashier');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { activeStore } = useStore();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeStore) {
      toast({
        title: 'Error',
        description: 'No active store selected',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Just create a new invite directly. No need to check for existing
      // because we are generating a unique Golden Ticket token.
      const insertData: any = {
        store_id: activeStore.id,
        role,
        invited_by: user?.id,
      };

      const { data: newInvite, error: inviteError } = await supabase
        .from("store_invitations")
        .insert(insertData)
        .select("invitation_token, expires_at")
        .single();

      if (inviteError) throw inviteError;

      const token = newInvite.invitation_token;
      const expiresAt = newInvite.expires_at;

      const link = `${window.location.origin}/accept-invite/${token}?role=${role}&store_name=${encodeURIComponent(activeStore.store_name)}&expires_at=${encodeURIComponent(expiresAt)}`;
      setInviteLink(link);

      toast({
        title: 'Invitation Generated',
        description: `Golden Ticket link generated for ${role}`,
      });

    } catch (error: any) {
      console.error('Error generating invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Invite link copied to clipboard" });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setRole('cashier');
      setInviteLink(null);
      setCopied(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your store. They'll receive an email with a secure link.
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: 'cashier' | 'manager') => setRole(value)}>
                <SelectTrigger className="mt-1 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier" className="group py-2.5">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Cashier</span>
                      <span className="text-xs text-muted-foreground group-data-[highlighted]:text-accent-foreground/70 transition-colors">Process sales, view inventory</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="manager" className="group py-2.5">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Manager</span>
                      <span className="text-xs text-muted-foreground group-data-[highlighted]:text-accent-foreground/70 transition-colors">Full product & inventory access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate Invite Link'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Invitation Ready!</h3>
                <p className="text-sm text-muted-foreground">
                  Send this link to your team member so they can join your store.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex items-center space-x-2">
                <Input value={inviteLink} readOnly className="font-mono text-xs" />
                <Button variant="secondary" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                onClick={() => {
                  const message = encodeURIComponent(`Hi! You've been invited to join my store on Quik Shopping as a ${role}. Click this link to accept the invitation: ${inviteLink}`);
                  window.open(`https://wa.me/?text=${message}`, '_blank');
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share via WhatsApp
              </Button>
              <Button className="w-full" variant="outline" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteCashierDialog;
