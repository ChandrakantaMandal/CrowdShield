import React from 'react';
import * as THREE from 'three';
import { ZONES, EMERGENCY_EXIT, MAIN_ENTRY, PUBLIC_EXIT } from '../../data/venueConfig';
import { Html } from '@react-three/drei';

export function Venue3D({ activeZone, zoneRiskData = {} }) {
  return (
    <group>
      {/* 1. Ground Plane Grid */}
      <gridHelper args={[100, 50, '#3b82f6', '#1e293b']} position={[0, -0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[120, 100]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* 2. Render Venue Zones */}
      {Object.values(ZONES).map(zone => {
        const [cx, , cz] = zone.center;
        const [w, d] = zone.size;
        const isSelected = activeZone === zone.id;
        const riskData = zoneRiskData[zone.id] || {};
        const riskColor = riskData.color || zone.color;

        return (
          <group key={zone.id} position={[cx, 0, cz]}>
            {/* Zone Floor Perimeter Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[w, d]} />
              <meshBasicMaterial
                color={riskColor}
                transparent
                opacity={isSelected ? 0.28 : 0.12}
                depthWrite={false}
              />
            </mesh>

            {/* Zone Border Outline Wireframe */}
            <lineSegments position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(w, d)]} />
              <lineBasicMaterial color={isSelected ? '#22d3ee' : riskColor} linewidth={2} />
            </lineSegments>

            {/* 4 Corner Light Pillars */}
            {[
              [-w / 2, -d / 2],
              [w / 2, -d / 2],
              [-w / 2, d / 2],
              [w / 2, d / 2]
            ].map(([px, pz], idx) => (
              <mesh key={idx} position={[px, 1.5, pz]}>
                <boxGeometry args={[0.3, 3, 0.3]} />
                <meshStandardMaterial color={riskColor} emissive={riskColor} emissiveIntensity={0.6} />
              </mesh>
            ))}

            {/* Zone specific 3D props */}
            {zone.id === 'ZONE_C' && (
              /* Main Stage Structure */
              <group position={[0, 1.2, -d / 2 + 2]}>
                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[16, 1, 4]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
                <mesh position={[0, 3, -1.5]}>
                  <boxGeometry args={[18, 4, 0.5]} />
                  <meshStandardMaterial color="#0f172a" emissive="#f59e0b" emissiveIntensity={0.4} />
                </mesh>
              </group>
            )}

            {zone.id === 'ZONE_E' && (
              /* Registration Booth Arches */
              <group position={[0, 1.5, 0]}>
                <mesh position={[-6, 0, 0]}>
                  <boxGeometry args={[4, 2, 1]} />
                  <meshStandardMaterial color="#0e7490" />
                </mesh>
                <mesh position={[6, 0, 0]}>
                  <boxGeometry args={[4, 2, 1]} />
                  <meshStandardMaterial color="#0e7490" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* 3. MAIN ENTRANCE GATE (South Ingress) */}
      <group position={MAIN_ENTRY.location}>
        {/* Overhead Entrance Canopy Arch */}
        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[12, 0.8, 1.4]} />
          <meshStandardMaterial color="#0891b2" emissive="#06b6d4" emissiveIntensity={0.8} />
        </mesh>
        {/* Left Portal Pillar */}
        <mesh position={[-5.6, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1.2]} />
          <meshStandardMaterial color="#0e7490" emissive="#0891b2" emissiveIntensity={0.4} />
        </mesh>
        {/* Right Portal Pillar */}
        <mesh position={[5.6, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1.2]} />
          <meshStandardMaterial color="#0e7490" emissive="#0891b2" emissiveIntensity={0.4} />
        </mesh>
        {/* Security Turnstile Barriers */}
        {[-3.5, -1.2, 1.2, 3.5].map((tx, idx) => (
          <mesh key={idx} position={[tx, 0.6, 0]}>
            <boxGeometry args={[0.25, 1.2, 1.6]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.7} />
          </mesh>
        ))}

        {/* 3D Floating Main Entrance Sign */}
        <Html position={[0, 5.0, 0]} center zIndexRange={[50, 0]}>
          <div className="px-3.5 py-1.5 bg-cyan-950/90 text-cyan-200 font-mono font-black text-xs rounded-lg shadow-2xl border-2 border-cyan-400 flex items-center gap-2 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>🎟️ MAIN ENTRANCE GATE </span>
          </div>
        </Html>
      </group>

      {/* 4. EMERGENCY EXIT GATE (West Evacuation Route beside Zone A) */}
      <group position={EMERGENCY_EXIT.location} rotation={[0, Math.PI / 2, 0]}>
        {/* Overhead Glowing Red Exit Arch */}
        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[8.5, 0.8, 1.2]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
        </mesh>
        {/* Left Emergency Pillar */}
        <mesh position={[-4.0, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1]} />
          <meshStandardMaterial color="#991b1b" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        {/* Right Emergency Pillar */}
        <mesh position={[4.0, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1]} />
          <meshStandardMaterial color="#991b1b" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>

        {/* 3D Floating Emergency Exit Label */}
        <Html position={[0, 5.0, 0]} center zIndexRange={[50, 0]}>
          <div className="px-3.5 py-1.5 bg-red-950/95 text-white font-mono font-black text-xs rounded-lg shadow-2xl border-2 border-red-500 whitespace-nowrap animate-pulse flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>🚨 EMERGENCY EVACUATION GATE </span>
          </div>
        </Html>
      </group>

      {/* 5. PUBLIC EXIT GATE (East Egress beside Zone B) */}
      <group position={PUBLIC_EXIT.location} rotation={[0, Math.PI / 2, 0]}>
        {/* Overhead Public Exit Arch */}
        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[10, 0.8, 1.2]} />
          <meshStandardMaterial color="#059669" emissive="#10b981" emissiveIntensity={0.8} />
        </mesh>
        {/* Left Pillar */}
        <mesh position={[-4.6, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1]} />
          <meshStandardMaterial color="#065f46" emissive="#10b981" emissiveIntensity={0.4} />
        </mesh>
        {/* Right Pillar */}
        <mesh position={[4.6, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1]} />
          <meshStandardMaterial color="#065f46" emissive="#10b981" emissiveIntensity={0.4} />
        </mesh>

        {/* 3D Floating Public Exit Label */}
        <Html position={[0, 5.0, 0]} center zIndexRange={[50, 0]}>
          <div className="px-3.5 py-1.5 bg-emerald-950/90 text-emerald-200 font-mono font-black text-xs rounded-lg shadow-2xl border-2 border-emerald-400 flex items-center gap-2 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>🚪 PUBLIC EXIT GATE </span>
          </div>
        </Html>
      </group>

    </group>
  );
}
