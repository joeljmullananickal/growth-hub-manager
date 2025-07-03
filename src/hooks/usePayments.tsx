import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Payment {
  id: string;
  client_id: string;
  amount: number;
  gst_amount: number | null;
  total_amount: number;
  currency: string;
  subscription_plan: 'monthly' | '3_month' | '6_month' | 'yearly';
  payment_status: 'paid' | 'unpaid' | 'invoiced';
  last_paid_date: string | null;
  last_paid_amount: number | null;
  next_renewal_date: string | null;
  need_gst_bill: boolean | null;
  commission: number | null;
  payment_remarks: string | null;
  created_at: string;
  updated_at: string;
  clients: {
    name: string;
    contact_person_name: string;
  };
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPayments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            name,
            contact_person_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData: {
    client_id: string;
    amount: number;
    subscription_plan: 'monthly' | '3_month' | '6_month' | 'yearly';
    currency?: string;
    need_gst_bill?: boolean;
    commission?: number;
    payment_remarks?: string;
    last_paid_date?: string;
    last_paid_amount?: number;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          user_id: user.id,
          currency: paymentData.currency || 'USD',
          total_amount: paymentData.amount, // Initially set total_amount same as amount, GST will be calculated by trigger
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment created successfully",
      });

      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to create payment",
        variant: "destructive",
      });
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment updated successfully",
      });

      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive",
      });
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });

      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  return {
    payments,
    loading,
    createPayment,
    updatePayment,
    deletePayment,
    refetch: fetchPayments,
  };
}