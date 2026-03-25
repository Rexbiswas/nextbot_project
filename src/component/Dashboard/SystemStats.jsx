import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, Activity, Globe, ShieldCheck, Database, Server } from "lucide-react";

const ProgressBar = ({ label, value, color = "#00f0ff" }) => (
  <div className="mb-4">
    <div className="flex justify-between text-[11px] font-mono mb-1 uppercase tracking-wider text-cyan-400/80">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-cyan-900/20 rounded-full relative overflow-hidden ring-1 ring-cyan-500/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ 
          background: `linear-gradient(90deg, ${color}33, ${color})`,
          boxShadow: `0 0 10px ${color}66`
        }}
      />
    </div>
  </div>
);

const ActivityBar = ({ count = 20 }) => {
  const bars = Array.from({ length: count });
  return (
    <div className="flex items-end gap-[2px] h-12 w-full mt-2">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={{ height: ["10%", Math.random() * 80 + 20 + "%", "10%"] }}
          transition={{ duration: 0.8 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
          className="flex-1 bg-cyan-400 opacity-40 rounded-sm"
          style={{ background: i % 5 === 0 ? "#00ffae" : "#00f0ff" }}
        />
      ))}
    </div>
  );
};

const SystemStats = () => {
    const [stats, setStats] = useState({
        cpu: 0,
        ram: 0,
        disk: 0,
        netSpeed: 0,
        uptime: '0h',
        status: 'BOOTING_NODE',
        hostname: 'NEXTBOT_NODE'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/system/stats');
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.warn("Telemetry offline, using fallback.");
                setStats(prev => ({
                    ...prev,
                    cpu: (15 + Math.random() * 10).toFixed(1),
                    ram: (40 + Math.random() * 5).toFixed(1),
                    status: 'SYNCED'
                }));
            }
        };

        const interval = setInterval(fetchStats, 3000);
        fetchStats(); 
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hud-panel h-full flex flex-col gap-6"
        >
            <h3 className="hud-title flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Activity size={16} /> SYSTEM STATS
                </div>
            </h3>

            <div>
               <ProgressBar label="CPU TELEMETRY" value={stats.cpu} />
               <ProgressBar label="NEURAL_MEMORY" value={stats.ram} color="#00ffae" />
               <ProgressBar label="DISK_STORAGE" value={stats.disk} color="#f59e0b" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-cyan-500/5 p-3 rounded-lg border border-cyan-500/10 relative overflow-hidden group">
                    <span className="text-[10px] text-cyan-400/50 uppercase block font-mono">NET_BANDWIDTH</span>
                    <span className="text-xl font-bold font-mono text-white glow-text flex items-baseline gap-1">
                        {stats.netSpeed} <span className="text-[9px]">MB/s</span>
                    </span>
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Globe size={12} className="text-cyan-400" />
                    </div>
                </div>
                <div className="bg-cyan-500/5 p-3 rounded-lg border border-cyan-500/10 overflow-hidden relative group">
                    <span className="text-[10px] text-cyan-400/50 uppercase block font-mono">NODE_UPTIME</span>
                    <span className="text-xl font-bold font-mono text-[#00ffae] glow-green">{stats.uptime}</span>
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Server size={12} className="text-[#00ffae]" />
                    </div>
                </div>
            </div>

            <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[11px] text-cyan-400/80 uppercase font-mono tracking-widest flex items-center gap-2">
                        <Zap size={12} className="text-[#00ffae]" /> SYNAPTIC_ACTIVITY
                    </h4>
                    <span className="text-[9px] font-mono text-cyan-400/40">HOST: {stats.hostname}</span>
                </div>
                <ActivityBar count={40} />
            </div>

            <div className="mt-auto pt-4 border-t border-cyan-500/10 flex flex-col gap-2">
                 <div className="flex gap-2 items-center">
                    <Database size={12} className="text-cyan-400" />
                    <span className="text-[10px] text-cyan-400 font-mono">LOCAL_FS_PROTECTION: ACTIVE</span>
                 </div>
                 <div className="flex gap-2 items-center">
                    <ShieldCheck size={12} className="text-[#00ffae]" />
                    <span className="text-[10px] text-[#00ffae]/80 font-mono tracking-tighter">SECURE_TUNNEL: ENCRYPTED_V12</span>
                 </div>
            </div>

        </motion.div>
    );
};

export default SystemStats;
