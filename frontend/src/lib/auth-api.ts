const authFetch = (path: string, init?: RequestInit) =>
  fetch(`${process.env.AUTH_API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

export default authFetch;
