import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial, Trail, Points, PointMaterial, Torus, Ring } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

const SynapticConnections = ({ count = 40 }) => {
  const groupRef = useRef();
  const lines = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      start: new THREE.Vector3().setFromSphericalCoords(1.2, Math.random() * Math.PI, Math.random() * Math.PI * 2),
      end: new THREE.Vector3().setFromSphericalCoords(2.5, Math.random() * Math.PI, Math.random() * Math.PI * 2),
      speed: 0.2 + Math.random() * 0.5
    }));
  }, [count]);

  useFrame((state) => {
    groupRef.current.rotation.y += 0.005;
    groupRef.current.rotation.x += 0.002;
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <Trail
          key={i}
          width={0.5}
          length={4}
          color="#00f0ff"
          attenuation={(t) => t * t}
        >
          <mesh position={line.start}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0} />
            <Sparkle speed={line.speed} start={line.start} end={line.end} />
          </mesh>
        </Trail>
      ))}
    </group>
  );
};

const Sparkle = ({ speed, start, end }) => {
  const ref = useRef();
  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * speed) % 1;
    ref.current.position.lerpVectors(start, end, t);
    ref.current.scale.setScalar(Math.sin(t * Math.PI) * 2);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial color="#00ffae" transparent opacity={0.8} />
    </mesh>
  );
};

const ParticleField = ({ count = 800 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        p[i * 3] = (Math.random() - 0.5) * 12;
        p[i * 3 + 1] = (Math.random() - 0.5) * 12;
        p[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return p;
  }, [count]);

  const pointsRef = useRef();
  
  useFrame((state) => {
    pointsRef.current.rotation.y += 0.0008;
    pointsRef.current.rotation.z += 0.0004;
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f0ff"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.4}
      />
    </Points>
  );
};

const NeuralBrainCore = () => {
    const coreRef = useRef();
    const outerRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        coreRef.current.rotation.y = time * 0.2;
        outerRef.current.rotation.y = -time * 0.1;
        outerRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    });

    return (
        <group>
            {/* Primary Neural Node */}
            <Float speed={4} rotationIntensity={1} floatIntensity={1.5}>
               <mesh ref={coreRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
                  <icosahedronGeometry args={[1.1, 15]} />
                  <MeshDistortMaterial
                    color={hovered ? "#00ffae" : "#00f0ff"}
                    distort={0.45}
                    speed={3}
                    roughness={0}
                    metalness={0.8}
                    emissive={hovered ? "#00ffae" : "#00f0ff"}
                    emissiveIntensity={2}
                    transparent
                    opacity={0.7}
                  />
               </mesh>
               
               {/* Wireframe Shell */}
               <mesh ref={outerRef}>
                  <icosahedronGeometry args={[1.3, 2]} />
                  <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.15} />
               </mesh>
            </Float>

            {/* Inner Core Glow */}
            <Sphere args={[0.5, 32, 32]}>
                 <meshBasicMaterial color="#ffffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
            </Sphere>
            
            {/* Pulsing Aura */}
            <Sphere args={[1.8, 32, 32]}>
                <MeshWobbleMaterial color="#00f0ff" factor={0.2} speed={1} transparent opacity={0.05} />
            </Sphere>
        </group>
    );
};

const DataRings = () => {
    const groupRef = useRef();
    
    useFrame((state) => {
        groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
    });

    return (
        <group ref={groupRef}>
            {/* Vertical Ring */}
            <Ring args={[2.8, 2.82, 100]} rotation={[0, Math.PI / 2, 0]}>
                <meshBasicMaterial color="#00ffae" transparent opacity={0.3} side={THREE.DoubleSide} />
            </Ring>
            
            {/* Horizontal Segmented Rings */}
            {[0, 1, 2].map(i => (
                <group key={i} rotation={[Math.PI / 2, 0, i * Math.PI / 3]}>
                    <Torus args={[3.2, 0.01, 16, 100, Math.PI / 2]}>
                        <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} />
                    </Torus>
                    <Torus args={[3.5, 0.005, 16, 100, Math.PI]} rotation={[0, 0, Math.PI / 2]}>
                        <meshBasicMaterial color="#00f0ff" transparent opacity={0.1} />
                    </Torus>
                </group>
            ))}
        </group>
    );
};

const NeuralCore = () => {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* 3D Scene */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 0, 8], fov: 40 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00f0ff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffae" />
          
          <NeuralBrainCore />
          <DataRings />
          <SynapticConnections count={30} />
          <ParticleField count={1200} />
          
        </Canvas>
      </div>

      {/* 2D HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-[550px] h-[550px]">
              {/* Spinning Hexagon Grid Mask Effect */}
              <motion.div 
                className="absolute inset-0 border border-cyan-500/10 rounded-full"
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Outer Circular HUD with notches */}
              <motion.div 
                 className="absolute inset-[15%] border-2 border-dashed border-cyan-500/20 rounded-full"
                 animate={{ rotate: -360 }}
                 transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />

              {/* Data readouts */}
              <div className="absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60">
                  <span className="text-[9px] font-mono text-cyan-400 tracking-[3px]">COGNITIVE_LOAD: 24.8%</span>
                  <div className="w-32 h-1 bg-cyan-900/40 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]"
                        animate={{ width: ["20%", "45%", "20%"] }}
                        transition={{ duration: 4, repeat: Infinity }}
                       />
                  </div>
              </div>

              {/* Directional Brackets */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                  <div className="w-1 h-32 border-l border-y border-cyan-500/30 rounded-lg blur-[1px]" />
                  <div className="w-1 h-32 border-r border-y border-cyan-500/30 rounded-lg blur-[1px]" />
              </div>
          </div>
      </div>

       {/* Status Footer */}
       <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
             <div className="flex items-center gap-4 mb-2">
                <div className="h-px w-24 bg-linear-to-r from-transparent to-cyan-500/40" />
                <span className="text-[10px] tracking-[6px] text-cyan-400/80 uppercase font-bold">Neural Matrix Hub</span>
                <div className="h-px w-24 bg-linear-to-l from-transparent to-cyan-500/40" />
             </div>
             <h2 className="text-3xl font-black text-white glow-text tracking-[8px] uppercase">SYNAPSE ACTIVE</h2>
             <div className="flex gap-2 mt-4">
                {[...Array(8)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [4, 16, 4], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1 bg-[#00ffae] rounded-full shadow-[0_0_10px_#00ffae]"
                  />
                ))}
             </div>
          </motion.div>
       </div>
    </div>
  );
};

export default NeuralCore;
