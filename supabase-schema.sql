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

-- 7. Row Level Security (RLS) Policies
-- By default, newly created tables in Supabase may have RLS enabled automatically.
-- Run these commands in your Supabase SQL Editor to make sure updates and inserts are authorized!

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent duplicates
DROP POLICY IF EXISTS "Permitir leitura para todos" ON leads;
DROP POLICY IF EXISTS "Permitir insercao para todos" ON leads;
DROP POLICY IF EXISTS "Permitir atualizacao para todos" ON leads;
DROP POLICY IF EXISTS "Permitir a todos ler logs de mensagens" ON messages_log;
DROP POLICY IF EXISTS "Permitir a todos inserir logs de mensagens" ON messages_log;
DROP POLICY IF EXISTS "Permitir a todos ler tarefas" ON tasks;
DROP POLICY IF EXISTS "Permitir a todos cadastrar tarefas" ON tasks;
DROP POLICY IF EXISTS "Permitir a todos atualizar tarefas" ON tasks;

-- Create simple permissive policies for development/production access
CREATE POLICY "Permitir leitura para todos" ON leads FOR SELECT USING (true);
CREATE POLICY "Permitir insercao para todos" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao para todos" ON leads FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Permitir a todos ler logs de mensagens" ON messages_log FOR SELECT USING (true);
CREATE POLICY "Permitir a todos inserir logs de mensagens" ON messages_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir a todos ler tarefas" ON tasks FOR SELECT USING (true);
CREATE POLICY "Permitir a todos cadastrar tarefas" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir a todos atualizar tarefas" ON tasks FOR UPDATE USING (true) WITH CHECK (true);

