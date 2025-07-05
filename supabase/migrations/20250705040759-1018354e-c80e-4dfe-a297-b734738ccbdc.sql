-- Add followup_type to distinguish between manual and auto-renewal followups
ALTER TABLE public.payment_followups 
ADD COLUMN followup_type TEXT NOT NULL DEFAULT 'manual' CHECK (followup_type IN ('manual', 'payment_renewal'));

-- Add is_renewal_reminder to track if this is for payment renewal
ALTER TABLE public.payment_followups 
ADD COLUMN is_renewal_reminder BOOLEAN DEFAULT false;

-- Create function to auto-generate payment renewal followups
CREATE OR REPLACE FUNCTION public.create_payment_renewal_followups()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert followups for payments that need renewal within 30 days and don't already have active renewal followups
    INSERT INTO public.payment_followups (
        user_id,
        client_id,
        payment_id,
        followup_type,
        is_renewal_reminder,
        followup_status,
        followup_mode,
        next_followup_date,
        followup_remarks
    )
    SELECT DISTINCT
        p.user_id,
        p.client_id,
        p.id as payment_id,
        'payment_renewal',
        true,
        'pending',
        'email',
        (p.next_renewal_date - INTERVAL '2 days')::date,
        'Payment renewal due on ' || p.next_renewal_date || '. Please follow up for payment.'
    FROM public.payments p
    INNER JOIN public.clients c ON p.client_id = c.id
    WHERE p.next_renewal_date IS NOT NULL
    AND p.next_renewal_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
    AND p.payment_status != 'paid'
    AND NOT EXISTS (
        SELECT 1 FROM public.payment_followups pf 
        WHERE pf.payment_id = p.id 
        AND pf.followup_type = 'payment_renewal'
        AND pf.followup_status IN ('pending', 'scheduled')
    );
END;
$$;

-- Create function to remove renewal followups when payment is made
CREATE OR REPLACE FUNCTION public.cleanup_renewal_followups_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- If payment status changed to 'paid', remove pending renewal followups
    IF OLD.payment_status != 'paid' AND NEW.payment_status = 'paid' THEN
        UPDATE public.payment_followups 
        SET followup_status = 'completed',
            followup_remarks = COALESCE(followup_remarks, '') || E'\n\nAuto-completed: Payment received on ' || CURRENT_DATE
        WHERE payment_id = NEW.id 
        AND followup_type = 'payment_renewal'
        AND followup_status IN ('pending', 'scheduled');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to cleanup renewal followups when payment is made
CREATE TRIGGER cleanup_renewal_followups_trigger
    AFTER UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_renewal_followups_on_payment();