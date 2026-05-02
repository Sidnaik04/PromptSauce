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

const Section = ({ label, content }) => {
  if (!content) return null;
  return (
    <div className="mt-3.5">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">
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

  // Streaming placeholder
  if (msg.role === "streaming") {
    return (
      <div className="flex justify-start mb-5">
        <div className="max-w-2xl w-full bg-[#2A2A2A] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4">
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {msg.content}
            <span className="inline-block w-1.5 h-4 bg-[#FF6A3D] ml-0.5 animate-pulse rounded-sm align-middle" />
          </p>
        </div>
      </div>
    );
  }

  // AI response
  return (
    <div className="flex justify-start mb-5">
      <div className="max-w-2xl w-full bg-[#2A2A2A] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-5">
        <Section label="Enhanced Prompt" content={msg.enhanced_prompt} />
        <Section label="Explanation" content={msg.explanation} />

        {advancedMode && (
          <>
            <Section label="Insights" content={msg.insights} />
            {msg.evaluation && (
              <div className="mt-3.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2.5 font-semibold">
                  Evaluation
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#1E1E1E] rounded-lg px-3 py-2.5">
                    <span className="text-gray-500 text-xs">Original</span>
                    <p className="text-white font-semibold text-base">
                      {msg.evaluation?.original_score ?? "—"}
                    </p>
                  </div>
                  <div className="bg-[#1E1E1E] rounded-lg px-3 py-2.5 border border-[#FF6A3D]/20">
                    <span className="text-[#FF6A3D] text-xs">Enhanced</span>
                    <p className="text-[#FF6A3D] font-semibold text-base">
                      {msg.evaluation?.enhanced_score ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

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
              {p.label} 
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
