import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  country: string;
  state?: string;
  place?: string;
  currency: string;
  no_of_branches: number;
  activated_tax_module: boolean;
  gst_number?: string;
  contact_person_name: string;
  contact_number_1: string;
  contact_number_2?: string;
  email_id?: string;
  reference?: string;
  onboard_date: string;
  status: 'active' | 'discontinued' | 'hold';
  discontinue_reason?: string;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const addClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setClients(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding client:', error);
      return { error };
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating client:', error);
      return { error };
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClients(prev => prev.filter(client => client.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { error };
    }
  };

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
}