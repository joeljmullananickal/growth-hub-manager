import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Find all followups that are due today and pending
    const { data: dueFollowups, error } = await supabaseClient
      .from('payment_followups')
      .select(`
        *,
        clients (
          name,
          contact_person_name,
          contact_number_1,
          email_id
        )
      `)
      .eq('next_followup_date', today)
      .eq('followup_status', 'pending');

    if (error) {
      console.error('Error fetching due followups:', error);
      throw error;
    }

    console.log(`Found ${dueFollowups?.length || 0} due followups for ${today}`);

    const results = [];

    for (const followup of dueFollowups || []) {
      try {
        let success = false;
        let message = '';

        switch (followup.followup_mode) {
          case 'email':
            if (followup.clients.email_id) {
              const emailResult = await sendEmailReminder(followup);
              success = emailResult.success;
              message = emailResult.message;
            } else {
              message = 'No email address available';
            }
            break;

          case 'whatsapp':
            const whatsappResult = await sendWhatsAppReminder(followup);
            success = whatsappResult.success;
            message = whatsappResult.message;
            break;

          case 'phone':
            // For phone, we just log it as we can't automate actual calls
            message = 'Phone reminder logged - manual call required';
            success = true;
            break;

          default:
            message = 'Unknown followup mode';
        }

        results.push({
          followup_id: followup.id,
          client_name: followup.clients.name,
          mode: followup.followup_mode,
          success,
          message,
        });

        // Update the followup status if successful
        if (success) {
          await supabaseClient
            .from('payment_followups')
            .update({ 
              followup_status: 'completed',
              followup_remarks: `${followup.followup_remarks || ''}\n\nAuto-reminder sent on ${today}: ${message}`.trim()
            })
            .eq('id', followup.id);
        }

      } catch (error) {
        console.error(`Error processing followup ${followup.id}:`, error);
        results.push({
          followup_id: followup.id,
          client_name: followup.clients.name,
          mode: followup.followup_mode,
          success: false,
          message: `Error: ${error.message}`,
        });
      }
    }

    return new Response(JSON.stringify({
      message: `Processed ${results.length} followup reminders`,
      results,
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-followup-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendEmailReminder(followup: any) {
  try {
    const emailResponse = await resend.emails.send({
      from: "Growth Hub Manager <onboarding@resend.dev>",
      to: [followup.clients.email_id],
      subject: "Payment Follow-up Reminder",
      html: `
        <h2>Dear ${followup.clients.contact_person_name},</h2>
        <p>This is a friendly reminder regarding your payment follow-up.</p>
        <p><strong>Company:</strong> ${followup.clients.name}</p>
        <p><strong>Remarks:</strong> ${followup.followup_remarks || 'No additional remarks'}</p>
        <p>Please contact us if you have any questions or need assistance.</p>
        <p>Best regards,<br>Growth Hub Manager Team</p>
      `,
    });

    return {
      success: true,
      message: `Email sent successfully to ${followup.clients.email_id}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    };
  }
}

async function sendWhatsAppReminder(followup: any) {
  try {
    // WhatsApp integration using Twilio
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsAppFrom = Deno.env.get("TWILIO_WHATSAPP_FROM");
    console.log("Twilio WhatsApp From:", twilioWhatsAppFrom);
    console.log("Twilio Account SID:", twilioAccountSid);
    console.log("Twilio Auth Token:", twilioAuthToken);
    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppFrom) {
      return {
        success: false,
        message: "Twilio credentials not configured",
      };
    }

    const message = `Hello ${followup.clients.contact_person_name},\n\nThis is a payment follow-up reminder for ${followup.clients.name}.\n\n${followup.followup_remarks || 'Please contact us for payment details.'}\n\nBest regards,\nGrowth Hub Manager Team`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: twilioWhatsAppFrom,
          To: `whatsapp:+91${followup.clients.contact_number_1}`,
          Body: message,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.error_code) {
        // Twilio returned an error in the response body
        return {
          success: false,
          message: `Twilio error: ${data.message} (code: ${data.error_code})`,
        };
      }
      return {
        success: true,
        message: `WhatsApp message sent to ${followup.clients.contact_number_1}`,
      };
    } else {
      let errorData;
      try {
        errorData = await response.json();
        return {
          success: false,
          message: `Failed to send WhatsApp: ${errorData.message || JSON.stringify(errorData)}`,
        };
      } catch {
        errorData = await response.text();
        return {
          success: false,
          message: `Failed to send WhatsApp: ${errorData}`,
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `WhatsApp error: ${error.message}`,
    };
  }
}

serve(handler);