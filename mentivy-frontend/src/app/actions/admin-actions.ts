'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

async function serverActionRequest(endpoint: string, method: string, body?: any) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
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
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteTopic(id: string) {
  try {
    const result = await serverActionRequest(`/admin/topics/${id}`, 'DELETE');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminGetQuestions(topicId?: string) {
  try {
    const endpoint = topicId ? `/admin/questions?topicId=${topicId}` : '/admin/questions';
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
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminDeleteQuestion(id: string) {
  try {
    const result = await serverActionRequest(`/admin/questions/${id}`, 'DELETE');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
