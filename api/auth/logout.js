import { clearSessionCookies, json } from '../_auth.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { message: 'Method not allowed' });
  clearSessionCookies(response);
  return json(response, 204, {});
}
