const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://142.93.177.153';

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
}

async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  users: {
    list: () => apiGet<any[]>('/CRUD/users/'),
    get: (id: number) => apiGet<any>(`/CRUD/users/${id}`),
    register: (data: any) => apiPost<any>('/CRUD/register/', data),
  },
  customers: {
    list: () => apiGet<any[]>('/CRUD/customers/'),
    get: (id: number) => apiGet<any>(`/CRUD/customers/${id}`),
    create: (data: any) => apiPost<any>('/CRUD/customers/', data),
    update: (id: number, data: any) => apiPut<any>(`/CRUD/customers/${id}`, data),
    delete: (id: number) => apiDelete(`/CRUD/customers/${id}`),
  },
  services: {
    list: () => apiGet<any[]>('/CRUD/services/'),
    create: (data: any) => apiPost<any>('/CRUD/services/', data),
  },
  registrations: {
    list: () => apiGet<any[]>('/CRUD/registrations/'),
    create: (data: any) => apiPost<any>('/CRUD/registrations/', data),
  },
  serviceRequests: {
    list: () => apiGet<any[]>('/CRUD/service-requests/'),
    get: (id: number) => apiGet<any>(`/CRUD/service-requests/${id}`),
    create: (data: any) => apiPost<any>('/CRUD/service-requests/', data),
    updateStatus: (id: number, status: string) =>
      apiPut<any>(`/CRUD/service-requests/${id}/status`, { status }),
  },
  roles: {
    list: () => apiGet<any[]>('/CRUD/roles/'),
  },
};

export async function genaiLLM(prompt: string) {
  return apiPost<{ content: string; metadata: Record<string, unknown> }>('/api/genai/llm', {
    prompt,
    llm_provider: 'openai',
    llm_model: 'gpt-4o-mini',
    temperature: 0.0,
    max_tokens: 800,
  });
}

export async function genaiQueryUpload(files: File[], query: string) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('query', query);
  formData.append('username', 'web_user');
  formData.append('llm_model', 'gpt-4o-mini');
  formData.append('max_tokens', '512');
  return apiUpload<{ results: Array<{ id?: string; content: string; score?: number }> }>(
    '/api/genai/query/upload',
    formData
  );
}
