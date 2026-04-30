import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import InputBox from "../components/InputBox";

export default function Dashboard() {
  const [advancedMode, setAdvancedMode] = useState(false);

  return (
    <div className="flex h-screen bg-[#1E1E1E] text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatWindow advancedMode={advancedMode} />
        <InputBox
          advancedMode={advancedMode}
          setAdvancedMode={setAdvancedMode}
        />
      </div>
    </div>
  );
}
