const API_BASE = "http://localhost:4000/api";

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
