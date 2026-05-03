import { useEffect, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
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

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function Dashboard() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const limitReached = useStore((s) => s.limitReached);
  const setLimitReached = useStore((s) => s.setLimitReached);
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const navigate = useNavigate();
  const navigationType = useNavigationType();
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
    // Avoid auto-redirect when the user navigated via browser Back/Forward (POP)
    if (navigationType === "POP") return;

    if (limitReached && !hasApiKey) {
      navigate("/api-key", { replace: true });
    }
  }, [limitReached, hasApiKey, navigate]);

  return (
    <div className="flex flex-col h-screen bg-[#1E1E1E] text-white">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#2A2A2A] shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </button>
        <span className="text-[#FF6A3D] font-bold text-base tracking-tight">
          PromptSauce
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatWindow advancedMode={advancedMode} />
          <InputBox
            advancedMode={advancedMode}
            setAdvancedMode={setAdvancedMode}
          />
        </div>
      </div>
      {/* Footer */}
      <footer className="text-center py-3 px-6 border-t border-white/5 text-gray-500 text-xs shrink-0">
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
