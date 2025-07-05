import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Followup {
  id: string;
  client_id: string;
  payment_id: string | null;
  followup_status: 'pending' | 'completed' | 'scheduled';
  followup_mode: 'phone' | 'whatsapp' | 'email';
  followup_type: 'manual' | 'payment_renewal';
  is_renewal_reminder: boolean | null;
  next_followup_date: string | null;
  followup_remarks: string | null;
  created_at: string;
  updated_at: string;
  clients: {
    name: string;
    contact_person_name: string;
    contact_number_1: string;
    email_id: string | null;
  };
  payments?: {
    amount: number;
    next_renewal_date: string | null;
    subscription_plan: string;
  };
}

export function useFollowups() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFollowups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_followups')
        .select(`
          *,
          clients (
            name,
            contact_person_name,
            contact_number_1,
            email_id
          ),
          payments (
            amount,
            next_renewal_date,
            subscription_plan
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFollowups((data || []) as Followup[]);
    } catch (error) {
      console.error('Error fetching followups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch followups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFollowup = async (followupData: {
    client_id: string;
    payment_id?: string;
    followup_mode: 'phone' | 'whatsapp' | 'email';
    followup_type?: 'manual' | 'payment_renewal';
    next_followup_date?: string;
    followup_remarks?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('payment_followups')
        .insert({
          ...followupData,
          user_id: user.id,
          followup_type: followupData.followup_type || 'manual',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Followup created successfully",
      });

      fetchFollowups();
    } catch (error) {
      console.error('Error creating followup:', error);
      toast({
        title: "Error",
        description: "Failed to create followup",
        variant: "destructive",
      });
    }
  };

  const updateFollowup = async (id: string, updates: Partial<Followup>) => {
    try {
      const { error } = await supabase
        .from('payment_followups')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Followup updated successfully",
      });

      fetchFollowups();
    } catch (error) {
      console.error('Error updating followup:', error);
      toast({
        title: "Error",
        description: "Failed to update followup",
        variant: "destructive",
      });
    }
  };

  const deleteFollowup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_followups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Followup deleted successfully",
      });

      fetchFollowups();
    } catch (error) {
      console.error('Error deleting followup:', error);
      toast({
        title: "Error",
        description: "Failed to delete followup",
        variant: "destructive",
      });
    }
  };

  const generateRenewalFollowups = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('create_payment_renewal_followups');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Renewal followups generated successfully",
      });

      fetchFollowups();
    } catch (error) {
      console.error('Error generating renewal followups:', error);
      toast({
        title: "Error",
        description: "Failed to generate renewal followups",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [user]);

  return {
    followups,
    loading,
    createFollowup,
    updateFollowup,
    deleteFollowup,
    generateRenewalFollowups,
    refetch: fetchFollowups,
  };
}