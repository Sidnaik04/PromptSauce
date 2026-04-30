import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import InputBox from "../components/InputBox";
import useStore from "../store/useStore";
import { getUsage } from "../services/api";

export default function Dashboard() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("user_api_key") || "",
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const limitReached = useStore((s) => s.limitReached);
  const setLimitReached = useStore((s) => s.setLimitReached);
  const navigate = useNavigate();

  useEffect(() => {
    const hasKey = Boolean(localStorage.getItem("user_api_key"));
    if (hasKey) return;

    getUsage()
      .then((res) => {
        const usage = res.data || res;
        if ((usage.total_requests ?? 0) >= 3) {
          setLimitReached(true);
        }
      })
      .catch(() => {});
  }, [setLimitReached]);

  const handleSaveKey = async () => {
    if (!apiKey.trim() || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/auth/save-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save API key");
      }

      localStorage.setItem("user_api_key", apiKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#1E1E1E] text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {limitReached && (
          <div className="border-b border-[#FF6A3D]/20 bg-[#1E1E1E] px-6 py-4">
            <div className="max-w-3xl mx-auto bg-[#2A2A2A] border border-[#FF6A3D]/30 rounded-2xl p-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-[#FF6A3D] font-semibold">
                  Free limit reached (3 requests per account).
                </p>
                <p className="text-xs text-gray-400">
                  Add your API key to continue generating prompts.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="flex-1 min-w-[200px] bg-[#1E1E1E] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6A3D] transition"
                  />
                  <button
                    onClick={handleSaveKey}
                    disabled={!apiKey.trim() || saving}
                    className="px-4 py-2.5 bg-[#FF6A3D] hover:bg-orange-500 disabled:opacity-40 rounded-lg text-xs font-semibold transition"
                  >
                    {saving ? "Saving..." : saved ? "✓ Saved" : "Save Key"}
                  </button>
                  <button
                    onClick={() => navigate("/api-key")}
                    className="px-3 py-2.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/8 rounded-lg transition"
                  >
                    Manage Usage
                  </button>
                </div>
                {saveError && (
                  <p className="text-xs text-red-400">✗ {saveError}</p>
                )}
              </div>
            </div>
          </div>
        )}
        <ChatWindow advancedMode={advancedMode} />
        <InputBox
          advancedMode={advancedMode}
          setAdvancedMode={setAdvancedMode}
        />
      </div>
    </div>
  );
}
