import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { PromptsauceIcon } from "../components/PromptsauceIcon";
// SVG Icon Components
const GlowIcon = () => (
  <svg
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 122.88 108.69"
    width="24"
    height="24"
    fill="currentColor"
  >
    <title>glow</title>
    <path d="M95.24,91.38H94.4a1.65,1.65,0,0,1-1.65-1.65,22.91,22.91,0,0,0-1.81-9.12A27.06,27.06,0,0,0,77.52,67.19a23.05,23.05,0,0,0-9.12-1.81,1.65,1.65,0,0,1-1.64-1.64v-.85a1.64,1.64,0,0,1,1.64-1.64,22.88,22.88,0,0,0,9.12-1.82,25.35,25.35,0,0,0,7.93-5.49A25.62,25.62,0,0,0,90.94,46a22.87,22.87,0,0,0,1.81-9.11,1.65,1.65,0,0,1,1.65-1.64h.84a1.65,1.65,0,0,1,1.65,1.64A22.88,22.88,0,0,0,98.7,46a25.24,25.24,0,0,0,5.49,7.93,25.19,25.19,0,0,0,7.93,5.49,22.88,22.88,0,0,0,9.12,1.82,1.64,1.64,0,0,1,1.64,1.64v.85a1.65,1.65,0,0,1-1.64,1.64,23.05,23.05,0,0,0-9.12,1.81A27.06,27.06,0,0,0,98.7,80.61a23,23,0,0,0-1.81,9.12,1.65,1.65,0,0,1-1.65,1.65ZM33.63,66.25h-1A1.65,1.65,0,0,1,31,64.6a27.75,27.75,0,0,0-2.18-11,30.56,30.56,0,0,0-6.61-9.54,30.67,30.67,0,0,0-9.54-6.61,27.79,27.79,0,0,0-11-2.18A1.65,1.65,0,0,1,0,33.64v-1A1.65,1.65,0,0,1,1.64,31a27.63,27.63,0,0,0,11-2.19,30.39,30.39,0,0,0,9.54-6.61,30.9,30.9,0,0,0,6.61-9.57A27.68,27.68,0,0,0,31,1.64,1.65,1.65,0,0,1,32.62,0h1a1.65,1.65,0,0,1,1.64,1.64,27.54,27.54,0,0,0,2.19,11,30.24,30.24,0,0,0,6.6,9.54,30.34,30.34,0,0,0,9.54,6.61,27.61,27.61,0,0,0,11,2.19,1.64,1.64,0,0,1,1.65,1.64v1a1.65,1.65,0,0,1-1.65,1.65,27.78,27.78,0,0,0-11,2.18A32.51,32.51,0,0,0,37.46,53.61a27.61,27.61,0,0,0-2.19,11,1.65,1.65,0,0,1-1.64,1.65ZM31.8,52.33a29.66,29.66,0,0,1,1.32,3.74,29.66,29.66,0,0,1,1.32-3.74,35.66,35.66,0,0,1,17.88-17.9,29.61,29.61,0,0,1,3.74-1.31,31.33,31.33,0,0,1-3.74-1.32,33.65,33.65,0,0,1-10.57-7.3,33.51,33.51,0,0,1-7.31-10.58,28.43,28.43,0,0,1-1.32-3.76,29,29,0,0,1-1.32,3.73,33.71,33.71,0,0,1-7.3,10.6,33.59,33.59,0,0,1-10.58,7.32,30.87,30.87,0,0,1-3.75,1.32,27.81,27.81,0,0,1,3.75,1.32,33.37,33.37,0,0,1,10.57,7.3A33.4,33.4,0,0,1,31.8,52.33Zm14.72,56.36H46a1.64,1.64,0,0,1-1.64-1.64,13.58,13.58,0,0,0-1.07-5.39,16.07,16.07,0,0,0-8-8,13.66,13.66,0,0,0-5.4-1.07A1.64,1.64,0,0,1,28.27,91v-.54a1.64,1.64,0,0,1,1.64-1.64,13.58,13.58,0,0,0,5.39-1.07,16,16,0,0,0,8-8,13.6,13.6,0,0,0,1.07-5.38A1.65,1.65,0,0,1,46,72.72h.53a1.64,1.64,0,0,1,1.64,1.64,13.49,13.49,0,0,0,1.08,5.4,16,16,0,0,0,8,8,13.42,13.42,0,0,0,5.4,1.07,1.64,1.64,0,0,1,1.64,1.65V91a1.64,1.64,0,0,1-1.64,1.64,13.66,13.66,0,0,0-5.4,1.07A15.18,15.18,0,0,0,52.5,97l-.08.08a14.78,14.78,0,0,0-3.19,4.61,13.62,13.62,0,0,0-1.07,5.4,1.63,1.63,0,0,1-1.64,1.64ZM42.33,94.63a18.13,18.13,0,0,1,3.92,5.64,18.33,18.33,0,0,1,3.85-5.55l.08-.09a18.31,18.31,0,0,1,5.66-3.92,19.33,19.33,0,0,1-9.59-9.58,18.24,18.24,0,0,1-3.92,5.64,18.37,18.37,0,0,1-5.65,3.93,18.37,18.37,0,0,1,5.65,3.93ZM94,79.33c.32.76.61,1.53.86,2.32.25-.79.54-1.56.86-2.32a30.17,30.17,0,0,1,15.15-15.15c.77-.33,1.54-.62,2.33-.87a22.52,22.52,0,0,1-2.33-.86,28.57,28.57,0,0,1-9-6.18,28.78,28.78,0,0,1-6.2-9c-.32-.77-.61-1.54-.86-2.33-.25.78-.54,1.55-.86,2.31a28.69,28.69,0,0,1-6.19,9,28.63,28.63,0,0,1-9,6.2c-.77.32-1.54.61-2.33.86.79.25,1.56.54,2.33.87A30.17,30.17,0,0,1,94,79.33Z" />
  </svg>
);

const CircleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 122.88 122.88"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
  >
    <circle cx="61.44" cy="61.44" r="38" />
    <circle cx="61.44" cy="61.44" r="18" fill="currentColor" />
  </svg>
);

const ReloadIcon = () => (
  <svg
    id="Layer_1"
    data-name="Layer 1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 119.4 122.88"
    width="24"
    height="24"
    fill="currentColor"
  >
    <title>reload</title>
    <path d="M83.91,26.34a43.78,43.78,0,0,0-22.68-7,42,42,0,0,0-24.42,7,49.94,49.94,0,0,0-7.46,6.09,42.07,42.07,0,0,0-5.47,54.1A49,49,0,0,0,30,94a41.83,41.83,0,0,0,18.6,10.9,42.77,42.77,0,0,0,21.77.13,47.18,47.18,0,0,0,19.2-9.62,38,38,0,0,0,11.14-16,36.8,36.8,0,0,0,1.64-6.18,38.36,38.36,0,0,0,.61-6.69,8.24,8.24,0,1,1,16.47,0,55.24,55.24,0,0,1-.8,9.53A54.77,54.77,0,0,1,100.26,108a63.62,63.62,0,0,1-25.92,13.1,59.09,59.09,0,0,1-30.1-.25,58.45,58.45,0,0,1-26-15.17,65.94,65.94,0,0,1-8.1-9.86,58.56,58.56,0,0,1,7.54-75,65.68,65.68,0,0,1,9.92-8.09A58.38,58.38,0,0,1,61.55,2.88,60.51,60.51,0,0,1,94.05,13.3l-.47-4.11A8.25,8.25,0,1,1,110,7.32l2.64,22.77h0a8.24,8.24,0,0,1-6.73,9L82.53,43.31a8.23,8.23,0,1,1-2.9-16.21l4.28-.76Z" />
  </svg>
);

