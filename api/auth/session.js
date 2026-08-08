import { ensureProfile, getUserFromRequest, json } from '../_auth.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return json(response, 405, { message: 'Method not allowed' });
  try {
    const session = await getUserFromRequest(request, response);
    if (!session) return json(response, 401, { message: 'No active session' });
    await ensureProfile({ user: session.user, access_token: session.accessToken });
    return json(response, 200, { user: session.user });
  } catch (error) {
    return json(response, 500, { message: error.message });
  }
}
