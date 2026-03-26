import { useState } from 'react'
import FaceAuth from './FaceAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Fingerprint, ScanEye, Key, ArrowLeft, Loader2, ShieldCheck, User } from 'lucide-react'

const StartOverlay = () => {
    const [visible, setVisible] = useState(true)
    const [view, setView] = useState('welcome') // welcome, select, manual, biometric, face
    const [manualData, setManualData] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { login } = useAuth()

    const handleStart = () => {
        setVisible(false)
        window.dispatchEvent(new CustomEvent('start-nextbot'))
    }

    const handleManualLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const res = await login(manualData.username, manualData.password)
        setLoading(false)
        if (res.success) {
            handleStart()
        } else {
            setError(res.message)
        }
    }

    const handleBiometricSim = () => {
        setLoading(true)
        // Simulate biometric scan
        setTimeout(() => {
            setLoading(false)
            handleStart()
        }, 2000)
    }

    if (!visible) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8 } },
        exit: { opacity: 0, scale: 1.1, filter: 'blur(20px)', transition: { duration: 0.5 } }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-2000 flex flex-col items-center justify-center bg-[#05080c] p-6 overflow-hidden"
        >
            {/* Background elements */}
            <div className="absolute inset-0 z-[-1] overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#05080c]/50 to-[#05080c]" />
            </div>

            <div className="w-full max-w-md space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4"
                    >
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, letterSpacing: "2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.4em" }}
                        className="text-5xl font-bold font-mono uppercase bg-linear-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    >
                        NEXTBOT
                    </motion.h1>
                    <p className="text-cyan-400/40 font-mono text-[10px] tracking-[0.3em] uppercase">
                        Protocol_Secure_Access_V4.10
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'welcome' && (
                        <motion.div 
                            key="welcome"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center space-y-8"
                        >
                            <button
                                onClick={() => setView('select')}
                                className="group relative px-16 py-5 border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 rounded-lg font-bold tracking-[6px] uppercase hover:bg-cyan-500/10 transition-all duration-500 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)] hover:shadow-[0_0_60px_rgba(6,182,212,0.2)]"
                            >
                                <span className="relative z-10 transition-all group-hover:tracking-[8px]">Initialize_Link</span>
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                            <div className="flex items-center gap-4 text-cyan-500/20 w-full">
                                <div className="h-px flex-1 bg-current" />
                                <span className="text-[10px] whitespace-nowrap uppercase tracking-widest">Awaiting Identity Verification</span>
                                <div className="h-px flex-1 bg-current" />
                            </div>
                        </motion.div>
                    )}

                    {view === 'select' && (
                        <>
                        <motion.div 
                            key="select"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            {[
                                { id: 'manual', icon: Key, label: 'Manual' },
                                { id: 'biometric', icon: Fingerprint, label: 'Bio' },
                                { id: 'face', icon: ScanEye, label: 'Face' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setView(item.id)}
                                    className="aspect-square flex flex-col items-center justify-center p-4 border border-cyan-500/20 bg-cyan-500/5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all group"
                                >
                                    <item.icon className="w-8 h-8 text-cyan-400/60 group-hover:text-cyan-400 mb-3 transition-colors" />
                                    <span className="text-[10px] font-mono text-cyan-400/40 group-hover:text-cyan-400 uppercase tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </motion.div>
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={handleStart}
                            className="mt-6 w-full text-center text-cyan-500/20 hover:text-cyan-400 transition-colors text-[9px] uppercase tracking-[0.2em] font-mono"
                        >
                            [ Skip_Authentication_Sequence ]
                        </motion.button>
                        </>
                    )}

                    {view === 'manual' && (
                        <motion.div 
                            key="manual"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <form onSubmit={handleManualLogin} className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Identification_ID"
                                        className="w-full bg-cyan-500/5 border border-cyan-500/20 rounded-lg py-4 pl-12 pr-4 text-cyan-100 placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                                        value={manualData.username}
                                        onChange={e => setManualData({...manualData, username: e.target.value})}
                                    />
                                </div>
                                <div className="relative group">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
                                    <input 
                                        type="password" 
                                        placeholder="Security_Key"
                                        className="w-full bg-cyan-500/5 border border-cyan-500/20 rounded-lg py-4 pl-12 pr-4 text-cyan-100 placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                                        value={manualData.password}
                                        onChange={e => setManualData({...manualData, password: e.target.value})}
                                    />
                                </div>
                                {error && <p className="text-red-400/80 text-[10px] font-mono uppercase text-center mt-2">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg font-bold tracking-widest hover:bg-cyan-500/20 transition-all flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'AUTHENTICATE'}
                                </button>
                            </form>
                            <button onClick={() => setView('select')} className="w-full text-center text-cyan-500/30 hover:text-cyan-500/50 text-[10px] uppercase font-mono transition-colors">Abort & Return</button>
                        </motion.div>
                    )}

                    {view === 'biometric' && (
                        <motion.div 
                            key="biometric"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center space-y-8"
                        >
                            <div className="relative group cursor-pointer" onClick={handleBiometricSim}>
                                <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-700" />
                                <div className="relative w-32 h-32 border-2 border-cyan-500/30 rounded-full flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm group-hover:border-cyan-500/60 transition-colors">
                                    {loading ? (
                                        <div className="relative flex items-center justify-center h-full w-full">
                                            <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin" />
                                            <Fingerprint className="w-12 h-12 text-cyan-400" />
                                        </div>
                                    ) : (
                                        <Fingerprint className="w-16 h-16 text-cyan-400/60 group-hover:text-cyan-400 transition-colors" />
                                    )}
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-cyan-400 font-mono text-xs uppercase tracking-[0.2em]">{loading ? 'Scanning_Bio_Matrix...' : 'Awaiting_Scan'}</p>
                                <p className="text-cyan-500/30 text-[9px] font-mono uppercase tracking-[0.15em]">Touch Sensor to Begin Verification</p>
                            </div>
                            <button onClick={() => setView('select')} className="text-cyan-500/30 hover:text-cyan-500/50 text-[10px] uppercase font-mono transition-colors">Switch Method</button>
                        </motion.div>
                    )}

                    {view === 'face' && (
                        <motion.div 
                            key="face"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <FaceAuth onAuthenticated={handleStart} mode="login" />
                            <button onClick={() => setView('select')} className="w-full text-center text-cyan-500/30 hover:text-cyan-500/50 text-[10px] uppercase font-mono transition-colors">Switch Method</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full"
                        />
                    ))}
                </div>
                <p className="text-[8px] font-mono text-cyan-500/20 uppercase tracking-[1em] ml-[1em]">
                    Establishing_Secure_Neural_Link
                </p>
            </div>
        </motion.div>
    )
}

export default StartOverlay
