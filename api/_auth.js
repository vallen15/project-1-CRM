const cookieOptions = 'Path=/; HttpOnly; Secure; SameSite=Lax';

export const getConfig = () => ({
  url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
});

export const parseCookies = (request) => Object.fromEntries(
  (request.headers.cookie || '').split(';').filter(Boolean).map((item) => {
    const index = item.indexOf('=');
    return [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1))];
  })
);

export const writeSessionCookies = (response, session) => {
  const maxAge = Math.max(0, Number(session.expires_in || 3600));
  response.setHeader('Set-Cookie', [
    `crm_access_token=${encodeURIComponent(session.access_token)}; Max-Age=${maxAge}; ${cookieOptions}`,
    `crm_refresh_token=${encodeURIComponent(session.refresh_token)}; Max-Age=${60 * 60 * 24 * 30}; ${cookieOptions}`
  ]);
};

export const clearSessionCookies = (response) => {
  response.setHeader('Set-Cookie', [
    `crm_access_token=; Max-Age=0; ${cookieOptions}`,
    `crm_refresh_token=; Max-Age=0; ${cookieOptions}`
  ]);
};

export const json = (response, status, body) => {
  response.status(status).json(body);
};

export const requestSupabase = async (path, options = {}) => {
  const { url, key } = getConfig();
  if (!url || !key) throw new Error('Supabase server environment variables are not configured.');
  return fetch(`${url}/auth/v1${path}`, {
    ...options,
    headers: { apikey: key, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
};

// Profiles are provisioned by the server after authentication rather than by an
// auth.users trigger, so an auxiliary profile failure can never block signup.
export const ensureProfile = async (session) => {
  const { url, key } = getConfig();
  const profileResponse = await fetch(`${url}/rest/v1/profiles?on_conflict=user_id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({
      user_id: session.user.id,
      full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
      email: session.user.email,
      role: 'user',
      job_title: 'Team Member'
    })
  });
  if (!profileResponse.ok) throw new Error('Unable to provision user profile.');
};

export const getUserFromRequest = async (request, response) => {
  const cookies = parseCookies(request);
  let accessToken = cookies.crm_access_token;
  let userResponse = accessToken
    ? await requestSupabase('/user', { headers: { Authorization: `Bearer ${accessToken}` } })
    : null;

  if ((!userResponse || !userResponse.ok) && cookies.crm_refresh_token) {
    const refreshResponse = await requestSupabase('/token?grant_type=refresh_token', {
      method: 'POST', body: JSON.stringify({ refresh_token: cookies.crm_refresh_token })
    });
    if (refreshResponse.ok) {
      const refreshed = await refreshResponse.json();
      writeSessionCookies(response, refreshed);
      accessToken = refreshed.access_token;
      userResponse = await requestSupabase('/user', { headers: { Authorization: `Bearer ${accessToken}` } });
    }
  }

  if (!userResponse?.ok) return null;
  return { user: await userResponse.json(), accessToken };
};
