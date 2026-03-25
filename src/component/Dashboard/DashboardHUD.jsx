import React, { useState, useEffect } from "react";
import { 
  Terminal, Globe, Folder, LayoutDashboard, Settings, 
  Play, Pause, Mic, Activity, Cpu, Mail, Zap, X, Minus, Maximize2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NeuralCore from "./NeuralCore";
import SystemStats from "./SystemStats";
import ConversationLog from "./ConversationLog";
import ControlBar from "./ControlBar";
import HumanoidPresence from "./HumanoidPresence";
import "../../styles/DashboardHUD.css";

const DashboardHUD = () => {
  const [isActive, setIsActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Background elements */}
      <div className="scanline" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#00f0ff_0%,transparent_50%)]" />
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#00ffae_0%,transparent_50%)]" />
      </div>

      {/* Header Info */}
      <header className="fixed top-6 left-8 right-8 flex justify-between items-center z-50 pointer-events-none backdrop-blur-sm bg-black/10 rounded-lg p-2 border border-cyan-500/10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 border border-cyan-500/30 flex items-center justify-center rounded-md bg-cyan-500/5 glow-box">
                <span className="text-cyan-400 font-bold text-lg">N</span>
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-widest text-[#00f0ff] glow-text">NEXTBOT CORE</h1>
                <p className="text-[10px] text-cyan-400/60 font-mono tracking-tighter">OS_VERSION: 4.10.2_MARS</p>
             </div>
          </div>
        </div>

        <div className="flex gap-12 font-mono text-[11px] text-cyan-400/80">
          <div className="flex flex-col items-end">
            <span className="text-cyan-500/40 uppercase">System Status</span>
            <span className="text-[#00ffae] glow-green">OPTIMAL_OPERATIONAL_STATE</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-cyan-500/40 uppercase">Local Time</span>
            <span className="text-cyan-400 text-sm font-bold">{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-12 gap-8 w-full max-w-[1700px] h-[75vh] relative z-20 mt-16 px-6">
        {/* Left Side: System Stats */}
        <section className="col-span-3 h-full overflow-hidden">
          <SystemStats />
        </section>

        {/* Center: Neural Core AI Brain */}
        <section className="col-span-6 h-full flex items-center justify-center relative">
          <HumanoidPresence />
          <NeuralCore />
        </section>

        {/* Right Side: Conversation Log */}
        <section className="col-span-3 h-full overflow-hidden">
           <ConversationLog />
        </section>
      </main>

       {/* Bottom Control Bar */}
       <ControlBar />
    </div>
  );
};

export default DashboardHUD;
