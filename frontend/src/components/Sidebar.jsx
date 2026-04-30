import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { getHistory, getUsage } from "../services/api";

const groupByTime = (items) => {
  const now = new Date();
  const today = [],
    yesterday = [],
    older = [];

  items.forEach((item) => {
    const d = new Date(item.created_at || Date.now());
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    if (diff < 1) today.push(item);
    else if (diff < 2) yesterday.push(item);
    else older.push(item);
  });

  return { today, yesterday, older };
};

const ModeTag = ({ mode }) => (
  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FF6A3D]/8 text-[#FF6A3D] border border-[#FF6A3D]/15 font-medium">
    {mode}
  </span>
);

const HistoryGroup = ({ label, items, onSelect }) => {
  if (!items.length) return null;
  return (
    <div className="mb-5">
      <p className="text-[11px] text-gray-600 px-3 mb-2 uppercase tracking-widest font-medium">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.prompt_id}
            onClick={() => onSelect(item)}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/8 transition-all duration-150 group"
          >
            <p className="text-sm text-gray-400 truncate group-hover:text-gray-200 leading-tight">
              {item.original_prompt}
            </p>
            {item.mode && <ModeTag mode={item.mode} />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Sidebar() {
  const { history, setHistory, setCurrentChat, logout, token, user } =
    useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getHistory()
      .then((res) => {
        const historyData = Array.isArray(res) ? res : res.data || [];
        console.log("History fetched:", historyData);
        setHistory(historyData);
      })
      .catch((err) => console.error("Failed to fetch history:", err));
  }, [setHistory]);

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const { today, yesterday, older } = groupByTime(history);

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
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {history.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-xs text-gray-600">No history yet</p>
            <p className="text-[11px] text-gray-700 mt-1">
              Start with a prompt above
            </p>
          </div>
        ) : (
          <>
            <HistoryGroup label="Today" items={today} onSelect={handleSelect} />
            <HistoryGroup
              label="Yesterday"
              items={yesterday}
              onSelect={handleSelect}
            />
            <HistoryGroup label="Older" items={older} onSelect={handleSelect} />
          </>
        )}
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span className="font-medium">Free Tier</span>
          <span className="text-[#FF6A3D] font-semibold">20/min</span>
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
