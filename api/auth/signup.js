import { ensureProfile, json, requestSupabase, writeSessionCookies } from '../_auth.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { message: 'Method not allowed' });
  try {
    const signupResponse = await requestSupabase('/signup', { method: 'POST', body: JSON.stringify(request.body) });
    const payload = await signupResponse.json();
    if (!signupResponse.ok) return json(response, signupResponse.status, { message: payload.msg || 'Registration failed' });
    if (payload.session) {
      writeSessionCookies(response, payload.session);
      await ensureProfile(payload.session);
    }
    return json(response, 200, { user: payload.user, requiresEmailConfirmation: !payload.session });
  } catch (error) {
    return json(response, 500, { message: error.message });
  }
}
