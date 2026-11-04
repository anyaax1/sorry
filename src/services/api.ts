export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_BASE) throw new Error('The site service is not configured.');
  const timeout = AbortSignal.timeout(30000);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  const response = await fetch(`${API_BASE}${path}`, { ...init, signal });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(typeof error.error === 'string' ? error.error : `Service unavailable (${response.status})`);
  }
  return response;
}
