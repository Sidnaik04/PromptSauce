import { useState } from "react";

const PLATFORMS = [
  { label: "ChatGPT", url: "https://chat.openai.com" },
  { label: "Claude", url: "https://claude.ai" },
  { label: "Gemini", url: "https://gemini.google.com" },
  { label: "Grok", url: "https://grok.x.ai" },
];

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition duration-150 font-medium"
    >
      {copied ? "✓ Copied" : "📋 Copy"}
    </button>
  );
};

const Section = ({ label, content, isHighlight = false }) => {
  if (!content) return null;
  return (
    <div className={`mt-3.5 ${isHighlight ? "bg-[#FF6A3D]/5 border border-[#FF6A3D]/20 rounded-lg p-3" : ""}`}>
      <p className={`text-[10px] uppercase tracking-widest mb-2 font-semibold ${isHighlight ? "text-[#FF6A3D]" : "text-gray-500"}`}>
        {label}
      </p>
      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
};

export default function Message({ msg, advancedMode }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-5">
        <div className="max-w-2xl bg-[#FF6A3D]/10 border border-[#FF6A3D]/20 rounded-2xl rounded-tr-sm px-5 py-3.5">
          <p className="text-sm text-white leading-relaxed">{msg.content}</p>
        </div>
      </div>
    );
  }

  // Streaming placeholder with better animation
  if (msg.role === "streaming") {
    return (
      <div className="flex justify-start mb-5">
        <div className="max-w-2xl w-full bg-[#2A2A2A]/60 border border-[#FF6A3D]/40 rounded-2xl rounded-tl-sm px-5 py-4 backdrop-blur-sm shadow-lg shadow-[#FF6A3D]/10">
          <div className="flex items-start gap-2 mb-2">
            <div className="flex gap-1 mt-1">
              <div className="w-1.5 h-1.5 bg-[#FF6A3D] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-[#FF6A3D] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-[#FF6A3D] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-xs text-[#FF6A3D] font-semibold">Generating...</p>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-mono text-[#FF6A3D]/80">
            {msg.content}
          </p>
        </div>
      </div>
    );
  }

  // AI response - Normal and Advanced modes
  return (
    <div className="flex justify-start mb-5">
      {advancedMode ? (
        // Advanced mode: More detailed layout with evaluation
        <div className="max-w-4xl w-full space-y-3">
          {/* Enhanced Prompt - Highlighted */}
          <div className="bg-[#2A2A2A] border border-[#FF6A3D]/30 rounded-2xl rounded-tl-sm px-6 py-5">
            <p className="text-xs text-[#FF6A3D] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF6A3D] rounded-full"></span>
              ✦ Enhanced Prompt
            </p>
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap font-medium">
              {msg.enhanced_prompt}
            </p>
          </div>

          {/* Evaluation Scores Grid */}
          {msg.evaluation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">Original Score</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">
                    {msg.evaluation?.original_score?.toFixed(1) ?? "—"}
                  </p>
                  <span className="text-xs text-gray-500">/10</span>
                </div>
              </div>
              <div className="bg-[#2A2A2A] border border-[#FF6A3D]/30 rounded-xl px-4 py-4">
                <p className="text-xs text-[#FF6A3D] uppercase tracking-widest mb-2 font-semibold">Enhanced Score</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-[#FF6A3D]">
                    {msg.evaluation?.enhanced_score?.toFixed(1) ?? "—"}
                  </p>
                  <span className="text-xs text-[#FF6A3D]/60">/10</span>
                </div>
              </div>
            </div>
          )}

          {/* Explanation and Insights Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#2A2A2A] border border-white/10 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">Why it works</p>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {msg.explanation}
              </p>
            </div>
            {msg.insights && (
              <div className="bg-[#2A2A2A] border border-white/10 rounded-xl px-5 py-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">Key insights</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {msg.insights}
                </p>
              </div>
            )}
          </div>

          {/* Improvement Badge */}
          {msg.evaluation && (
            <div className="bg-[#FF6A3D]/10 border border-[#FF6A3D]/20 rounded-xl px-4 py-3">
              <p className="text-xs text-[#FF6A3D] font-semibold">
                ⚡ {(msg.evaluation?.enhanced_score - msg.evaluation?.original_score).toFixed(1)} point improvement
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <CopyButton text={msg.enhanced_prompt} />
            {PLATFORMS.map((p) => (
              <a
                key={p.label}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition duration-150 font-medium"
              >
                {p.label} ↗
              </a>
            ))}
          </div>
        </div>
      ) : (
        // Normal mode: Simpler, cleaner layout
        <div className="max-w-2xl w-full bg-[#2A2A2A] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-5">
          <Section label="✦ Enhanced Prompt" content={msg.enhanced_prompt} isHighlight={true} />
          <Section label="How it works" content={msg.explanation} />

          {/* Actions */}
          <div className="mt-4.5 pt-3.5 border-t border-white/5 flex flex-wrap gap-2">
            <CopyButton text={msg.enhanced_prompt} />
            {PLATFORMS.map((p) => (
              <a
                key={p.label}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition duration-150 font-medium"
              >
                {p.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
