import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { deletePrompt, getHistory, getUsage } from "../services/api";
import { useState } from "react";
import { APP_EVENTS, hasStoredApiKey } from "../utils/appEvents";
import { PromptsauceIcon } from "./PromptsauceIcon";

const FREE_TIER_LIMIT = 3;

const ApiKeyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 122.88 121.281"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      d="M78.813,59.293c0.592-1.171,1.133-2.4,1.619-3.694c0.488-1.3,0.913-2.656,1.27-4.074c0.35-1.378,0.609-2.792,0.783-4.243 c0.172-1.442,0.257-2.933,0.257-4.471c0-2.571-0.247-5.043-0.745-7.414c-0.496-2.355-1.244-4.647-2.249-6.874 c-0.022-0.051-0.044-0.101-0.063-0.153c-0.999-2.209-2.168-4.274-3.508-6.193c-1.356-1.941-2.904-3.753-4.646-5.43l-0.021-0.021 c-1.728-1.681-3.604-3.179-5.627-4.498c-2.033-1.325-4.232-2.48-6.596-3.469c-2.328-0.966-4.741-1.694-7.24-2.182 c-2.489-0.485-5.073-0.73-7.751-0.73c-2.68,0-5.264,0.245-7.752,0.73c-2.499,0.488-4.912,1.216-7.24,2.182 c-2.363,0.988-4.557,2.144-6.588,3.469c-2.026,1.321-3.906,2.823-5.646,4.508c-1.744,1.69-3.302,3.513-4.667,5.467 c-1.364,1.953-2.552,4.057-3.56,6.31c-0.997,2.227-1.748,4.533-2.249,6.916c-0.497,2.362-0.747,4.824-0.747,7.383 c0,2.6,0.25,5.091,0.747,7.471c0.502,2.404,1.252,4.721,2.249,6.946c1.008,2.251,2.196,4.355,3.56,6.308 c1.365,1.955,2.922,3.777,4.667,5.469c1.739,1.684,3.62,3.186,5.646,4.508c2.031,1.324,4.226,2.48,6.588,3.469 c2.328,0.965,4.741,1.693,7.24,2.182c2.489,0.486,5.072,0.73,7.752,0.73c2.064,0,4.065-0.148,6-0.439 c1.97-0.297,3.874-0.736,5.712-1.316c1.852-0.584,3.628-1.279,5.331-2.09c1.695-0.805,3.324-1.727,4.889-2.764 c1.344-0.889,3.154-0.521,4.043,0.822c0.181,0.273,0.309,0.564,0.389,0.863l3.556,11.438h12.251c1.614,0,2.923,1.311,2.923,2.924 v12.271h12.291c1.615,0,2.924,1.309,2.924,2.924v10.906h12.43v-14.285L79.257,62.801C78.315,61.844,78.17,60.4,78.813,59.293 L78.813,59.293z M85.892,57.655c-0.317,0.844-0.665,1.682-1.042,2.515l37.03,37.592c0.613,0.535,1,1.324,1,2.201v18.395 c0,1.613-1.309,2.924-2.924,2.924H101.68c-1.614,0-2.924-1.311-2.924-2.924v-10.906h-12.29c-1.615,0-2.924-1.309-2.924-2.924 V92.256H72.071v-0.008c-1.247,0.002-2.402-0.805-2.787-2.059l-3.126-10.053c-0.763,0.416-1.539,0.814-2.329,1.189 c-1.95,0.926-3.978,1.723-6.085,2.387c-2.141,0.674-4.334,1.184-6.58,1.521c-2.238,0.336-4.528,0.508-6.869,0.508 c-3.037,0-5.993-0.283-8.872-0.846c-2.87-0.561-5.655-1.402-8.359-2.523c-2.67-1.117-5.177-2.439-7.524-3.973 c-2.353-1.535-4.531-3.271-6.536-5.215c-1.987-1.926-3.781-4.031-5.375-6.313c-1.584-2.268-2.956-4.693-4.108-7.269 C2.35,56.988,1.47,54.275,0.884,51.47C0.296,48.653,0,45.765,0,42.812c0-2.916,0.296-5.774,0.884-8.57 c0.586-2.786,1.466-5.489,2.637-8.104c1.153-2.576,2.524-5,4.108-7.269c1.594-2.282,3.388-4.388,5.375-6.313 c2.005-1.943,4.183-3.68,6.536-5.215c2.348-1.532,4.854-2.854,7.524-3.972c2.704-1.122,5.49-1.964,8.359-2.524 C38.303,0.282,41.259,0,44.295,0c3.035,0,5.992,0.282,8.871,0.845c2.869,0.56,5.656,1.403,8.36,2.524 c2.669,1.117,5.181,2.439,7.531,3.972c2.348,1.531,4.519,3.261,6.507,5.195l0.01,0.009c1.996,1.923,3.787,4.023,5.376,6.299 c1.559,2.23,2.906,4.61,4.049,7.137c0.025,0.047,0.049,0.096,0.071,0.146c1.172,2.596,2.05,5.292,2.637,8.084 c0.59,2.807,0.883,5.675,0.883,8.602c0,1.739-0.1,3.458-0.304,5.156c-0.201,1.689-0.507,3.348-0.919,4.974 C86.964,54.547,86.47,56.117,85.892,57.655L85.892,57.655z M38.326,24.555c1.755,0,3.407,0.318,4.956,0.955 c1.553,0.638,2.945,1.575,4.178,2.807c1.234,1.233,2.17,2.627,2.808,4.179c0.636,1.548,0.955,3.2,0.955,4.956 c0,1.744-0.319,3.391-0.957,4.936c-0.631,1.531-1.567,2.919-2.806,4.161l-0.006,0.005l-0.005,0.006l-0.002,0.002 c-1.241,1.24-2.629,2.175-4.164,2.806c-1.548,0.637-3.201,0.955-4.956,0.955c-1.756,0-3.4-0.319-4.927-0.956 c-1.526-0.637-2.902-1.584-4.125-2.841c-1.215-1.25-2.136-2.64-2.754-4.165c-0.618-1.527-0.932-3.165-0.932-4.909 c0-1.748,0.313-3.388,0.931-4.917c0.622-1.542,1.544-2.937,2.755-4.183c1.224-1.257,2.601-2.204,4.126-2.84 C34.926,24.874,36.57,24.555,38.326,24.555L38.326,24.555z M41.065,30.901c-0.807-0.332-1.721-0.498-2.74-0.498 c-0.994,0-1.891,0.166-2.688,0.499c-0.795,0.332-1.524,0.837-2.185,1.515c-0.679,0.7-1.189,1.462-1.521,2.288 c-0.33,0.817-0.498,1.732-0.498,2.748c0,0.994,0.168,1.9,0.499,2.716c0.338,0.833,0.846,1.598,1.521,2.292 c0.661,0.679,1.39,1.185,2.185,1.516c0.797,0.333,1.694,0.499,2.688,0.499c1.02,0,1.933-0.166,2.741-0.498 c0.815-0.335,1.568-0.849,2.259-1.54h0l0.011-0.011c0.691-0.691,1.205-1.443,1.539-2.254c0.333-0.806,0.5-1.714,0.5-2.72 c0-1.02-0.167-1.933-0.498-2.74c-0.33-0.803-0.848-1.557-1.552-2.26C42.622,31.748,41.869,31.231,41.065,30.901L41.065,30.901z"
      fill="currentColor"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Sidebar() {
  const { history, setHistory, setCurrentChat, logout, user, token } =
    useStore();
  const navigate = useNavigate();

  const modeLabel = (mode) => {
    if (!mode) return "General";
    return mode.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const preferredOrder = [
    "programming",
    "writing",
    "study",
    "business",
    "email",
    "interview",
    "fitness",
    "legal",
    "advice",
    "psychology",
    "data_analysis",
    "auto",
  ];

  const [usage, setUsage] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(() =>
    hasStoredApiKey(user, token),
  );

  const loadUsage = () => {
    if (!token || hasStoredApiKey(user, token)) return;

    getUsage()
      .then((res) => setUsage(res.data || res))
      .catch(() => {});
  };

  const syncApiKeyState = () => {
    const nextHasKey = hasStoredApiKey(user, token);
    setHasApiKey(nextHasKey);
    if (nextHasKey) {
      setUsage(null);
    }
  };

  useEffect(() => {
    if (!token) {
      setHistory([]);
      return;
    }

    getHistory()
      .then((res) => {
        const historyData = Array.isArray(res) ? res : res.data || [];
        console.log("History fetched:", historyData);
        setHistory(historyData);
      })
      .catch((err) => {
        console.error("Failed to fetch history:", err);
        setHistory([]);
      });
  }, [setHistory, token]);

  useEffect(() => {
    syncApiKeyState();
    if (!token || hasStoredApiKey(user, token)) return;

    loadUsage();

    const handleUsageRefresh = () => loadUsage();
    const handleApiKeyChange = () => syncApiKeyState();

    window.addEventListener(APP_EVENTS.usageRefresh, handleUsageRefresh);
    window.addEventListener(APP_EVENTS.apiKeyChanged, handleApiKeyChange);
    window.addEventListener("storage", handleApiKeyChange);

    return () => {
      window.removeEventListener(APP_EVENTS.usageRefresh, handleUsageRefresh);
      window.removeEventListener(APP_EVENTS.apiKeyChanged, handleApiKeyChange);
      window.removeEventListener("storage", handleApiKeyChange);
    };
  }, [token, user]);

  // Re-sync API key state when component re-mounts or tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncApiKeyState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, token]);

  const handleSelect = (item) => {
    setCurrentChat([
      { role: "user", content: item.original_prompt },
      {
        role: "assistant",
        enhanced_prompt: item.best_version?.enhanced_prompt || "",
        explanation: item.best_version?.explanation || "",
        insights: item.best_version?.insights || "",
      },
    ]);
  };

  const handleDelete = async (event, item) => {
    event.stopPropagation();
    const id = item.prompt_id || item.id;
    if (!id) return;

    try {
      await deletePrompt(id);
      setHistory(history.filter((p) => (p.prompt_id || p.id) !== id));
      setCurrentChat((prev) => {
        if (prev?.[0]?.content === item.original_prompt) {
          return [];
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to delete prompt:", err);
    }
  };

  const getPromptPreview = (text, maxLength = 64) => {
    if (!text) return "Untitled prompt";
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (trimmed.length <= maxLength) return trimmed;
    return `${trimmed.slice(0, maxLength - 1)}…`;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const groupedHistory = history
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .reduce((acc, item) => {
      const key = item.mode || "general";
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});

  const orderedGroups = Object.keys(groupedHistory).sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return modeLabel(a).localeCompare(modeLabel(b));
  });

  return (
    <div className="w-64 bg-[#2A2A2A] flex flex-col border-r border-white/5 shrink-0">
      {/* Top */}
      <div className="p-4 border-b border-white/5">
        <span className="text-[#FF6A3D] font-bold text-lg tracking-tight flex items-center gap-2">
          <PromptsauceIcon width="24" height="24" />
          PromptSauce
        </span>
        {user && (
          <div className="flex items-center gap-3 mt-3">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover object-center bg-[#1E1E1E]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#FF6A3D]/20 flex items-center justify-center text-sm font-bold text-[#FF6A3D]">
                {user.username?.[0].toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm text-gray-300 truncate font-medium">
                {user.username || user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCurrentChat([])}
          className="mt-3.5 w-full py-2.5 text-sm bg-[#FF6A3D]/10 hover:bg-[#FF6A3D]/15 text-[#FF6A3D] rounded-xl border border-[#FF6A3D]/20 transition font-medium duration-150 hover:shadow-lg hover:shadow-[#FF6A3D]/10"
        >
          ✚ New Chat
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto py-4 px-3 sidebar-scrollbar">
        {history.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-xs text-gray-600">No history yet</p>
            <p className="text-[11px] text-gray-700 mt-1">
              Start with a prompt above
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderedGroups.map((group) => (
              <div
                key={group}
                className="rounded-xl border border-white/5 bg-white/5 p-2"
              >
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                      {modeLabel(group)}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {groupedHistory[group].length}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-600">▾</span>
                </div>
                <div className="mt-1 space-y-1.5">
                  {groupedHistory[group].map((item) => (
                    <div
                      key={item.prompt_id || item.id}
                      className="group flex w-full items-start gap-2 rounded-lg px-2 py-2 hover:bg-white/5 transition-all duration-150"
                    >
                      <button
                        onClick={() => handleSelect(item)}
                        className="flex flex-1 items-start gap-2 text-left min-w-0"
                        title={item.original_prompt}
                        type="button"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FF6A3D]/70 group-hover:bg-[#FF6A3D]"></span>
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-400 group-hover:text-gray-200 leading-snug">
                            {getPromptPreview(item.original_prompt)}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(event) => handleDelete(event, item)}
                        className="text-[11px] text-gray-500 hover:text-[#FF6A3D] opacity-0 group-hover:opacity-100 transition"
                        aria-label="Delete prompt"
                        title="Delete prompt"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2.5">
        {hasApiKey ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-emerald-300">Premium user</span>
              <span className="font-semibold text-emerald-200">Unlimited</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-200/70">
              Using your own API key.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">Free tier</span>
              <span className="text-[#FF6A3D] font-semibold">
                {Math.max(0, FREE_TIER_LIMIT - (usage?.total_requests || 0))}{" "}
                left
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-[#FF6A3D] transition-all"
                style={{
                  width: `${Math.min(((usage?.total_requests || 0) / FREE_TIER_LIMIT) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        <button
          onClick={() => navigate("/api-key")}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/8 rounded-xl transition duration-150 font-medium flex items-center gap-2.5 justify-center"
        >
          <ApiKeyIcon />
          API Key
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-300 bg-white/5 hover:bg-white/8 rounded-xl transition duration-150 font-medium flex items-center gap-2.5 justify-center"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </div>
  );
}
