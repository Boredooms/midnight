import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

// Extend JSX for R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
      lineSegments: any;
      lineBasicMaterial: any;
    }
  }
}

const PARTICLE_COUNT = 600;

const Particles: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  const sizes = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i] = Math.random() * 2 + 0.5;
    }
    return arr;
  }, []);

  useFrame((state: RootState) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

const ConnectionLines: React.FC = () => {
  const lineRef = useRef<THREE.LineSegments>(null);

  const positions = useMemo(() => {
    const lines: number[] = [];
    const points: [number, number, number][] = [];

    for (let i = 0; i < 80; i++) {
      points.push([
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
      ]);
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i][0] - points[j][0];
        const dy = points[i][1] - points[j][1];
        const dz = points[i][2] - points[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 3) {
          lines.push(...points[i], ...points[j]);
        }
      }
    }

    return new Float32Array(lines);
  }, []);

  useFrame((state: RootState) => {
    if (!lineRef.current) return;
    lineRef.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.06} />
    </lineSegments>
  );
};

export const ParticleField: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Particles />
        <ConnectionLines />
      </Canvas>
    </div>
  );
};
