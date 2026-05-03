export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8000";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithRetry = async (url, options, retries = 2) => {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      let detail = "Request failed";
      try {
        const data = await res.json();
        detail = data.detail || data.error || detail;
      } catch {
        // ignore parse issues and use fallback detail
      }
      const error = new Error(detail);
      error.status = res.status;
      throw error;
    }

    return res;
  } catch (err) {
    if (retries > 0) {
      console.log("Retrying request...");
      await sleep(3000);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

export const warmUpBackend = async () => {
  const start = Date.now();

  try {
    await fetch(`${BASE_URL}/health`);
    const time = Date.now() - start;

    if (time > 3000) {
      console.log("Cold start detected");
    }

    return true;
  } catch {
    console.log("Warmup failed (expected if sleeping)");
    return false;
  }
};

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const login = (email, password) =>
  fetchWithRetry(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());

export const signup = (email, password, username) =>
  fetchWithRetry(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  }).then((r) => r.json());

export const verifyEmail = (verify_token) =>
  fetchWithRetry(`${BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verify_token }),
  }).then((r) => r.json());

export const googleAuth = (token) =>
  fetchWithRetry(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }).then((r) => r.json());

export const getApiKey = () =>
  fetchWithRetry(`${BASE_URL}/auth/api-key`, { headers: getHeaders() }).then(
    (r) => r.json(),
  );

export const enhance = (payload) =>
  fetchWithRetry(`${BASE_URL}/api/enhance`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export const getHistory = () =>
  fetchWithRetry(`${BASE_URL}/history/prompts`, { headers: getHeaders() }).then(
    (r) => r.json(),
  );

export const getUsage = () =>
  fetchWithRetry(`${BASE_URL}/usage/summary`, { headers: getHeaders() }).then(
    (r) => r.json(),
  );

export const getSuggestions = () =>
  fetchWithRetry(`${BASE_URL}/history/suggestions`, {
    headers: getHeaders(),
  }).then((r) => r.json());

export const deletePrompt = (promptId) =>
  fetchWithRetry(`${BASE_URL}/history/prompts/${promptId}`, {
    method: "DELETE",
    headers: getHeaders(),
  }).then((r) => r.json());

export const streamEnhance = async (payload, onChunk, onDone) => {
  const token = localStorage.getItem("token");
  const res = await fetchWithRetry(`${BASE_URL}/api/enhance/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onDone();
      break;
    }
    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
};
