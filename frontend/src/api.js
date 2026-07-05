const API_BASE = "http://127.0.0.1:8001";

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }
  return res.json();
}

export function startGame(depth = 5) {
  return request(`/start?depth=${depth}`);
}

export function sendMove(column) {
  return request("/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ column }),
  });
}
