import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

const features = [
  {
    icon: "✦",
    title: "Prompt Enhancement",
    desc: "AI rewrites your prompt for maximum clarity and output quality.",
  },
  {
    icon: "◎",
    title: "AI Evaluation",
    desc: "Scores original vs enhanced prompt with mode-aware criteria.",
  },
  {
    icon: "⟳",
    title: "Learning System",
    desc: "Adapts to your tone, style and structure over time.",
  },
  {
    icon: "⚡",
    title: "Streaming Output",
    desc: "See results token-by-token in real time.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const logout = useStore((s) => s.logout);

  if (token && user) {
    navigate("/dashboard");
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <span className="text-lg font-bold tracking-tight text-[#FF6A3D]">
          ✦ PromptSauce
        </span>
        <div className="flex gap-3 items-center">
          {user && token ? (
            <>
              <span className="text-sm text-gray-400">
                Welcome,{" "}
                <span className="text-white font-semibold">
                  {user.username || user.email}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition duration-150 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition duration-150 font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="px-5 py-2 text-sm bg-[#FF6A3D] rounded-lg hover:bg-orange-500 transition duration-150 font-semibold shadow-lg shadow-[#FF6A3D]/20"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-8 py-32">
        <div className="inline-block px-4 py-1.5 text-xs bg-[#FF6A3D]/10 text-[#FF6A3D] rounded-full border border-[#FF6A3D]/20 mb-2 font-medium">
          ✨ AI-Powered Prompt Optimization
        </div>
        <div>
          <h1 className="text-6xl font-bold tracking-tight max-w-3xl leading-tight mb-4">
            Write Better Prompts
            <br />
            <span className="text-[#FF6A3D]">with AI</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Enhance, evaluate, and learn from your prompts automatically. Works
            with any LLM, at any scale.
          </p>
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="mt-4 px-10 py-4 bg-[#FF6A3D] hover:bg-orange-500 rounded-xl text-white font-bold text-lg transition duration-150 shadow-lg shadow-[#FF6A3D]/30 hover:shadow-[#FF6A3D]/50"
        >
          Get Started Free
        </button>
        <p className="text-sm text-gray-500 mt-2">
          No credit card required. 20 requests/minute on free tier.
        </p>
      </main>

      {/* Features */}
      <section className="px-8 pb-32 max-w-6xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-16">
          Why PromptSauce?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#2A2A2A] rounded-2xl p-6 flex flex-col gap-3 border border-white/5 hover:border-white/10 hover:shadow-lg transition duration-150"
            >
              <span className="text-3xl text-[#FF6A3D]">{f.icon}</span>
              <h3 className="font-bold text-white text-lg">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
