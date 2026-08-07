'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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

  // Forward cookies from backend response to the browser
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Split and set each cookie manually in Next.js cookie store
    const cookiesToSet = setCookieHeader.split(/,(?=[^;]+;)/);
    for (const cookieStr of cookiesToSet) {
      const [nameValue, ...parts] = cookieStr.split(';');
      if (!nameValue.includes('=')) continue;

      const [name, value] = nameValue.split('=');
      if (!name) continue;
      
      cookieStore.set(name.trim(), (value || '').trim(), {
        httpOnly: cookieStr.includes('HttpOnly'),
        secure: cookieStr.includes('Secure'),
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // Default 7 days
      });
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Server action failed');
  }

  return response.json();
}

export async function updateProfile(data: any) {
  try {
    const result = await serverActionRequest('/user/profile', 'PUT', data);
    
    // Clear onboarding cookie as it's now completed
    const cookieStore = await cookies();
    cookieStore.set('needsOnboarding', 'false', { maxAge: 7 * 24 * 60 * 60 });

    // Revalidate paths to update SSR data immediately
    revalidatePath('/dashboard');
    revalidatePath('/study-plan');
    revalidatePath('/settings');
    revalidatePath('/analytics');

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeOnboarding(data: any) {
  return updateProfile(data);
}

export async function registerUser(data: any) {
  try {
    const result = await serverActionRequest('/auth/register', 'POST', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyEmailAction(data: { email: string; otp: string }) {
  try {
    const result = await serverActionRequest('/auth/verify-email', 'POST', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resendOtpAction(data: { email: string }) {
  try {
    const result = await serverActionRequest('/auth/resend-otp', 'POST', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function loginUser(data: any) {
  try {
    const result = await serverActionRequest('/auth/login', 'POST', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function googleAuthAction(credential: string) {
  try {
    const result = await serverActionRequest('/auth/google', 'POST', { credential });
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    const result = await serverActionRequest('/auth/forgot-password', 'POST', { email });
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetPasswordAction(data: { email: string; otp: string; newPassword: string }) {
  try {
    const result = await serverActionRequest('/auth/reset-password', 'POST', data);
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changePasswordAction(data: { currentPassword: string; newPassword: string }) {
  try {
    const result = await serverActionRequest('/user/change-password', 'POST', data);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccountAction(data: { password?: string; confirmEmail?: string }) {
  try {
    const payload: { password?: string; confirmEmail?: string } = {};
    if (data.password && data.password !== '$undefined' && data.password.trim()) {
      payload.password = data.password.trim();
    }
    if (data.confirmEmail && data.confirmEmail !== '$undefined' && data.confirmEmail.trim()) {
      payload.confirmEmail = data.confirmEmail.trim();
    }

    const result = await serverActionRequest('/user/account', 'DELETE', payload);

    // Clear session cookies immediately
    const cookieStore = await cookies();
    cookieStore.delete('refreshToken');
    cookieStore.delete('needsOnboarding');

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}





