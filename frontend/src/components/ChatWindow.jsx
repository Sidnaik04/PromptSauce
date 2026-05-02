import { useEffect, useRef } from "react";
import useStore from "../store/useStore";
import Message from "./Message";
import { PromptsauceIcon } from "./PromptsauceIcon";

export default function ChatWindow({ advancedMode }) {
  const currentChat = useStore((s) => s.currentChat);
  const user = useStore((s) => s.user);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  if (currentChat.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-y-auto">
        <div className="mb-6 opacity-80 flex justify-center">
          <PromptsauceIcon width="84" height="84" />
        </div>
        {user && (
          <p className="text-sm text-gray-400 mb-4">
            Welcome back,{" "}
            <span className="text-[#FF6A3D] font-semibold">
              {user.username || user.email}
            </span>
            !
          </p>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
          Improve Your Prompts
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
          Type any prompt below.{" "}
          <span className="text-[#FF6A3D] font-medium">PromptSauce</span> will
          enhance it, explain improvements, and help you get better results from
          any LLM.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 text-sm text-gray-500">
          <span>✓ AI Enhancement</span>
          <span>✓ Evaluation</span>
          <span>✓ Learning</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="max-w-3xl mx-auto">
        {currentChat.map((msg, i) => (
          <Message key={i} msg={msg} advancedMode={advancedMode} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
