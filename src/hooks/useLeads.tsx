import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Lead {
  id: string;
  customer_name: string;
  contact_person: string;
  contact_number: string;
  country: string;
  place: string | null;
  reference: string | null;
  status: 'very_hot' | 'hot' | 'warm' | 'remove_close';
  status_remarks: string | null;
  next_followup_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (leadData: {
    customer_name: string;
    contact_person: string;
    contact_number: string;
    country: string;
    place?: string;
    reference?: string;
    status?: 'very_hot' | 'hot' | 'warm' | 'remove_close';
    status_remarks?: string;
    next_followup_date?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          user_id: user.id,
          status: leadData.status || 'warm',
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead created successfully",
      });

      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead updated successfully",
      });

      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });

      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  return {
    leads,
    loading,
    createLead,
    updateLead,
    deleteLead,
    refetch: fetchLeads,
  };
}