import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import InputBox from "../components/InputBox";
import useStore from "../store/useStore";
import { getApiKey, getUsage } from "../services/api";
import {
  hasStoredApiKey,
  getStoredApiKey,
  notifyApiKeyChanged,
  notifyUsageRefresh,
  setStoredApiKey,
} from "../utils/appEvents";

// SVG Icon Component
const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 122.88 112.09" fill="currentColor">
    <path d="M61.44,109c-20.37,-17.68 -40.27,-35.07 -40.27,-55.21c0,-14.16 9.32,-24.64 21.35,-24.64c7.02,0 13.9,3.54 18.92,9.23c5.02,-5.69 11.9,-9.23 18.92,-9.23c12.03,0 21.35,10.48 21.35,24.64c0,20.14 -19.9,37.53 -40.27,55.21Z" />
  </svg>
);

export default function Dashboard() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const limitReached = useStore((s) => s.limitReached);
  const setLimitReached = useStore((s) => s.setLimitReached);
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const navigate = useNavigate();
  const hasApiKey = hasStoredApiKey(user, token);

  useEffect(() => {
    let isActive = true;
    const cachedKey = getStoredApiKey(user, token);
    if (cachedKey) {
      setLimitReached(false);
      return;
    }

    getApiKey()
      .then((res) => {
        if (!isActive) return;
        const nextKey = res.data?.api_key ?? res.api_key ?? "";
        if (nextKey) {
          setStoredApiKey(nextKey, user, token);
          notifyApiKeyChanged();
          setLimitReached(false);
          return;
        }
        return getUsage();
      })
      .then((res) => {
        if (!isActive || !res) return;
        const usage = res.data || res;
        if ((usage.total_requests ?? 0) >= 3) {
          setLimitReached(true);
        }
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, [setLimitReached, token, user]);

  // Redirect to API key page when free limit is reached
  useEffect(() => {
    if (limitReached && !hasApiKey) {
      navigate("/api-key");
    }
  }, [limitReached, hasApiKey, navigate]);

  return (
    <div className="flex flex-col h-screen bg-[#1E1E1E] text-white">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatWindow advancedMode={advancedMode} />
          <InputBox
            advancedMode={advancedMode}
            setAdvancedMode={setAdvancedMode}
          />
        </div>
      </div>
      {/* Footer */}
      <footer className="text-center py-4 px-6 border-t border-white/5 text-gray-500 text-xs">
        <div className="flex items-center justify-center gap-1.5 text-gray-400">
          <span className="text-[#FF6A3D]">
            <HeartIcon />
          </span>
          Developed by Sidnaik04
        </div>
      </footer>
    </div>
  );
}
