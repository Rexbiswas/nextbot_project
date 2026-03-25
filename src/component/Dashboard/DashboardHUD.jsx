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
    <div className="dashboard-container relative min-h-screen overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#0b111a]">
      {/* Background elements */}
      <div className="scanline" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#00f0ff_0%,transparent_50%)]" />
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#00ffae_0%,transparent_50%)]" />
      </div>

      {/* Header Info - Responsive Adjustments */}
      <header className="fixed top-2 left-2 right-2 lg:top-6 lg:left-8 lg:right-8 flex flex-col md:flex-row justify-between items-center z-100 gap-4 backdrop-blur-md bg-black/20 rounded-xl p-3 lg:p-2 border border-cyan-500/10 shadow-2xl">
        <div className="flex items-center gap-4 lg:gap-6 w-full md:w-auto justify-between md:justify-start px-2 md:px-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 lg:w-10 lg:h-10 border border-cyan-500/30 flex items-center justify-center rounded-md bg-cyan-500/5 glow-box">
                <span className="text-cyan-400 font-bold text-base lg:text-lg">N</span>
             </div>
             <div>
                <h1 className="text-sm lg:text-xl font-bold tracking-widest text-[#00f0ff] glow-text leading-tight">NEXTBOT CORE</h1>
                <p className="text-[8px] lg:text-[10px] text-cyan-400/60 font-mono tracking-tighter uppercase whitespace-nowrap">OS_VERSION: 12.A_MARS</p>
             </div>
          </div>
          {/* Mobile Time / Status */}
          <div className="md:hidden flex flex-col items-end">
             <span className="text-[#00ffae] text-[9px] font-mono animate-pulse">SYNCED</span>
             <span className="text-cyan-400 text-[10px] font-mono font-bold">{currentTime}</span>
          </div>
        </div>

        <div className="hidden md:flex gap-8 lg:gap-12 font-mono text-[10px] lg:text-[11px] text-cyan-400/80">
          <div className="flex flex-col items-end">
            <span className="text-cyan-500/40 uppercase text-[8px] lg:text-[9px]">Node_Identity</span>
            <span className="text-[#00ffae] glow-green tracking-widest uppercase">SYNERGY_OPTIMAL</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-cyan-500/40 uppercase text-[8px] lg:text-[9px]">Lattice_Clock</span>
            <span className="text-cyan-400 text-xs lg:text-sm font-bold tracking-[2px]">{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Main Grid - Fully Responsive Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full max-w-[1700px] lg:h-[75vh] relative z-20 mt-24 md:mt-32 lg:mt-24 px-4 lg:px-8 mb-32 lg:mb-0">
        
        {/* Left Side: System Stats - Col 3 Desktop, Row 1 Mobile */}
        <section className="col-span-1 lg:col-span-3 h-auto lg:h-full order-2 lg:order-1">
          <SystemStats />
        </section>

        {/* Center: Neural Core - Col 6 Desktop, Hero on Mobile */}
        <section className="col-span-1 lg:col-span-6 h-[400px] md:h-[500px] lg:h-full flex items-center justify-center relative order-1 lg:order-2 overflow-visible">
          <div className="absolute inset-0 scale-[0.7] md:scale-[0.8] lg:scale-100 flex items-center justify-center pointer-events-none">
            <HumanoidPresence />
            <NeuralCore />
          </div>
        </section>

        {/* Right Side: Conversation Log - Col 3 Desktop, Row 3 Mobile */}
        <section className="col-span-1 lg:col-span-3 h-[500px] lg:h-full order-3">
           <ConversationLog />
        </section>
      </main>

       {/* Bottom Control Bar - Responsive Handling */}
       <div className="fixed bottom-0 left-0 right-0 z-100 p-4 lg:p-0">
          <ControlBar />
       </div>
    </div>
  );
};

export default DashboardHUD;
