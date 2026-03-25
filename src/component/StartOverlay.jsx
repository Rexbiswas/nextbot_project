import { useState } from 'react'
import FaceAuth from './FaceAuth'
import { motion } from 'framer-motion'

const StartOverlay = () => {
    const [visible, setVisible] = useState(true)
    const [showFaceAuth, setShowFaceAuth] = useState(false)

    const handleStart = () => {
        setVisible(false)
        window.dispatchEvent(new CustomEvent('start-nextbot'))
    }

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-2000 flex flex-col items-center justify-center bg-[#0b111a] backdrop-blur-3xl p-6 overflow-hidden">
            {/* Background glowing rings */}
            <div className="absolute inset-0 z-[-1] pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/30 rounded-full blur-2xl" />
            </div>

            <div className="text-center space-y-12 max-w-xl">
                 <div className="space-y-4">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-bold tracking-[0.4em] font-mono uppercase bg-linear-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent"
                    >
                        NEXTBOT
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 0.5 }}
                        className="text-cyan-400 font-mono text-sm tracking-[0.2em] uppercase"
                    >
                        Sentient_Core_Initialized: V4.10_MARS
                    </motion.p>
                 </div>

                 <div className="relative flex flex-col items-center">
                    {!showFaceAuth ? (
                        <motion.button
                            whileHover={{ scale: 1.05, letterSpacing: "6px" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFaceAuth(true)}
                            className="px-12 py-5 border-2 border-cyan-500/50 bg-cyan-500/5 text-cyan-400 rounded-lg font-bold tracking-[4px] uppercase hover:bg-cyan-500/20 backdrop-blur-md transition-all shadow-[0_0_50px_rgba(0,240,255,0.2)]"
                        >
                            Logon_Sequence
                        </motion.button>
                    ) : (
                        <div className="space-y-6">
                            <FaceAuth onAuthenticated={handleStart} mode="login" />
                            <p 
                                onClick={handleStart} 
                                className="text-[10px] text-cyan-500/40 cursor-pointer hover:text-cyan-400 uppercase tracking-widest transition-colors"
                            >
                                [ Skip_Biometric_Validation ]
                            </p>
                        </div>
                    )}
                 </div>
            </div>

            <div className="absolute bottom-10 text-[9px] font-mono text-cyan-500/30 uppercase tracking-[1em]">
                 Establishing_Secure_Neural_Link...
            </div>
        </div>
    )
}

export default StartOverlay
