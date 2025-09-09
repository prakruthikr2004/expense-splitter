export const API_BASE = "http://localhost:5000";

export async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(json?.message || res.statusText);
    return json;
  } catch (err) {
    // JSON parse failed
    if (!res.ok) throw new Error(res.statusText || "Request failed");
    return null;
  }
}
