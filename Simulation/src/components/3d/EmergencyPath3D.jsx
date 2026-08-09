import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ZONES, EMERGENCY_EXIT } from '../../data/venueConfig';

export function EmergencyPath3D({ activeScenario = 'normal', isCritical = false }) {
  const lineRef = useRef();

  // Create curved evacuation path points from Main Stage -> Exhibition -> Emergency Exit
  const points = [
    new THREE.Vector3(ZONES.ZONE_C.center[0], 0.1, ZONES.ZONE_C.center[2]),
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(ZONES.ZONE_A.center[0], 0.1, ZONES.ZONE_A.center[2]),
    new THREE.Vector3(EMERGENCY_EXIT.location[0] + 4, 0.1, EMERGENCY_EXIT.location[2]),
    new THREE.Vector3(EMERGENCY_EXIT.location[0], 0.1, EMERGENCY_EXIT.location[2])
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const curvePoints = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      const t = clock.getElapsedTime();
      if (activeScenario === 'stampede' || isCritical) {
        lineRef.current.material.opacity = 0.5 + Math.sin(t * 8) * 0.4;
      } else {
        lineRef.current.material.opacity = 0.25;
      }
    }
  });

  const isEvacuationActive = activeScenario === 'stampede' || isCritical;
  const pathColor = isEvacuationActive ? '#ef4444' : '#06b6d4';

  return (
    <group>
      {/* Evacuation Guideline */}
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color={pathColor} linewidth={4} transparent opacity={0.5} />
      </line>

      {/* Animated Arrow Indicators along evacuation route */}
      {isEvacuationActive &&
        curvePoints.filter((_, idx) => idx % 6 === 0).map((pt, i) => (
          <mesh key={i} position={[pt.x, 0.15, pt.z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <coneGeometry args={[0.6, 1.2, 4]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
          </mesh>
        ))}
    </group>
  );
}
