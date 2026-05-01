import { useState } from "react";

const PLATFORMS = [
  {
    label: "ChatGPT",
    url: "https://chat.openai.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.98 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.91 6.051 6.051 0 0 0 6.515 2.9 6.065 6.065 0 0 0 10.274-2.17 5.985 5.985 0 0 0 4.002-2.899 6.045 6.045 0 0 0-.744-7.096zM9.79 20.93c-2.31.258-4.572-1.077-5.347-3.153l6.452-3.725v4.542a.855.855 0 0 0 .428.742l2.366 1.365a4.237 4.237 0 0 1-3.899.229zm-4.275-2.09A4.26 4.26 0 0 1 2.27 13.91l4.896 2.827v-5.26L2.34 8.685a.853.853 0 0 0-.427-.743L1.91 7.942l4.632 2.674c1.192 1.385 3.197 1.705 4.707.75v5.474zM3.46 6.471a4.256 4.256 0 0 1 5.346-3.152l-1.554 4.542L4.887 6.495a.855.855 0 0 0-.855 0L1.666 7.86l1.794-1.39zm15.111 2.088a4.257 4.257 0 0 1 3.245 4.93L16.92 10.66v5.26l4.825 2.793a.852.852 0 0 0 .427.742l.004-.002-4.634-2.676c-1.192-1.385-3.197-1.705-4.707-.75v-5.473zM20.54 17.53a4.256 4.256 0 0 1-5.346 3.152l1.554-4.542 2.365 1.365a.855.855 0 0 0 .855 0l2.366-1.365-1.794 1.39zm-6.326 1.255V14.24L9.39 11.446l-4.826 2.792a.853.853 0 0 0-.427.743v5.35c0 .313.168.6.438.756zM14.214 5.21v4.546l4.825-2.793a.853.853 0 0 0 .428-.743V.87c0-.312-.168-.6-.438-.755l-4.815 2.78z" />
      </svg>
    ),
  },
  {
    label: "Claude",
    url: "https://claude.ai",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.43 2.122C16.892.353 15.36 0 15.36 0H8.64s-1.533.353-2.07 2.122C6.033 3.89 4.385 5.54 2.616 6.077.848 6.615.495 8.147.495 8.147v6.72s.353 1.533 2.121 2.07c1.77.537 3.418 2.186 3.955 3.955.537 1.768 2.07 2.12 2.07 2.12h6.72s1.533-.352 2.07-2.12c.537-1.77 2.186-3.418 3.955-3.956 1.768-.537 2.12-2.07 2.12-2.07v-6.72s-.352-1.532-2.12-2.07c-1.769-.537-3.418-2.186-3.956-3.954Zm-5.43 15.1c-2.883 0-5.221-2.338-5.221-5.221 0-2.883 2.338-5.222 5.221-5.222 2.883 0 5.222 2.339 5.222 5.222 0 2.883-2.339 5.221-5.222 5.221Z" />
      </svg>
    ),
  },
  {
    label: "Gemini",
    url: "https://gemini.google.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.633 11.233c-5.96-.547-10.853-5.44-11.4-11.4-.14-1.28-1.993-1.28-2.133 0-.547 5.96-5.44 10.853-11.4 11.4-1.28.14-1.28 1.993 0 2.133 5.96.547 10.853 5.44 11.4 11.4.14 1.28 1.993 1.28 2.133 0 .547-5.96 5.44-10.853 11.4-11.4 1.28-.14 1.28-1.993 0-2.133z" />
      </svg>
    ),
  },
  {
    label: "Grok",
    url: "https://grok.x.ai",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
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
    <div
      className={`mt-3.5 ${isHighlight ? "bg-[#FF6A3D]/5 border border-[#FF6A3D]/20 rounded-lg p-3" : ""}`}
    >
      <p
        className={`text-[10px] uppercase tracking-widest mb-2 font-semibold ${isHighlight ? "text-[#FF6A3D]" : "text-gray-500"}`}
      >
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
              <div
                className="w-1.5 h-1.5 bg-[#FF6A3D] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-[#FF6A3D] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-1.5 h-1.5 bg-[#FF6A3D] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <p className="text-xs text-[#FF6A3D] font-semibold">
              Generating...
            </p>
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
              <span className="w-2 h-2 bg-[#FF6A3D] rounded-full"></span>✦
              Enhanced Prompt
            </p>
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap font-medium">
              {msg.enhanced_prompt}
            </p>
          </div>

          {/* Evaluation Scores Grid */}
          {msg.evaluation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#2A2A2A] border border-white/10 rounded-xl px-4 py-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">
                  Original Score
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-white">
                    {msg.evaluation?.original_score?.toFixed(1) ?? "—"}
                  </p>
                  <span className="text-xs text-gray-500">/10</span>
                </div>
              </div>
              <div className="bg-[#2A2A2A] border border-[#FF6A3D]/30 rounded-xl px-4 py-4">
                <p className="text-xs text-[#FF6A3D] uppercase tracking-widest mb-2 font-semibold">
                  Enhanced Score
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-[#FF6A3D]">
                    {msg.evaluation?.enhanced_score?.toFixed(1) ?? "—"}
                  </p>
                  <span className="text-xs text-[#FF6A3D]/60">/10</span>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          {msg.insights && (
            <div className="bg-[#2A2A2A] border border-white/10 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">
                Key insights
              </p>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {msg.insights}
              </p>
            </div>
          )}

          {/* Improvement Badge */}
          {msg.evaluation && (
            <div className="bg-[#FF6A3D]/10 border border-[#FF6A3D]/20 rounded-xl px-4 py-3">
              <p className="text-xs text-[#FF6A3D] font-semibold">
                ⚡{" "}
                {(
                  msg.evaluation?.enhanced_score -
                  msg.evaluation?.original_score
                ).toFixed(1)}{" "}
                point improvement
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
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition duration-150 font-medium"
              >
                {p.icon}
                <span>{p.label}</span> ↗
              </a>
            ))}
          </div>
        </div>
      ) : (
        // Normal mode: Simpler, cleaner layout
        <div className="max-w-2xl w-full bg-[#2A2A2A] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-5">
          <Section
            label="✦ Enhanced Prompt"
            content={msg.enhanced_prompt}
            isHighlight={true}
          />

          {/* Actions */}
          <div className="mt-4.5 pt-3.5 border-t border-white/5 flex flex-wrap gap-2">
            <CopyButton text={msg.enhanced_prompt} />
            {PLATFORMS.map((p) => (
              <a
                key={p.label}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition duration-150 font-medium"
              >
                {p.icon}
                <span>{p.label}</span> ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