const BoltIcon = () => (
  <svg
    id="Layer_1"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 82.1 122.88"
    width="24"
    height="24"
    fill="currentColor"
  >
    <g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.62,0h50.2l-17.5,33.88L82.1,34.4L9.53,122.88l13.96-58.21L0,64.67L19.62,0L19.62,0L19.62,0z M13.92,53.48 l14.65-41.7h22.75L39.49,43.53l17.85,0.3L27.31,88.79l8.95-35.31L13.92,53.48L13.92,53.48L13.92,53.48z"
      />
    </g>
  </svg>
);

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 122.88 112.09" fill="currentColor">
    <path d="M61.44,109c-20.37,-17.68 -40.27,-35.07 -40.27,-55.21c0,-14.16 9.32,-24.64 21.35,-24.64c7.02,0 13.9,3.54 18.92,9.23c5.02,-5.69 11.9,-9.23 18.92,-9.23c12.03,0 21.35,10.48 21.35,24.64c0,20.14 -19.9,37.53 -40.27,55.21Z" />
  </svg>
);

const features = [
  {
    icon: <PromptsauceIcon />,
    title: "Prompt Enhancement",
    desc: "AI rewrites your prompt for maximum clarity and output quality.",
  },
  {
    icon: <CircleIcon />,
    title: "AI Evaluation",
    desc: "Scores original vs enhanced prompt with mode-aware criteria.",
  },
  {
    icon: <ReloadIcon />,
    title: "Learning System",
    desc: "Adapts to your tone, style and structure over time.",
  },
  {
    icon: <BoltIcon />,
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
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-white/5">
        <span className="text-lg font-bold tracking-tight text-[#FF6A3D]">
          <span className="flex items-center gap-2">
            <PromptsauceIcon />
            PromptSauce
          </span>
        </span>
        <div className="flex gap-2 sm:gap-3 items-center">
          {user && token ? (
            <>
              <span className="hidden sm:block text-sm text-gray-400">
                Welcome,{" "}
                <span className="text-white font-semibold">
                  {user.username || user.email}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 text-sm text-gray-300 hover:text-white transition duration-150 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className="px-3 sm:px-4 py-2 text-sm text-gray-300 hover:text-white transition duration-150 font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="px-4 sm:px-5 py-2 text-sm bg-[#FF6A3D] rounded-lg hover:bg-orange-500 transition duration-150 font-semibold shadow-lg shadow-[#FF6A3D]/20"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 text-center gap-6 sm:gap-8 py-16 sm:py-24 lg:py-32">
        <div className="inline-block px-3 sm:px-4 py-1.5 text-xs bg-[#FF6A3D]/10 text-[#FF6A3D] rounded-full border border-[#FF6A3D]/20 mb-2 font-medium">
          <span className="flex items-center gap-1.5">
            <GlowIcon />
            AI-Powered Prompt Optimization
          </span>
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl leading-tight mb-4">
            Write Better Prompts
            <br />
            <span className="text-[#FF6A3D]">with AI</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Enhance, evaluate, and learn from your prompts automatically. Works
            with any LLM, at any scale.
          </p>
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="mt-2 sm:mt-4 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#FF6A3D] hover:bg-orange-500 rounded-xl text-white font-bold text-base sm:text-lg transition duration-150 shadow-lg shadow-[#FF6A3D]/30 hover:shadow-[#FF6A3D]/50"
        >
          Get Started Free
        </button>
        <p className="text-sm text-gray-500">
          Get 3 free AI enhancements. Unlock unlimited with your API key.
        </p>
      </main>

      {/* Features */}
      <section className="px-4 sm:px-8 pb-16 sm:pb-24 lg:pb-32 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 lg:mb-16">
          Why PromptSauce?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#2A2A2A] rounded-2xl p-5 sm:p-6 flex flex-col gap-3 border border-white/5 hover:border-white/10 hover:shadow-lg transition duration-150"
            >
              <span className="text-3xl text-[#FF6A3D]">{f.icon}</span>
              <h3 className="font-bold text-white text-base sm:text-lg">
                {f.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-6 border-t border-white/5 mt-16 text-gray-500 text-xs">
        <div className="flex items-center justify-center gap-1.5 text-gray-400">
          <span className="text-[#FF6A3D]">
            <HeartIcon />
          </span>
          Developed by{" "}
          <a
            href="https://github.com/Sidnaik04"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            Sidnaik04
          </a>
        </div>
      </footer>
    </div>
  );
}
