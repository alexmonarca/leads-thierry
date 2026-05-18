/* 
  SQL Schema for IARA CRM - Supabase
  Execute this in the Supabase SQL Editor to set up your database.
*/

-- 1. Create LEADS table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'novo', -- novo, contactado, respondido, agendado, fechado, perdido
  source TEXT,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create MESSAGES_LOG table
CREATE TABLE IF NOT EXISTS messages_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID -- if using Supabase Auth
);

-- 3. Create TASKS table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, completed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages_log(sent_at);

-- 5. Helper function to get daily count
CREATE OR REPLACE FUNCTION get_daily_message_count(input_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM messages_log WHERE sent_at::DATE = input_date);
END;
$$ LANGUAGE plpgsql;

-- 6. Insert initial sample leads (Optional)
-- INSERT INTO leads (name, phone, status) VALUES 
-- ('João Silva', '11999999999', 'novo'),
-- ('Maria Oliveira', '11888888888', 'novo');
