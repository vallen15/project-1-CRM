import { getConfig, getUserFromRequest, json } from './_auth.js';

const dbRequest = async (url, key, token, path, options = {}) => fetch(`${url}/rest/v1${path}`, {
  ...options,
  headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
});

export default async function handler(request, response) {
  try {
    const session = await getUserFromRequest(request, response);
    if (!session) return json(response, 401, { message: 'Authentication required' });
    const { url, key } = getConfig();
    if (request.method === 'GET') {
      const result = await dbRequest(url, key, session.accessToken, '/companies?select=*&order=created_at.desc');
      return json(response, result.status, await result.json());
    }
    if (request.method === 'POST') {
      const result = await dbRequest(url, key, session.accessToken, '/companies', {
        method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ ...request.body, created_by: session.user.id })
      });
      return json(response, result.status, await result.json());
    }
    const id = request.query.id;
    if (!id) return json(response, 400, { message: 'Company id is required' });
    if (request.method === 'PATCH') {
      const result = await dbRequest(url, key, session.accessToken, `/companies?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(request.body)
      });
      return json(response, result.status, await result.json());
    }
    if (request.method === 'DELETE') {
      const result = await dbRequest(url, key, session.accessToken, `/companies?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!result.ok) return json(response, result.status, await result.json());
      return response.status(204).end();
    }
    return json(response, 405, { message: 'Method not allowed' });
  } catch (error) {
    return json(response, 500, { message: error.message });
  }
}
