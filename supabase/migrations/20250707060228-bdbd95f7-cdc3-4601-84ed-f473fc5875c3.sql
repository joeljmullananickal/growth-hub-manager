-- Fix the create_payment_renewal_followups function to properly cast enum values
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
        'pending'::followup_status,
        'email'::followup_mode,
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