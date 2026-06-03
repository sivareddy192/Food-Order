import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import gsap from 'gsap';

const AbstractShape = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={[1.8, 2.5, 1.4]}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#FF9900" // Rich Mango Orange/Yellow
          attach="material"
          distort={0.3} // Gives it an organic, slightly uneven fruit shape
          speed={1.5}
          roughness={0.4} // Slightly smooth but not a mirror
          metalness={0.2}
        />
      </mesh>
    </Float>
  );
};

const Pickle3DScene = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.9 }, 
        { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#082215] rounded-3xl md:rounded-l-3xl md:rounded-r-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} className="w-full h-full">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#E8D8A0" />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#ffffff" />
        <AbstractShape />
        <Environment preset="city" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      {/* Overlay Text */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end items-center text-center p-12 bg-linear-to-t from-[#082215] via-[#082215]/40 to-transparent">
        <h2 className="text-3xl md:text-4xl font-black text-luxury-gold uppercase tracking-widest font-luxury-serif mb-4 drop-shadow-2xl">
          The Art of Preservation
        </h2>
        <p className="text-[#faf9f6]/90 max-w-sm text-xs md:text-sm leading-relaxed font-luxury-sans">
          Discover our curated collection of premium artisanal goods. Log in to explore exclusive reserves and member benefits.
        </p>
      </div>
    </div>
  );
};

export default Pickle3DScene;
