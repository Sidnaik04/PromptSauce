import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { deletePrompt, getHistory } from "../services/api";

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
        <span className="text-[#FF6A3D] font-bold text-lg tracking-tight">
          ✦ PromptSauce
        </span>
        {user && (
          <div className="flex items-center gap-3 mt-3">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-8 h-8 rounded-full"
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
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span className="font-medium">Free Tier</span>
          <span className="text-[#FF6A3D] font-semibold">3 total</span>
        </div>
        <button
          onClick={() => navigate("/api-key")}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/8 rounded-xl transition duration-150 font-medium"
        >
          🔑 API Key
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-300 bg-white/5 hover:bg-white/8 rounded-xl transition duration-150 font-medium"
        >
          ← Logout
        </button>
      </div>
    </div>
  );
}
