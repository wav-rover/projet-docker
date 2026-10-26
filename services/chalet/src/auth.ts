import type { GetCurrentUser } from './types.js';

const createGetCurrentUser =
  (authApiUrl: string): GetCurrentUser =>
  async (token) => {
    const response = await fetch(`${authApiUrl}/me`, { headers: { Authorization: `Bearer ${token}` } });

    return response.ok ? response.json() : null;
  };

export default createGetCurrentUser;
