import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const HumanoidPresence = () => {
  const containerRef = useRef(null);
  const silhouetteRef = useRef(null);

  useEffect(() => {
    // GSAP floating animation for particles around the core
    if (containerRef.current) {
        gsap.to(silhouetteRef.current, {
            y: "-10px",
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
        
        // Background particles
        const particles = containerRef.current.querySelectorAll('.particle');
        particles.forEach((p, i) => {
            gsap.to(p, {
                x: `+=${Math.random() * 20 - 10}`,
                y: `+=${Math.random() * 20 - 10}`,
                duration: 2 + Math.random() * 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.1
            });
        });
    }
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
      {/* Subtle Humanoid Silhouette */}
      <div ref={silhouetteRef} className="relative w-[300px] h-[400px]">
        {/* Head */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border border-cyan-500/30 blur-[2px] shadow-[0_0_30px_rgba(0,240,255,0.2)]" />
        {/* Torso/Shoulders */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-48 h-64 rounded-[40%] border-t-2 border-x border-cyan-500/20 blur-[3px]" />
        
        {/* Circular synapse points */}
        <motion.div 
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 blur-[2px]" 
        />
        <motion.div 
            animate={{ opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-[45%] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#00ffae] blur-xs" 
        />
        
        {/* Floating particles around it */}
        {Array.from({ length: 15 }).map((_, i) => (
            <div 
                key={i} 
                className="particle absolute w-1 h-1 rounded-full bg-cyan-400 opacity-40 blur-[1px]"
                style={{ 
                    top: `${Math.random() * 100}%`, 
                    left: `${Math.random() * 100}%` 
                }}
            />
        ))}

        {/* Vertical Data Stream effects */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent skew-x-12 blur-2xl" />
      </div>
    </div>
  );
};

export default HumanoidPresence;
