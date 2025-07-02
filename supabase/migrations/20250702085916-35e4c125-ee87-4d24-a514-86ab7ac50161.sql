-- Create enum types
CREATE TYPE public.client_status AS ENUM ('active', 'discontinued', 'hold');
CREATE TYPE public.payment_status AS ENUM ('paid', 'unpaid', 'invoiced');
CREATE TYPE public.subscription_plan AS ENUM ('monthly', '3_month', '6_month', 'yearly');
CREATE TYPE public.followup_mode AS ENUM ('phone', 'whatsapp', 'email');
CREATE TYPE public.followup_status AS ENUM ('pending', 'completed', 'scheduled');
CREATE TYPE public.lead_status AS ENUM ('very_hot', 'hot', 'warm', 'remove_close');

-- Create clients table
CREATE TABLE public.clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    state TEXT,
    place TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    no_of_branches INTEGER DEFAULT 1,
    activated_tax_module BOOLEAN DEFAULT false,
    gst_number TEXT,
    contact_person_name TEXT NOT NULL,
    contact_number_1 TEXT NOT NULL,
    contact_number_2 TEXT,
    email_id TEXT,
    reference TEXT,
    onboard_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status client_status NOT NULL DEFAULT 'active',
    discontinue_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    subscription_plan subscription_plan NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    need_gst_bill BOOLEAN DEFAULT false,
    gst_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    commission DECIMAL(10,2),
    last_paid_amount DECIMAL(10,2),
    last_paid_date DATE,
    next_renewal_date DATE,
    payment_remarks TEXT,
    payment_status payment_status NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_followups table
CREATE TABLE public.payment_followups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
    followup_status followup_status NOT NULL DEFAULT 'pending',
    next_followup_date DATE,
    followup_mode followup_mode NOT NULL,
    followup_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    country TEXT NOT NULL,
    place TEXT,
    reference TEXT,
    contact_person TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    next_followup_date DATE,
    status_remarks TEXT,
    status lead_status NOT NULL DEFAULT 'warm',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Users can view their own clients" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON public.payments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" ON public.payments
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for payment_followups
CREATE POLICY "Users can view their own payment followups" ON public.payment_followups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment followups" ON public.payment_followups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment followups" ON public.payment_followups
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment followups" ON public.payment_followups
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for leads
CREATE POLICY "Users can view their own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_followups_updated_at
    BEFORE UPDATE ON public.payment_followups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-calculate GST
CREATE OR REPLACE FUNCTION public.calculate_gst_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.need_gst_bill = true THEN
        NEW.gst_amount = NEW.amount * 0.18;
        NEW.total_amount = NEW.amount + NEW.gst_amount;
    ELSE
        NEW.gst_amount = 0;
        NEW.total_amount = NEW.amount;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for GST calculation
CREATE TRIGGER calculate_gst_on_payment
    BEFORE INSERT OR UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_gst_amount();

-- Create function to auto-calculate next renewal date
CREATE OR REPLACE FUNCTION public.calculate_next_renewal_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_paid_date IS NOT NULL THEN
        CASE NEW.subscription_plan
            WHEN 'monthly' THEN
                NEW.next_renewal_date = NEW.last_paid_date + INTERVAL '1 month';
            WHEN '3_month' THEN
                NEW.next_renewal_date = NEW.last_paid_date + INTERVAL '3 months';
            WHEN '6_month' THEN
                NEW.next_renewal_date = NEW.last_paid_date + INTERVAL '6 months';
            WHEN 'yearly' THEN
                NEW.next_renewal_date = NEW.last_paid_date + INTERVAL '1 year';
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for renewal date calculation
CREATE TRIGGER calculate_renewal_date_on_payment
    BEFORE INSERT OR UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_next_renewal_date();