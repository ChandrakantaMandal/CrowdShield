import React, { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export function CrowdAgents({ agents = [], scenario = 'normal' }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current || !agents.length) return;

    // Explicitly update active instance count to prevent ghost agents when switching scenarios
    meshRef.current.count = agents.length;

    agents.forEach((agent, i) => {
      const [x, y, z] = agent.pos;
      tempObject.position.set(x, y + 0.75, z);
      
      // Orient capsule slightly towards target direction
      if (agent.target) {
        const dx = agent.target[0] - x;
        const dz = agent.target[2] - z;
        tempObject.rotation.y = Math.atan2(dx, dz);
      }
      
      // Slightly scale up panic agents in stampede
      if (scenario === 'stampede') {
        tempObject.scale.set(1.1, 1.1, 1.1);
      } else {
        tempObject.scale.set(1, 1, 1);
      }

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Color mapping
      if (scenario === 'stampede') {
        tempColor.set('#ef4444'); // Red alert evacuation
      } else if (scenario === 'surge') {
        tempColor.set(i % 2 === 0 ? '#f97316' : '#ef4444');
      } else if (scenario === 'bottleneck') {
        tempColor.set(i % 3 === 0 ? '#f59e0b' : '#3b82f6');
      } else {
        // Normal mode color variety
        const hue = (0.55 + (agent.colorOffset || 0) * 0.25) % 1.0;
        tempColor.setHSL(hue, 0.85, 0.55);
      }

      meshRef.current.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });


  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, Math.max(agents.length, 1000)]}
      castShadow
      receiveShadow
    >
      <capsuleGeometry args={[0.3, 0.9, 8, 16]} />
      <meshStandardMaterial roughness={0.4} metalness={0.2} />
    </instancedMesh>
  );
}
