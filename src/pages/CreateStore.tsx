import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useStore } from '@/contexts/StoreContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Store, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateStore: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeName: '',
        storeEmail: '',
        whatsappNumber: '',
    });

    const { user } = useAuth();
    const { refreshStores } = useStore();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            // 1. Create the store
            const { data: store, error: storeError } = await supabase
                .from('stores')
                .insert({
                    owner_user_id: user.id,
                    store_name: formData.storeName,
                    store_email: formData.storeEmail || null,
                    whatsapp_number: formData.whatsappNumber || null,
                })
                .select()
                .single();

            if (storeError) throw storeError;

            // 2. Create the owner role
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                    user_id: user.id,
                    store_id: store.id,
                    role: 'owner',
                    is_active: true
                });

            if (roleError) throw roleError;

            // 3. Refresh context and redirect
            await refreshStores();

            toast({
                title: "Store Created!",
                description: "Your new store has been successfully set up.",
            });

            navigate('/');

        } catch (error: any) {
            console.error('Error creating store:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to create store",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto p-4 flex items-center justify-center min-h-[80vh]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Store className="w-6 h-6 text-primary" />
                            <span>Create Your Store</span>
                        </CardTitle>
                        <CardDescription>
                            Set up your first store to start selling. You can create more stores later.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="storeName">Store Name *</Label>
                                <Input
                                    id="storeName"
                                    value={formData.storeName}
                                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                                    placeholder="e.g. My Awesome Shop"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="storeEmail">Store Email (Optional)</Label>
                                <Input
                                    id="storeEmail"
                                    type="email"
                                    value={formData.storeEmail}
                                    onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                                    placeholder="contact@myshop.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
                                <Input
                                    id="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                                    placeholder="+1234567890"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || !formData.storeName.trim()}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Create Store
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default CreateStore;
