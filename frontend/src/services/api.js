const BASE_URL = "http://localhost:8000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const login = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());

export const signup = (email, password, username) =>
  fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  }).then((r) => r.json());

export const verifyEmail = (verify_token) =>
  fetch(`${BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verify_token }),
  }).then((r) => r.json());

export const googleAuth = (token) =>
  fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }).then((r) => r.json());

export const enhance = (payload) =>
  fetch(`${BASE_URL}/api/enhance`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export const getHistory = () =>
  fetch(`${BASE_URL}/history/prompts`, { headers: getHeaders() }).then((r) =>
    r.json(),
  );

export const getUsage = () =>
  fetch(`${BASE_URL}/usage/summary`, { headers: getHeaders() }).then((r) =>
    r.json(),
  );

export const getSuggestions = () =>
  fetch(`${BASE_URL}/history/suggestions`, { headers: getHeaders() }).then(
    (r) => r.json(),
  );

export const deletePrompt = (promptId) =>
  fetch(`${BASE_URL}/history/prompts/${promptId}`, {
    method: "DELETE",
    headers: getHeaders(),
  }).then((r) => r.json());

export const streamEnhance = async (payload, onChunk, onDone) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/api/enhance/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail = data.detail || data.error || detail;
    } catch {
      // ignore parsing error
    }
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onDone();
      break;
    }
    const chunk = decoder.decode(value);
    fullText += chunk;
    onChunk(chunk);
  }
};
