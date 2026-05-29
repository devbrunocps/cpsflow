export type Company = {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string | null;
  business_type: string | null;
  logo_url: string | null;
  max_instances: number;
  created_at: string | null;
  updated_at: string | null;
};

export type User = {
  id: string;
  company_id: string;
  name: string | null;
  email: string;
  role: string | null;
  status: "pending" | "active" | "suspended";
  is_super_admin: boolean;
  created_at: string | null;
};

export type OpeningHours = Record<
  string,
  {
    active: boolean;
    open: string;
    close: string;
  }
>;

export type CompanySettings = {
  id: string;
  company_id: string;
  welcome_message: string | null;
  fallback_message: string | null;
  off_hours_message: string | null;
  opening_hours: OpeningHours | null;
  ai_persona: string | null;
  ai_tone: string | null;
  ai_expertise: string | null;
  ai_extra_context: string | null;
  ai_restrictions: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CompanyIntegration = {
  id: string;
  company_id: string;
  uazapi_base_url: string | null;
  uazapi_token: string | null;
  uazapi_instance: string | null;
  uazapi_status: string | null;
  label: string | null;
  active: boolean;
  n8n_webhook_url: string | null;
  webhook_secret: string;
  created_at: string | null;
  updated_at: string | null;
};



export type Product = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Faq = {
  id: string;
  company_id: string;
  question: string;
  answer: string;
  keywords: string[] | null;
  created_at: string | null;
  updated_at: string | null;
};

export type FlowStep = {
  id: string;
  flow_id: string;
  step_order: number;
  step_type: string;
  message: string | null;
  next_step_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

export type Flow = {
  id: string;
  company_id: string;
  name: string;
  trigger_type: string | null;
  trigger_keywords: string[] | null;
  priority: number | null;
  flow_type: 'custom' | 'template';
  template_slug: string | null;
  config: Record<string, unknown> | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  steps: FlowStep[];
};

export type FlowTemplateStep = {
  // New format (from updated templates)
  step_order?: number;
  step_type?: 'message' | 'question' | 'condition' | 'catalog' | 'end';
  message?: string;
  // Old format (legacy templates)
  order?: number;
  type?: 'message' | 'question' | 'condition' | 'catalog' | 'end';
  content?: string;
  // Shared
  save_as?: string;
  branches?: Record<string, string>;
  metadata?: Record<string, unknown>;
};

export type FlowConfigField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'boolean' | 'select';
  default: string | boolean;
  description?: string;
  options?: string[];
};

export type FlowTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  trigger_type: string;
  trigger_keywords: string[] | null;
  steps: FlowTemplateStep[];
  config_schema: FlowConfigField[];
  created_at: string | null;
};

export type Lead = {
  id: string;
  company_id: string;
  name: string | null;
  phone: string;
  current_status: string | null;
  last_interaction: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type LeadWithTags = Lead & {
  tags: Array<{ id: string; name: string; color: string | null }>;
  conversation_count: number;
};

export type Conversation = {
  id: string;
  company_id: string;
  lead_id: string | null;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
  metadata: Record<string, unknown> | null;
  human_handoff: boolean | null;
  assigned_agent_id: string | null;
  handoff_at: string | null;
};

export type ScheduleConfig = {
  id: string;
  company_id: string;
  availability: Record<string, { active: boolean; open: string; close: string }> | null;
  session_duration: number;
  interval_minutes: number;
  min_advance_hours: number;
  max_advance_days: number;
  created_at: string | null;
  updated_at: string | null;
};

export type Appointment = {
  id: string;
  company_id: string;
  lead_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  lead?: { name: string | null; phone: string } | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_type: string;
  content: string;
  message_type: string | null;
  created_at: string | null;
};

export type DashboardConversation = {
  id: string;
  customer: string;
  channel: string;
  intent: string;
  status: string;
  time: string;
};

export type DashboardOverview = {
  company: Company | null;
  settings: CompanySettings | null;
  stats: Array<{
    label: string;
    value: string;
    helper: string;
    tone: "emerald" | "sky" | "amber" | "slate";
  }>;
  recentConversations: DashboardConversation[];
  products: Product[];
  faqs: Faq[];
  flows: Flow[];
};
