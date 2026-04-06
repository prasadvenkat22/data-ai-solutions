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

export interface DeviceCreate {
  customer_id: number;
  device_type?: string;
  serial_number?: string;
  model?: string;
  firmware_version?: string;
  status?: string;
}

export interface DeviceResponse extends DeviceCreate {
  id: number;
  created_at?: string;
}

export interface TransactionCreate {
  amount: number;
  category: string;
  description: string;
  is_income: boolean;
  date: string;
  user_id?: number;
  customer_id?: number;
}

export interface TransactionResponse extends TransactionCreate {
  id: number;
  created_at?: string;
}

export interface InvoiceCreate {
  customer_id: number;
  service_request_id?: number;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export interface InvoiceResponse extends InvoiceCreate {
  id: number;
  created_at?: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
  sku?: string;
  is_active?: boolean;
}

export interface ProductResponse extends ProductCreate {
  id: number;
  created_at?: string;
}

export interface RoleCreate {
  role: 'user' | 'admin';
  desc: string;
}

export interface RoleResponse extends RoleCreate {
  id: number;
  created_at?: string;
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
