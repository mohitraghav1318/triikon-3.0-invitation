import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Animated sphere component with distortion effect
 * Creates a floating, morphing sphere for visual interest
 */
function AnimatedSphere() {
  const meshRef = useRef();

  // Animate the sphere rotation on each frame
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.5}>
      <MeshDistortMaterial
        color="#00c9ff"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

/**
 * Three.js background component
 * Provides an animated 3D background for the pages
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 */
export default function ThreeBackground({ className = '' }) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient light for overall illumination */}
        <ambientLight intensity={0.5} />

        {/* Point light for highlights */}
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#00c9ff"
        />

        {/* Animated sphere */}
        <AnimatedSphere />

        {/* Optional: Enable orbit controls for interaction */}
        {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
      </Canvas>
    </div>
  );
}
