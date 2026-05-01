import { cookies } from 'next/headers';

/**
 * A server-side fetch helper that forwards the session cookies 
 * from the browser to the backend API.
 */
export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
  
  const headers = new Headers(options.headers);
  if (refreshToken) {
    headers.set('Cookie', `refreshToken=${refreshToken}`);
  }
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    // Ensure we don't cache personalized data
    cache: 'no-store',
  });

  if (!response.ok) {
    // If it's a 401, the middleware will eventually handle redirecting to /login
    // but here we just return the error
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server fetch failed with status ${response.status}`);
  }

  return response.json();
}
