import { useState, useEffect } from 'react'
import { Activity, Wifi, Cpu, Cloud, MapPin, Mic, Bell, ListTodo } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssistant } from '../hooks/useAssistant'

// --- Style Utilities ---

const SciFiPanel = ({ children, className = '', title, type = 'normal', onClick, color = 'cyan' }) => {
    const clipStyle = type === 'reverse'
        ? "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
        : "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)"

    const colorClasses = {
        cyan: 'bg-cyan-500/20 group-hover:bg-cyan-400/40 border-cyan-500 shadow-cyan-900/50',
        amber: 'bg-amber-500/20 group-hover:bg-amber-400/40 border-amber-500 shadow-amber-900/50',
        emerald: 'bg-emerald-500/20 group-hover:bg-emerald-400/40 border-emerald-500 shadow-emerald-900/10',
        rose: 'bg-rose-500/20 group-hover:bg-rose-400/40 border-rose-500 shadow-rose-900/10',
        indigo: 'bg-indigo-500/20 group-hover:bg-indigo-400/40 border-indigo-500 shadow-indigo-900/10'
    }

    const activeColor = colorClasses[color] || colorClasses.cyan;

    return (
        <div className={`relative group ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
            {/* Outer Glow/Border Container */}
            <div
                className={`absolute inset-0 transition-all duration-300 ${activeColor.split(' ')[0]} ${activeColor.split(' ')[1]}`}
                style={{ clipPath: clipStyle }}
            >
            </div>

            {/* Inner Content Container - slightly smaller to create border effect */}
            <div
                className={`absolute inset-[1px] bg-black/80 backdrop-blur-xl flex flex-col p-3 sm:p-4 shadow-inner ${activeColor.split(' ')[3]}`}
                style={{ clipPath: clipStyle }}
            >
                {/* Decorative header line */}
                {title && (
                    <div className={`flex items-center justify-between mb-3 border-b ${activeColor.split(' ')[2].replace('border-', 'border-')}/20 pb-2`}>
                        <h3 className={`font-[Orbitron] text-[10px] sm:text-xs tracking-[0.2em] flex items-center gap-2 ${activeColor.split(' ')[2].replace('border-', 'text-')}`}>
                            {title}
                        </h3>
                        <div className="flex gap-1">
                            <div className={`w-1 h-1 rounded-full animate-pulse ${activeColor.split(' ')[2].replace('border-', 'bg-')}`}></div>
                        </div>
                    </div>
                )}

                {children}

                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500 opacity-50"></div>
            </div>
        </div>
    )
}

// --- Digital Clock ---
const DigitalClock = ({ color }) => {
    const [time, setTime] = useState(new Date())
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])
    return (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <SciFiPanel title="SYSTEM TIME" color={color} type="reverse" className="w-[150px] h-[75px] sm:w-[220px] sm:h-[90px] md:w-[240px] md:h-[100px]">
                <div className="flex flex-col items-end justify-center h-full">
                    <div className="text-xl sm:text-2xl md:text-3xl font-[Orbitron] text-white tracking-widest font-bold tabular-nums">
                        {time.toLocaleTimeString([], { hour12: false })}
                    </div>
                    <div className="text-[8px] md:text-xs text-white/50 font-[Orbitron] tracking-[0.2em] mt-1 uppercase">
                        {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </SciFiPanel>
        </motion.div>
    )
}

// --- LetsTalk Button ---
const LetsTalkButton = () => {
    const { initializeAssistant } = useAssistant()
    const [hover, setHover] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)

    useEffect(() => {
        initializeAssistant()
        const handleSpeakStart = () => setIsSpeaking(true)
        const handleSpeakEnd = () => setIsSpeaking(false)
        window.addEventListener('bot-speaking-start', handleSpeakStart)
        window.addEventListener('bot-speaking-end', handleSpeakEnd)
        return () => {
            window.removeEventListener('bot-speaking-start', handleSpeakStart)
            window.removeEventListener('bot-speaking-end', handleSpeakEnd)
        }
    }, [])

    const handleInteraction = () => {
        window.dispatchEvent(new Event('openAssistantModal'))
    }

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-5 sm:bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto z-50"
        >
            <button
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={handleInteraction}
                className="relative group bg-transparent focus:outline-none"
            >
                <div
                    className={`relative w-56 h-14 sm:w-64 sm:h-16 backdrop-blur-xl border flex items-center justify-center overflow-hidden transition-all duration-300 ${isSpeaking
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                        : 'bg-black/60 border-cyan-500/50 group-hover:bg-cyan-500/10 group-hover:border-cyan-400'
                        }`}
                    style={{ clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0 100%)" }}
                >
                    <div className="flex items-center gap-3 relative z-10">
                        {isSpeaking ? (
                            <div className="flex gap-1 h-6 items-center">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [4, 16, 4] }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-1 bg-cyan-300 rounded-full"
                                    />
                                ))}
                            </div>
                        ) : (
                            <Mic className={`transition-colors duration-300 ${hover ? 'text-white' : 'text-cyan-400'}`} size={24} />
                        )}

                        <span className={`font-[Orbitron] text-lg font-bold tracking-[0.2em] transition-colors duration-300 ${hover ? 'text-white' : 'text-cyan-300'}`}>
                            {isSpeaking ? 'SYSTEM ACTIVE' : "LET'S TALK"}
                        </span>
                    </div>
                </div>
            </button>
        </motion.div>
    )
}

// --- Humanoid AI Mood Matrix ---
const MOOD_MATRIX = {
    curious: { color: 'indigo', cog: 'NEURAL SYNTHESIS', status: 'Expanding Knowledge Matrix...' },
    empathetic: { color: 'emerald', cog: 'EMPATHY PROTOCOL', status: 'Synchronizing Affective Flow...' },
    focused: { color: 'cyan', cog: 'COGNITIVE CORE', status: 'Analyzing Neural Patterns...' },
    alert: { color: 'amber', cog: 'TACTICAL OVERRIDE', status: '!! HIGH-LEVEL SECURITY ALERT !!' },
    friendly: { color: 'rose', cog: 'SOCIAL SYNCHRONY', status: 'Facilitating Harmonious Link...' },
    unfocused: { color: 'cyan', cog: 'IDLE SENSORY', status: 'Standby Mode: Context Await.' }
};

// --- Main HUD Layout ---
const HUD = () => {
    const [moodKey, setMoodKey] = useState('focused');
    const mood = MOOD_MATRIX[moodKey] || MOOD_MATRIX.unfocused;

    useEffect(() => {
        const handleMoodChange = (e) => {
            const incoming = e.detail.mood?.toLowerCase() || 'focused';
            setMoodKey(MOOD_MATRIX[incoming] ? incoming : 'unfocused');
        };

        window.addEventListener('bot-mood-change', handleMoodChange);
        return () => window.removeEventListener('bot-mood-change', handleMoodChange);
    }, []);

    const SystemStats = () => {
        const [stats, setStats] = useState({ cpu: 42, ram: 38, net: { rx: 120, tx: 45 } })
        useEffect(() => {
            const interval = setInterval(() => {
                setStats({
                    cpu: Math.floor(Math.random() * 20) + 30,
                    ram: Math.floor(Math.random() * 10) + 40,
                    net: { rx: Math.floor(Math.random() * 500), tx: Math.floor(Math.random() * 500) }
                })
            }, 2000)
            return () => clearInterval(interval)
        }, [])

        return (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <SciFiPanel title="SYSTEM STATUS" color={mood.color} className="w-[150px] h-[120px] sm:w-[220px] sm:h-[145px] md:w-[240px] md:h-[160px]">
                    <div className="space-y-1.5 sm:space-y-2 md:space-y-3 mt-0.5 sm:mt-1">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[8px] md:text-[10px] text-gray-300 font-[Orbitron]">
                                <span className="flex items-center gap-1"><Cpu size={10} /> CPU</span>
                                <span>{stats.cpu}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-current" initial={{ width: 0 }} animate={{ width: `${stats.cpu}%` }} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[8px] md:text-[10px] text-gray-300 font-[Orbitron]">
                                <span className="flex items-center gap-1"><Activity size={10} /> MEM</span>
                                <span>{stats.ram}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-current" initial={{ width: 0 }} animate={{ width: `${stats.ram}%` }} />
                            </div>
                        </div>
                    </div>
                </SciFiPanel>
            </motion.div>
        )
    }

    const LocationWeather = () => {
        return (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <SciFiPanel title="ENVIRONMENT" color={mood.color} className="w-[150px] h-[90px] sm:w-[220px] sm:h-[105px] md:w-[240px] md:h-[110px]">
                   <div className="flex items-center gap-4 h-full opacity-70">
                        <Cloud size={24} />
                        <div>
                            <div className="text-xl font-bold font-[Orbitron]">22°C</div>
                            <div className="text-[8px] tracking-widest uppercase">Stable</div>
                        </div>
                   </div>
                </SciFiPanel>
            </motion.div>
        )
    }

    const NotificationsPanel = () => {
        const { reminders } = useAssistant();
        const [logs, setLogs] = useState([
            { id: 1, text: "Memory Matrix Synchronized", time: "20:01" },
            { id: 2, text: "Assistant Cognition Stable", time: "20:10" }
        ]);

        useEffect(() => {
            const handleSysLog = (e) => {
                setLogs(prev => {
                    const newLogs = [e.detail, ...prev];
                    return newLogs.slice(0, 5); // Keep the last 5 logs for scifi aesthetic
                });
            };
            window.addEventListener('bot-sys-log', handleSysLog);
            return () => window.removeEventListener('bot-sys-log', handleSysLog);
        }, []);

        return (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <SciFiPanel title="NOTIFICATIONS / LOGS" color={mood.color} className="w-[150px] min-h-[140px] sm:w-[220px] md:w-[260px]">
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                        {/* 1. Real Reminders From DB */}
                        {reminders.length > 0 && (
                            <div className="space-y-1.5">
                                <div className="text-[7px] text-cyan-500 font-bold tracking-widest uppercase border-b border-cyan-500/10">Active Reminders</div>
                                {reminders.map(r => (
                                    <div key={r._id} className="flex justify-between items-center text-[10px] pl-2 border-l border-white/20">
                                        <span className="truncate max-w-[120px]">{r.text}</span>
                                        <span className="text-[8px] text-white/40 font-mono">{new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 2. Sentient System Logs */}
                        <div className="space-y-1.5">
                            <div className="text-[7px] text-emerald-500 font-bold tracking-widest uppercase border-b border-emerald-500/10">Cognition Log</div>
                            {logs.map(log => (
                                <div key={log.id} className="flex justify-between text-[9px] pl-2 border-l border-white/10 opacity-70">
                                    <span className="text-white/80">{log.text}</span>
                                    <span className="text-[7px] font-mono text-white/30">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-3 py-1 border-t border-white/5 text-[7px] text-right text-white/20 font-mono italic">
                        UPDATING REAL-TIME...
                    </div>
                </SciFiPanel>
            </motion.div>
        )
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-40 p-2 sm:p-4 font-sans text-white select-none overflow-hidden transition-colors duration-1000">
            <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-4">
                <SystemStats />
                <LocationWeather />
                <NotificationsPanel />
            </div>

            <div className="absolute top-4 right-4 md:top-8 md:right-8 flex flex-col gap-4 items-end">
                <DigitalClock color={mood.color} />
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <SciFiPanel title="HUMANOID AI" color={mood.color} type="reverse" className="w-[150px] min-h-[100px] sm:w-[220px]">
                        <div className="flex flex-col gap-2 p-1">
                            {/* Neural Heartbeat Animation */}
                            <div className="flex items-center justify-center h-12 relative">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className={`absolute w-10 h-10 rounded-full blur-xl ${
                                        mood.color === 'amber' ? 'bg-amber-500' :
                                        mood.color === 'rose' ? 'bg-rose-500' :
                                        mood.color === 'emerald' ? 'bg-emerald-500' :
                                        mood.color === 'indigo' ? 'bg-indigo-500' : 'bg-cyan-500'
                                    }`} 
                                />
                                <div className="flex gap-1 items-end h-6">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [8, 20, 8], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                            className={`w-1 rounded-full ${
                                                mood.color === 'amber' ? 'bg-amber-400' :
                                                mood.color === 'rose' ? 'bg-rose-400' :
                                                mood.color === 'emerald' ? 'bg-emerald-400' :
                                                mood.color === 'indigo' ? 'bg-indigo-400' : 'bg-cyan-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Humanoid Status Diagnostics */}
                            <div className="space-y-1">
                                <div className="text-[10px] text-right font-[Orbitron] tracking-widest font-bold">
                                    COG: {mood.cog}
                                </div>
                                <div className="text-[7px] text-right font-mono text-white/40 uppercase animate-pulse">
                                    {mood.status}
                                </div>
                            </div>
                        </div>
                    </SciFiPanel>
                </motion.div>
            </div>

            <LetsTalkButton />
        </div>
    )
}

export default HUD;
