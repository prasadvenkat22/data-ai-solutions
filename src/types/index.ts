export interface UserCreate {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  created_date?: string;
}

export interface CustomerCreate {
  name: string;
  status: 'active' | 'inactive';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  billing_address?: string;
  tenant_id?: string;
}

export interface CustomerResponse extends CustomerCreate {
  id: number;
  created_at?: string;
  updated_at?: string;
}

export interface RegistrationBase {
  firstname: string;
  lastname: string;
  username: string;
  useremail: string;
  clientname: string;
  servicename: string;
  clientemail: string;
  contactphoneno: string;
  address: string;
  demodate: string;
  createdate: string;
  status?: 'requested' | 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ServiceCreate {
  name: string;
  description: string;
  DBName: 'postgres' | 'TenantOne' | 'TenantTwo';
  createdate: string;
  imageUrl?: string;
}

export interface ServiceRequestCreate {
  user_id: number;
  customer_id?: number;
  service_name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  amount?: number;
}

export interface ServiceRequestResponse extends ServiceRequestCreate {
  id: number;
  created_at?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  files?: string[];
}

export interface QueryResponse {
  results: Array<{
    id?: string;
    content: string;
    metadata?: Record<string, unknown>;
    score?: number;
  }>;
}

export interface LLMResponse {
  content: string;
  metadata?: Record<string, unknown>;
}
