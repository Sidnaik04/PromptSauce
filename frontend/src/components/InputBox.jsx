import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { enhance, streamEnhance, getHistory } from "../services/api";
import { getStoredApiKey, notifyUsageRefresh } from "../utils/appEvents";

const MODES = [
  "auto",
  "study",
  "programming",
  "writing",
  "business",
  "email",
  "interview",
  "fitness",
  "legal",
  "advice",
  "psychology",
  "data_analysis",
];
const TONES = ["default", "simple", "formal", "casual", "technical"];
const FORMATS = ["default", "step-by-step", "bullet-points", "paragraph"];

const AnalysisIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 122.879 119.799"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      d="M49.988,0h0.016v0.007C63.803,0.011,76.298,5.608,85.34,14.652c9.027,9.031,14.619,21.515,14.628,35.303h0.007v0.033v0.04 h-0.007c-0.005,5.557-0.917,10.905-2.594,15.892c-0.281,0.837-0.575,1.641-0.877,2.409v0.007c-1.446,3.66-3.315,7.12-5.547,10.307 l29.082,26.139l0.018,0.016l0.157,0.146l0.011,0.011c1.642,1.563,2.536,3.656,2.649,5.78c0.11,2.1-0.543,4.248-1.979,5.971 l-0.011,0.016l-0.175,0.203l-0.035,0.035l-0.146,0.16l-0.016,0.021c-1.565,1.642-3.654,2.534-5.78,2.646 c-2.097,0.111-4.247-0.54-5.971-1.978l-0.015-0.011l-0.204-0.175l-0.029-0.024L78.761,90.865c-0.88,0.62-1.778,1.209-2.687,1.765 c-1.233,0.755-2.51,1.466-3.813,2.115c-6.699,3.342-14.269,5.222-22.272,5.222v0.007h-0.016v-0.007 c-13.799-0.004-26.296-5.601-35.338-14.645C5.605,76.291,0.016,63.805,0.007,50.021H0v-0.033v-0.016h0.007 c0.004-13.799,5.601-26.296,14.645-35.338C23.683,5.608,36.167,0.016,49.955,0.007V0H49.988L49.988,0z M50.004,11.21v0.007h-0.016 h-0.033V11.21c-10.686,0.007-20.372,4.35-27.384,11.359C15.56,29.578,11.213,39.274,11.21,49.973h0.007v0.016v0.033H11.21 c0.007,10.686,4.347,20.367,11.359,27.381c7.009,7.012,16.705,11.359,27.403,11.361v-0.007h0.016h0.033v0.007 c10.686-0.007,20.368-4.348,27.382-11.359c7.011-7.009,11.358-16.702,11.36-27.4h-0.006v-0.016v-0.033h0.006 c-0.006-10.686-4.35-20.372-11.358-27.384C70.396,15.56,60.703,11.213,50.004,11.21L50.004,11.21z"
      fill="currentColor"
    />
  </svg>
);

const AdvancedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 122.88 78.87" fill="currentColor">
    <path d="M90.4,28.29l.08.24.22.62.08.24L91,30l.08.24.19.56.08.23.18.53.08.23.17.5.08.23L92,33l.07.23.15.44.08.23.14.4.08.23.13.38.08.22.12.35.07.22L93,36l.07.21.11.31.07.21.1.29.07.2.09.26.07.2.09.25.07.19.08.23.06.18.07.21.06.18.07.2.06.17.07.18,0,.17.06.16.06.16,0,.15,0,.16,0,.14.05.15,0,.12,0,.15,0,.11,0,.14,0,.1,0,.13,0,.1,0,.12,0,.09,0,.12,0,.08,0,.11,0,.07,0,.1,0,.07,0,.1,0,.06,0,.09v.06l0,.09,0,0,0,.08v0l0,.09,0,.11v.25h0l0,.18v.5h0V44h0v.08h0v.29h0v.35h0v.13h0v.13h0v.15h0v.16h0v.17h0v.18h0V46h0v.22h0v.24c.07,5,6.36,11,5.2,14.44s4.68,9.9,6.56,14.71H98.63a3.31,3.31,0,0,0-.6-1.91L79.93,44.76l3-4.85,3.65-3.66,3.69-8.1h0l.08.14ZM92.19,27l30.28,48.39a2.17,2.17,0,0,1,.41,1.28,2.21,2.21,0,0,1-2.21,2.21H3.28A3.28,3.28,0,0,1,.53,73.79L47.26,1.66A3.16,3.16,0,0,1,48.37.5,3.29,3.29,0,0,1,52.9,1.55L78.46,42.41l10-15.35a2.07,2.07,0,0,1,.75-.78,2.2,2.2,0,0,1,3,.71ZM52.44,75.58H3.9L14.33,61.79l16-28L39.47,23.2l4.65-10.28,6-9.64h0l.12.2c.88,2.66,1.26,4.11,2,6.25.44,1.23,2.3,3.91,2.67,4.93,5.31,14.76,2.62,9.34,2.69,15.88.08,7.51,9.47,16.45,7.74,21.53-1.93,5.62,8.38,16.22,10.31,23.51Z" />
  </svg>
);

const StreamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 82.1 122.88" fill="currentColor">
    <path d="M19.62,0h50.2l-17.5,33.88L82.1,34.4L9.53,122.88l13.96-58.21L0,64.67L19.62,0L19.62,0L19.62,0z M13.92,53.48 l14.65-41.7h22.75L39.49,43.53l17.85,0.3L27.31,88.79l8.95-35.31L13.92,53.48L13.92,53.48L13.92,53.48z" />
  </svg>
);

export default function InputBox({ advancedMode, setAdvancedMode }) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("auto");
  const [tone, setTone] = useState("default");
  const [format, setFormat] = useState("default");
  const [useStream, setUseStream] = useState(true);
  const navigate = useNavigate();

  const {
    addMessage,
    setStreaming,
    isStreaming,
    isLoading,
    setLoading,
    currentChat,
    setCurrentChat,
    setHistory,
    setLimitReached,
    user,
    token,
  } = useStore();
  const textareaRef = useRef(null);
  const apiKey = getStoredApiKey(user, token);

  const refreshHistory = () => {
    console.log("Refreshing history...");
    getHistory()
      .then((res) => {
        const historyData = Array.isArray(res) ? res : res.data || [];
        console.log("History refreshed:", historyData);
        setHistory(historyData);
      })
      .catch((err) => console.error("Failed to refresh history:", err));
  };

  const handleSend = async () => {
    if (!prompt.trim() || isStreaming || isLoading) return;

    const userMsg = { role: "user", content: prompt };
    addMessage(userMsg);
    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const payload = {
      prompt,
      mode,
      evaluate: advancedMode,
      preferences: {
        tone: tone !== "default" ? tone : undefined,
        output_format: format !== "default" ? format : undefined,
      },
      metadata: apiKey ? { api_key: apiKey } : undefined,
    };

    if (useStream) {
      setStreaming(true);
      const streamMsg = { role: "streaming", content: "" };
      addMessage(streamMsg);

      let accumulated = "";
      await streamEnhance(
        payload,
        (chunk) => {
          accumulated += chunk;
          setCurrentChat((prev) => {
            if (!prev) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "streaming",
              content: accumulated,
            };
            return updated;
          });
        },
        () => {
          setStreaming(false);
          setLimitReached(false);
          setCurrentChat((prev) => {
            if (!prev) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              enhanced_prompt: accumulated,
              explanation: "",
              insights: "",
            };
            return updated;
          });
          refreshHistory();
          notifyUsageRefresh();
        },
      ).catch((err) => {
        setStreaming(false);

        if (err?.status === 403) {
          setLimitReached(true);
          setCurrentChat((prev) => {
            if (!prev) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              enhanced_prompt:
                "Free limit reached! Redirecting you to add your API key...",
              explanation: "",
              insights: "",
            };
            return updated;
          });
          setTimeout(() => navigate("/api-key"), 1500);
        } else {
          const message = err?.message || "Error: could not reach backend.";
          setCurrentChat((prev) => {
            if (!prev) return prev;
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              enhanced_prompt: message,
              explanation: "",
              insights: "",
            };
            return updated;
          });
        }
      });
    } else {
      setLoading(true);
      try {
        const res = await enhance(payload);
        const d = res.data || res;
        if (res.detail) {
          throw new Error(res.detail);
        }
        addMessage({
          role: "assistant",
          enhanced_prompt: d.enhanced_prompt,
          explanation: "",
          insights: d.insights,
          evaluation: d.evaluation,
        });
        setLimitReached(false);
        refreshHistory();
        notifyUsageRefresh();
      } catch (err) {
        const message = err?.message || "Error: could not reach backend.";
        if (message.includes("Free usage limit exceeded")) {
          setLimitReached(true);
          addMessage({
            role: "assistant",
            enhanced_prompt:
              "Free limit reached! Redirecting you to add your API key...",
            explanation: "",
            insights: "",
          });
          setTimeout(() => navigate("/api-key"), 1500);
        } else {
          addMessage({
            role: "assistant",
            enhanced_prompt: message,
            explanation: "",
            insights: "",
          });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isStreaming && !isLoading) {
        handleSend();
      }
    }
  };

  const handleInput = (e) => {
    setPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div
      className={`px-3 sm:px-4 pb-3 sm:pb-4 pt-2 sm:pt-3 border-t transition-all duration-300 ${advancedMode ? "bg-[#1E1E1E] border-[#FF6A3D]/20" : "bg-[#1E1E1E] border-white/5"}`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Mode Badge */}
        {advancedMode && (
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex-1 h-px bg-linear-to-r from-[#FF6A3D]/0 via-[#FF6A3D]/20 to-[#FF6A3D]/0"></div>
            <span className="text-xs font-semibold text-[#FF6A3D] bg-[#FF6A3D]/10 px-2.5 sm:px-3 py-1 rounded-full border border-[#FF6A3D]/20 flex items-center gap-1.5">
              <AdvancedIcon />
              <span className="hidden sm:inline">Advanced Analysis Mode</span>
              <span className="sm:hidden">Advanced ON</span>
            </span>
            <div className="flex-1 h-px bg-linear-to-r from-[#FF6A3D]/0 via-[#FF6A3D]/20 to-[#FF6A3D]/0"></div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className={`text-xs bg-[#2A2A2A] border text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FF6A3D] transition ${advancedMode ? "border-[#FF6A3D]/20" : "border-white/10"} capitalize`}
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {advancedMode && (
            <>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="text-xs bg-[#2A2A2A] border border-[#FF6A3D]/20 text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FF6A3D] transition"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    Tone: {t}
                  </option>
                ))}
              </select>

              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="text-xs bg-[#2A2A2A] border border-[#FF6A3D]/20 text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FF6A3D] transition"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    Format: {f}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className="flex-1" />

          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className={`text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2
              ${
                advancedMode
                  ? "bg-[#FF6A3D] border-[#FF6A3D] text-white shadow-lg shadow-[#FF6A3D]/30"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/8"
              }`}
          >
            <AnalysisIcon />
            <span className="hidden sm:inline">{advancedMode ? "Advanced ON" : "Analysis OFF"}</span>
            <span className="sm:hidden">{advancedMode ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => setUseStream(!useStream)}
            className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5
              ${
                useStream
                  ? "bg-[#FF6A3D]/10 border-[#FF6A3D]/30 text-[#FF6A3D]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
          >
            <StreamIcon />
            {useStream ? "Stream" : "Instant"}
          </button>
        </div>

        {/* Input */}
        <div className="flex items-end gap-2 sm:gap-2.5 bg-[#2A2A2A] border border-white/10 rounded-2xl px-3 sm:px-5 py-3 sm:py-4 focus-within:border-[#FF6A3D]/50 focus-within:ring-1 focus-within:ring-[#FF6A3D]/10 transition">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder="Enter a prompt to optimize..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none focus:outline-none leading-relaxed"
            style={{ minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={handleSend}
            disabled={!prompt.trim() || isStreaming || isLoading}
            className="shrink-0 w-9 h-9 flex items-center justify-center bg-[#FF6A3D] hover:bg-orange-500 active:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition duration-150 hover:shadow-lg hover:shadow-[#FF6A3D]/30"
            title="Send (Enter)"
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-2 font-medium">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
