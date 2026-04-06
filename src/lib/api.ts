const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

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
    delete: (id: number) => apiDelete(`/CRUD/users/${id}`),
  },
  customers: {
    list: () => apiGet<any[]>('/CRUD/customers/'),
    get: (id: number) => apiGet<any>(`/CRUD/customers/${id}`),
    create: (data: any) => apiPost<any>('/CRUD/customers/', data),
    update: (id: number, data: any) => apiPut<any>(`/CRUD/customers/${id}`, data),
    delete: (id: number) => apiDelete(`/CRUD/customers/${id}`),
  },
  devices: {
    list: () => apiGet<any[]>('/CRUD/devices/'),
    get: (id: number) => apiGet<any>(`/CRUD/devices/${id}`),
    create: (data: any) => apiPost<any>('/CRUD/devices/', data),
    delete: (id: number) => apiDelete(`/CRUD/devices/${id}`),
    byCustomer: (customerId: number) => apiGet<any[]>(`/CRUD/customers/${customerId}/devices`),
  },
  services: {
    list: () => apiGet<any[]>('/CRUD/services/'),
    create: (data: any) => apiPost<any>('/CRUD/services/', data),
    delete: (id: number) => apiDelete(`/CRUD/services/${id}`),
  },
  serviceRequests: {
    list: () => apiGet<any[]>('/CRUD/service-requests/'),
    get: (id: number) => apiGet<any>(`/CRUD/service-requests/${id}`),
    create: (data: any) => apiPost<any>('/CRUD/service-requests/', data),
    updateStatus: (id: number, status: string) =>
      apiPut<any>(`/CRUD/service-requests/${id}/status`, { status }),
    delete: (id: number) => apiDelete(`/CRUD/service-requests/${id}`),
  },
  transactions: {
    list: () => apiGet<any[]>('/CRUD/transactions/'),
    create: (data: any) => apiPost<any>('/CRUD/transactions/', data),
    delete: (id: number) => apiDelete(`/CRUD/transactions/${id}`),
  },
  invoices: {
    list: () => apiGet<any[]>('/CRUD/invoices/'),
    get: (id: number) => apiGet<any>(`/CRUD/invoices/${id}`),
    create: (data: any) => apiPost<any>('/CRUD/invoices/', data),
    delete: (id: number) => apiDelete(`/CRUD/invoices/${id}`),
  },
  products: {
    list: () => apiGet<any[]>('/CRUD/products/'),
    get: (id: number) => apiGet<any>(`/CRUD/products/${id}`),
    create: (data: any) => apiPost<any>('/CRUD/products/', data),
    delete: (id: number) => apiDelete(`/CRUD/products/${id}`),
  },
  roles: {
    list: () => apiGet<any[]>('/CRUD/roles/'),
    create: (data: any) => apiPost<any>('/CRUD/roles/', data),
    delete: (id: number) => apiDelete(`/CRUD/roles/${id}`),
  },
  registrations: {
    list: () => apiGet<any[]>('/CRUD/registrations/'),
    create: (data: any) => apiPost<any>('/CRUD/registrations/', data),
    delete: (id: number) => apiDelete(`/CRUD/registrations/${id}`),
  },
  images: {
    upload: (file: File, entity: string, id: number) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiUpload<{ entity: string; id: number; image_url: string }>(
        `/images/upload?entity=${entity}&id=${id}`,
        fd
      );
    },
    getUrl: (entity: string, id: number) => `${API_BASE}/static/${entity}s/${id}.png`,
    delete: (entity: string, id: number) => apiDelete(`/images/${entity}/${id}`),
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
