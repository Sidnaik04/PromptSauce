import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsage } from "../services/api";

const StatCard = ({ label, value, accent }) => (
  <div className="bg-[#1E1E1E] rounded-xl p-4 border border-white/5">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p
      className={`text-2xl font-semibold ${accent ? "text-[#FF6A3D]" : "text-white"}`}
    >
      {value ?? "—"}
    </p>
  </div>
);

export default function ApiKey() {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("user_api_key") || "",
  );
  const [saved, setSaved] = useState(false);
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUsage()
      .then((res) => setUsage(res.data || res))
      .catch(() => {})
      .finally(() => setLoadingUsage(false));
  }, []);

  const handleSave = () => {
    localStorage.setItem("user_api_key", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-white transition text-sm"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">API Key & Usage</h1>
        </div>

        {/* API Key Section */}
        <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-white/5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-1">
            Your API Key
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Used when your free tier limit is exceeded. Get yours from the
            Anthropic console.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 bg-[#1E1E1E] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6A3D] transition"
            />
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="px-5 py-2.5 bg-[#FF6A3D] hover:bg-orange-500 disabled:opacity-40 rounded-lg text-sm font-medium transition"
            >
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
          {saved && (
            <p className="text-xs text-green-400 mt-2">
              API key saved locally.
            </p>
          )}
        </div>

        {/* Usage Dashboard */}
        <div className="bg-[#2A2A2A] rounded-2xl p-6 border border-white/5">
          <h2 className="text-sm font-semibold text-white mb-4">
            Usage Summary
          </h2>

          {loadingUsage ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#1E1E1E] rounded-xl p-4 border border-white/5 animate-pulse"
                >
                  <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
                  <div className="h-6 bg-white/5 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : usage ? (
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total Requests"
                value={usage.total_requests}
                accent
              />
              <StatCard label="Cache Hits" value={usage.cache_hits} />
              <StatCard
                label="Prompt Tokens"
                value={usage.prompt_tokens?.toLocaleString()}
              />
              <StatCard
                label="Response Tokens"
                value={usage.response_tokens?.toLocaleString()}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Could not load usage data.</p>
          )}

          {usage && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Rate limit</span>
                <span>{usage.total_requests ?? 0} / 20 per min</span>
              </div>
              <div className="w-full h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6A3D] rounded-full transition-all"
                  style={{
                    width: `${Math.min((usage.total_requests / 20) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
