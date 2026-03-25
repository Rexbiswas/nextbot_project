import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Terminal, Globe, Folder, Zap, 
    Play, Mic, RotateCcw, Moon, 
    Settings, Power, LayoutDashboard, Database
} from "lucide-react";
import { useAssistant } from "../../hooks/useAssistant";

const ControlButton = ({ icon: Icon, label, color = "#00f0ff", onClick, active }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={onClick}
            className={`hud-panel flex items-center gap-3 px-6 py-3 cursor-pointer group relative overflow-hidden ${active ? "glow-active" : ""}`}
            style={{ 
                borderColor: (hovered || active) ? color : "rgba(0, 240, 255, 0.2)",
                boxShadow: (hovered || active) ? `0 0 15px ${color}66` : "0 0 10px rgba(0, 240, 255, 0.1)"
            }}
        >
            <Icon size={20} className="transition-colors group-hover:text-white" style={{ color: (hovered || active) ? "#fff" : color }} />
            <span className="text-[14px] uppercase font-bold tracking-[3px] transition-all group-hover:text-white" style={{ color: (hovered || active) ? "#fff" : color }}>{label}</span>
            {(hovered || active) && (
                <motion.div 
                    layoutId="glow" 
                    className="absolute inset-x-2 -bottom-1 h-[2px] rounded-full" 
                    style={{ background: color, boxShadow: `0 0 10px ${color}` }}
                />
            )}
            {active && (
                <div className="absolute inset-0 bg-cyan-500/10 animate-pulse pointer-events-none" />
            )}
        </motion.button>
    );
};

const QuickIcon = ({ icon: Icon, label, isActive }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`flex flex-col items-center gap-1 cursor-pointer group p-2 rounded-lg transition-colors ${isActive ? "bg-cyan-500/10" : "hover:bg-white/5"}`}
    >
        <div className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-all ${isActive ? "border-cyan-500/40 text-[#00f0ff]" : "border-white/10 text-white/40 group-hover:border-white/30 group-hover:text-white"}`}>
            <Icon size={20} />
        </div>
        <span className={`text-[9px] uppercase font-mono tracking-widest transition-colors ${isActive ? "text-[#00f0ff]" : "text-white/30 group-hover:text-white/60"}`}>{label}</span>
    </motion.div>
);

const ControlBar = () => {
    const { handleMicClick, isListening } = useAssistant();
    return (
        <motion.footer 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed bottom-6 left-8 right-8 flex items-center justify-between z-50 h-24"
        >
            {/* Left side: Functional Controls */}
            <div className="flex gap-6 items-center">
                <ControlButton icon={Play} label="START" color="#00f0ff" onClick={() => window.dispatchEvent(new Event('start-nextbot'))} />
                <ControlButton icon={Mic} label={isListening ? "STOP" : "LISTEN"} color="#00ffae" onClick={handleMicClick} active={isListening} />
                <ControlButton icon={Zap} label="EXECUTE" color="#00ffae" />
                <ControlButton icon={Moon} label="SLEEP" color="rgba(255, 255, 255, 0.5)" />
            </div>

            {/* Center: System Dashboard Info */}
            <div className="flex-1 px-12 h-full flex items-center justify-center">
                 <div className="flex flex-col items-center gap-1 opacity-40">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="w-1 h-3 bg-cyan-400/20" />
                        ))}
                    </div>
                 </div>
            </div>

            {/* Right side: Quick Access Icons */}
            <div className="hud-panel py-2! px-6 flex items-center gap-4">
                <QuickIcon icon={Terminal} label="TERMINAL" isActive={true} />
                <QuickIcon icon={Globe} label="BROWSER" />
                <QuickIcon icon={Folder} label="FILES" />
                <QuickIcon icon={Database} label="AUTOMATION" />
                <div className="w-px h-8 bg-white/10 mx-2" />
                <QuickIcon icon={Settings} label="CONFIG" />
                <div className="w-10 h-10 border border-[#ff3131]/30 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-[#ff3131] cursor-pointer transition-all">
                    <Power size={20} />
                </div>
            </div>
        </motion.footer>
    );
};

export default ControlBar;
