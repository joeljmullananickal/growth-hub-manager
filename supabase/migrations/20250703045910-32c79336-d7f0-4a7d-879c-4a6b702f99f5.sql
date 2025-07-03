-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the followup reminders to run every day at 9 AM
SELECT cron.schedule(
  'daily-followup-reminders',
  '0 9 * * *', -- 9 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://fvhmqxesuunhriwcnxhw.supabase.co/functions/v1/send-followup-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2aG1xeGVzdXVuaHJpd2NueGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDU4MTYsImV4cCI6MjA2NzAyMTgxNn0.Qe_2mOIDD_mBv7XEfVXaOZRn2lXhxsnWH5ov_nBXYQ8"}'::jsonb,
        body:=concat('{"scheduled_time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);