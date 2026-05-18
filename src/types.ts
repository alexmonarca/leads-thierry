export type LeadStatus = 'novo' | 'contactado' | 'respondido' | 'agendado' | 'fechado' | 'perdido';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  source?: string;
  last_contact_at?: string;
  created_at: string;
}

export interface MessageLog {
  id: string;
  lead_id: string;
  message_text: string;
  sent_at: string;
  user_id?: string;
}

export interface Task {
  id: string;
  lead_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface AppState {
  leads: Lead[];
  dailyCount: number;
  loading: boolean;
  theme: 'light' | 'dark';
}
