import { getConfig, getUserFromRequest, json } from './_auth.js';

const preferencesUrl = (url, userId) =>
  `${url}/rest/v1/user_preferences?user_id=eq.${encodeURIComponent(userId)}`;

export default async function handler(request, response) {
  try {
    const session = await getUserFromRequest(request, response);
    if (!session) return json(response, 401, { message: 'Authentication required' });
    const { url, key } = getConfig();
    const headers = { apikey: key, Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' };

    if (request.method === 'GET') {
      const dbResponse = await fetch(`${preferencesUrl(url, session.user.id)}&select=active_tab,sidebar_collapsed`, { headers });
      const data = await dbResponse.json();
      if (!dbResponse.ok) return json(response, dbResponse.status, { message: data.message || 'Unable to load preferences' });
      return json(response, 200, { preferences: data[0] || null });
    }

    if (request.method === 'PUT') {
      const dbResponse = await fetch(`${url}/rest/v1/user_preferences?on_conflict=user_id`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ user_id: session.user.id, ...request.body, updated_at: new Date().toISOString() })
      });
      const data = await dbResponse.json();
      if (!dbResponse.ok) return json(response, dbResponse.status, { message: data.message || 'Unable to save preferences' });
      return json(response, 200, { preferences: data[0] || null });
    }

    return json(response, 405, { message: 'Method not allowed' });
  } catch (error) {
    return json(response, 500, { message: error.message });
  }
}
