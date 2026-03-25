import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bot, Send, Volume2, Globe, Mic } from "lucide-react";
import { useAssistant } from "../../hooks/useAssistant";

const ChatBubble = ({ message, who }) => {
  const isBot = who === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: isBot ? -10 : 10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      className={`flex items-start gap-3 mb-4 ${isBot ? "" : "flex-row-reverse"}`}
    >
      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${isBot ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-400" : "border-pink-500/30 bg-pink-500/5 text-pink-400"}`}>
          {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className={`hud-panel p-3 rounded-xl max-w-[80%] text-[13px] leading-relaxed shadow-none ${isBot ? "bg-cyan-500/5" : "bg-white/5"}`}>
          <p className={isBot ? "text-cyan-50" : "text-slate-100"}>{message}</p>
          <span className="text-[9px] text-cyan-400/40 uppercase block mt-1 font-mono">{isBot ? "NextBot AI" : "Authorized User"}</span>
      </div>
    </motion.div>
  );
};

const Waveform = () => (
    <div className="flex items-center gap-0.5 h-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <motion.div
                key={i}
                animate={{ height: [4, 16, 4] }}
                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                className="w-px bg-cyan-400 rounded-full"
            />
        ))}
    </div>
)

const ConversationLog = () => {
    const { messages, inputValue, setInputValue, handleSubmit, isListening } = useAssistant();
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hud-panel h-full flex flex-col"
        >
            <h3 className="hud-title flex items-center justify-between">
                <span className="flex items-center gap-2"><Globe size={16} /> COGNITION LOG</span>
                <span className="text-[10px] text-cyan-500/40">ID: CN-9912X</span>
            </h3>

            <div className="conversation-log-container flex-1 overflow-y-auto px-1 pr-3 scroll-smooth">
                <AnimatePresence>
                    {messages.map((m, i) => (
                        <ChatBubble key={i} message={m.text} who={m.who} />
                    ))}
                </AnimatePresence>
                <div ref={endRef} />
            </div>

            <div className="mt-4 pt-4 border-t border-cyan-500/10">
                <div className="flex flex-col gap-3">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                      className="flex items-center gap-3 bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-xl focus-within:border-cyan-500/40 transition-all"
                    >
                        <div className="flex-1 text-[13px] text-cyan-100/60 font-mono tracking-tight cursor-text flex items-center gap-3">
                             {isListening && <Waveform />}
                             <input 
                               type="text"
                               value={inputValue}
                               onChange={(e) => setInputValue(e.target.value)}
                               placeholder={isListening ? "LISTENING..." : "AWAITING_INPUT..."}
                               className="bg-transparent border-none outline-none w-full text-cyan-100 placeholder:text-cyan-500/30"
                             />
                        </div>
                        <button type="submit" className="text-cyan-400 hover:text-white transition-colors">
                            <Send size={18} />
                        </button>
                    </form>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/60 uppercase">
                             <div className="w-2 h-2 rounded-full bg-[#00ffae] animate-pulse" />
                             VOICE_BIOMETRIC_ACTIVE
                        </div>
                        <div className="flex gap-4">
                            <Volume2 size={14} className="text-cyan-400/40 hover:text-cyan-400 cursor-pointer" />
                            <Mic size={14} className="text-cyan-400/40 hover:text-cyan-400 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ConversationLog;
