import { useState, useRef } from "react";
import useStore from "../store/useStore";
import { enhance, streamEnhance, getHistory } from "../services/api";

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

export default function InputBox({ advancedMode, setAdvancedMode }) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("auto");
  const [tone, setTone] = useState("default");
  const [format, setFormat] = useState("default");
  const [useStream, setUseStream] = useState(true);

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
  } = useStore();
  const textareaRef = useRef(null);

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
      metadata: {
        api_key: localStorage.getItem("user_api_key"),
      },
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
        },
      ).catch((err) => {
        setStreaming(false);
        const message =
          err?.status === 403
            ? "Free limit reached. Add your API key to continue generating prompts."
            : err?.message || "Error: could not reach backend.";

        if (err?.status === 403) {
          setLimitReached(true);
        }

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
      } catch (err) {
        const message = err?.message || "Error: could not reach backend.";
        if (message.includes("Free usage limit exceeded")) {
          setLimitReached(true);
          addMessage({
            role: "assistant",
            enhanced_prompt:
              "Free limit reached. Add your API key to continue generating prompts.",
            explanation: "",
            insights: "",
          });
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
      className={`px-4 pb-4 pt-3 border-t transition-all duration-300 ${advancedMode ? "bg-[#1E1E1E] border-[#FF6A3D]/20" : "bg-[#1E1E1E] border-white/5"}`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Mode Badge */}
        {advancedMode && (
          <div className="mb-2.5 flex items-center gap-2">
            <div className="flex-1 h-px bg-gradient-to-r from-[#FF6A3D]/0 via-[#FF6A3D]/20 to-[#FF6A3D]/0"></div>
            <span className="text-xs font-semibold text-[#FF6A3D] bg-[#FF6A3D]/10 px-3 py-1 rounded-full border border-[#FF6A3D]/20">
              ✦ Advanced Analysis Mode
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FF6A3D]/0 via-[#FF6A3D]/20 to-[#FF6A3D]/0"></div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
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
            className={`text-xs px-4 py-2 rounded-lg border font-semibold transition-all duration-200
              ${
                advancedMode
                  ? "bg-[#FF6A3D] border-[#FF6A3D] text-white shadow-lg shadow-[#FF6A3D]/30"
                  : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/8"
              }`}
          >
            {advancedMode ? "🔬 Advanced ON" : "🔍 Analysis OFF"}
          </button>

          <button
            onClick={() => setUseStream(!useStream)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition
              ${
                useStream
                  ? "bg-[#FF6A3D]/10 border-[#FF6A3D]/30 text-[#FF6A3D]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
          >
            ⚡ {useStream ? "Stream" : "Instant"}
          </button>
        </div>

        {/* Input */}
        <div className="flex items-end gap-2.5 bg-[#2A2A2A] border border-white/10 rounded-2xl px-5 py-4 focus-within:border-[#FF6A3D]/50 focus-within:ring-1 focus-within:ring-[#FF6A3D]/10 transition">
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
        <p className="text-[10px] text-gray-600 text-center mt-2.5 font-medium">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
