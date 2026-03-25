import React, { useState, useEffect } from "react";
import { 
  Terminal, Globe, Folder, LayoutDashboard, Settings, 
  Play, Pause, Mic, Activity, Cpu, Mail, Zap, X, Minus, Maximize2, MessageSquare, BarChart3, Database
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
  const [activeTab, setActiveTab] = useState("core"); // core, stats, logs

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const TabButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center py-2 px-1 gap-1 transition-all duration-300 relative ${activeTab === id ? "text-cyan-400" : "text-cyan-400/40"}`}
    >
      <Icon size={20} className={activeTab === id ? "glow-text" : ""} />
      <span className="text-[8px] font-mono tracking-tighter uppercase">{label}</span>
      {activeTab === id && (
        <motion.div layoutId="activeTabGlow" className="absolute -bottom-1 w-8 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
      )}
    </button>
  );

  return (
    <div className="dashboard-container relative min-h-screen overflow-hidden bg-[#0b111a]">
      {/* Background elements */}
      <div className="scanline" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#00f0ff_0%,transparent_50%)]" />
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#00ffae_0%,transparent_50%)]" />
      </div>

      {/* Header Info */}
      <header className="fixed top-2 left-2 right-2 lg:top-6 lg:left-8 lg:right-8 flex justify-between items-center z-100 backdrop-blur-md bg-black/20 rounded-xl p-3 border border-cyan-500/10 shadow-2xl">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 lg:w-10 lg:h-10 border border-cyan-500/30 flex items-center justify-center rounded-md bg-cyan-500/5 glow-box">
              <span className="text-cyan-400 font-bold">N</span>
           </div>
           <div>
              <h1 className="text-xs lg:text-xl font-bold tracking-widest text-[#00f0ff] glow-text leading-tight">NEXTBOT CORE</h1>
              <p className="text-[8px] lg:text-[10px] text-cyan-400/60 font-mono uppercase">SYNERGY_LINK_ACTIVE</p>
           </div>
        </div>

        <div className="flex flex-col items-end font-mono">
            <span className="text-[#00ffae] text-[9px] animate-pulse uppercase tracking-widest">Neural_Synced</span>
            <span className="text-cyan-400 text-xs lg:text-sm font-bold tracking-[2px]">{currentTime}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 w-full max-w-[1700px] h-full flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:mt-24 px-4 lg:px-8 pb-32 lg:pb-0">
        
        {/* Mobile View Switching */}
        <AnimatePresence mode="wait">
          {/* System Stats (Col 3) */}
          {(activeTab === "stats" || typeof window !== 'undefined' && window.innerWidth > 1024) && (
            <motion.section 
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`${activeTab === "stats" ? "block" : "hidden lg:block"} col-span-1 lg:col-span-3 lg:h-[75vh] mt-24 lg:mt-0`}
            >
              <SystemStats />
            </motion.section>
          )}

          {/* Neural Core (Col 6) */}
          {(activeTab === "core" || typeof window !== 'undefined' && window.innerWidth > 1024) && (
            <motion.section 
              key="core"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${activeTab === "core" ? "flex" : "hidden lg:flex"} col-span-1 lg:col-span-6 h-[50vh] lg:h-[75vh] items-center justify-center relative mt-20 lg:mt-0`}
            >
              <div className="absolute inset-0 flex items-center justify-center scale-[0.6] sm:scale-[0.8] lg:scale-100">
                <HumanoidPresence />
                <NeuralCore />
              </div>
            </motion.section>
          )}

          {/* Conversation Log (Col 3) */}
          {(activeTab === "logs" || typeof window !== 'undefined' && window.innerWidth > 1024) && (
            <motion.section 
              key="logs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`${activeTab === "logs" ? "block" : "hidden lg:block"} col-span-1 lg:col-span-3 h-[50vh] lg:h-[75vh] mt-24 lg:mt-0`}
            >
               <ConversationLog />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

       {/* Mobile Tab Bar - Visible only on mobile */}
       <div className="lg:hidden fixed bottom-[88px] left-4 right-4 z-100 backdrop-blur-xl bg-black/40 border border-cyan-500/20 rounded-2xl grid grid-cols-3 p-1 shadow-2xl">
          <TabButton id="stats" icon={BarChart3} label="Telemetry" />
          <TabButton id="core" icon={Zap} label="Synergy" />
          <TabButton id="logs" icon={MessageSquare} label="Lattice" />
       </div>

       {/* Control Bar */}
       <ControlBar />
    </div>
  );
};

export default DashboardHUD;
