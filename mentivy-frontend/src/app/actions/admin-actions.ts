'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { API_BASE_URL } from '@/lib/config';

async function serverActionRequest(endpoint: string, method: string, body?: any) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': refreshToken ? `refreshToken=${refreshToken}` : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Server action failed');
  }

  return response.json();
}

// ─── TOPICS ───────────────────────────────────────────────────────────────────

export async function adminGetTopics() {
  try {
    const result = await serverActionRequest('/admin/topics', 'GET');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminCreateTopic(data: any) {
  try {
    const result = await serverActionRequest('/admin/topics', 'POST', data);
    revalidatePath('/admin');
    revalidatePath('/admin/content');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUpdateTopic(id: string, data: any) {
  try {
    const result = await serverActionRequest(`/admin/topics/${id}`, 'PUT', data);
    revalidatePath('/admin');
    revalidatePath('/admin/content');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteTopic(id: string) {
  try {
    const result = await serverActionRequest(`/admin/topics/${id}`, 'DELETE');
    revalidatePath('/admin');
    revalidatePath('/admin/content');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── QUESTIONS ────────────────────────────────────────────────────────────────

export async function adminGetQuestions(topicId?: string, search?: string, difficulty?: string) {
  try {
    const params = new URLSearchParams();
    if (topicId) params.append('topicId', topicId);
    if (search) params.append('search', search);
    if (difficulty && difficulty !== 'ALL') params.append('difficulty', difficulty);

    const qs = params.toString();
    const endpoint = qs ? `/admin/questions?${qs}` : '/admin/questions';
    const result = await serverActionRequest(endpoint, 'GET');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminCreateQuestion(data: any) {
  try {
    const result = await serverActionRequest('/admin/questions', 'POST', data);
    revalidatePath('/admin');
    revalidatePath('/admin/content');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUpdateQuestion(id: string, data: any) {
  try {
    const result = await serverActionRequest(`/admin/questions/${id}`, 'PUT', data);
    revalidatePath('/admin');
    revalidatePath('/admin/content');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteQuestion(id: string) {
  try {
    const result = await serverActionRequest(`/admin/questions/${id}`, 'DELETE');
    revalidatePath('/admin');
    revalidatePath('/admin/content');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminBulkImportQuestions(payload: { topicId: string; questions: any[] }) {
  try {
    const result = await serverActionRequest('/admin/questions/bulk', 'POST', payload);
    revalidatePath('/admin');
    revalidatePath('/admin/content');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── FIELDS ───────────────────────────────────────────────────────────────────

export async function adminGetFields() {
  try {
    const result = await serverActionRequest('/admin/fields', 'GET');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

export async function adminGetUsers(params?: { search?: string; role?: string; page?: number; limit?: number }) {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role && params.role !== 'ALL') query.append('role', params.role);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = qs ? `/admin/users?${qs}` : '/admin/users';
    const result = await serverActionRequest(endpoint, 'GET');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminUpdateUserRole(userId: string, role: string, assignedFields?: string[]) {
  try {
    const result = await serverActionRequest(`/admin/users/${userId}/role`, 'PATCH', { role, assignedFields });
    revalidatePath('/admin/users');
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
