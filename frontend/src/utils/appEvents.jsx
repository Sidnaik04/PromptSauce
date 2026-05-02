export const APP_EVENTS = {
  apiKeyChanged: "promptsauce-api-key-changed",
  usageRefresh: "promptsauce-usage-refresh",
};

const LEGACY_API_KEY_STORAGE_KEY = "user_api_key";
const API_KEY_STORAGE_PREFIX = "promptsauce:api-key";

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  try {
    return atob(padded);
  } catch {
    return "";
  }
};

export const getCurrentUserIdentifier = (user = null, token = null) => {
  const email =
    user?.email ||
    user?.username ||
    (() => {
      const tokenValue = token || localStorage.getItem("token");
      if (!tokenValue) return "";

      const [, payloadPart] = tokenValue.split(".");
      if (!payloadPart) return "";

      try {
        const payload = JSON.parse(decodeBase64Url(payloadPart));
        return payload.sub || payload.email || "";
      } catch {
        return "";
      }
    })();

  return email ? `email:${String(email).toLowerCase()}` : "";
};

export const getApiKeyStorageKey = (user = null, token = null) => {
  const identifier = getCurrentUserIdentifier(user, token);
  return identifier ? `${API_KEY_STORAGE_PREFIX}:${identifier}` : null;
};

export const getStoredApiKey = (user = null, token = null) => {
  const storageKey = getApiKeyStorageKey(user, token);
  if (!storageKey) return "";
  return localStorage.getItem(storageKey) || "";
};

export const setStoredApiKey = (apiKey, user = null, token = null) => {
  const storageKey = getApiKeyStorageKey(user, token);
  if (storageKey) {
    localStorage.setItem(storageKey, apiKey);
  }
  localStorage.removeItem(LEGACY_API_KEY_STORAGE_KEY);
};

export const clearStoredApiKey = (user = null, token = null) => {
  const storageKey = getApiKeyStorageKey(user, token);
  if (storageKey) {
    localStorage.removeItem(storageKey);
  }
  localStorage.removeItem(LEGACY_API_KEY_STORAGE_KEY);
};

export const hasStoredApiKey = (user = null, token = null) =>
  Boolean(getStoredApiKey(user, token).trim());

export const notifyApiKeyChanged = () => {
  window.dispatchEvent(new Event(APP_EVENTS.apiKeyChanged));
};

export const notifyUsageRefresh = () => {
  window.dispatchEvent(new Event(APP_EVENTS.usageRefresh));
};
