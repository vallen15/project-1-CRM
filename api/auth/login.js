import { ensureProfile, json, requestSupabase, writeSessionCookies } from '../_auth.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { message: 'Method not allowed' });
  try {
    const loginResponse = await requestSupabase('/token?grant_type=password', {
      method: 'POST', body: JSON.stringify(request.body)
    });
    const payload = await loginResponse.json();
    if (!loginResponse.ok) return json(response, loginResponse.status, { message: payload.error_description || payload.msg || 'Login failed' });
    writeSessionCookies(response, payload);
    await ensureProfile(payload);
    return json(response, 200, { user: payload.user });
  } catch (error) {
    return json(response, 500, { message: error.message });
  }
}
