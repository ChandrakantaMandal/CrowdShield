import * as THREE from "three";
import {
  ZONES,
  EMERGENCY_EXIT,
  MAIN_ENTRY,
  PUBLIC_EXIT,
} from "./data/venueConfig";
import { Html } from "@react-three/drei";

export function Venue3D({ activeZone, zoneRiskData = {} }) {
  return (
    <group>
      {/* ================================================================
          1. GROUND PLANE GRID
      ================================================================ */}

      <gridHelper
        args={[100, 50, "#3b82f6", "#1e293b"]}
        position={[0, -0.01, 0]}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[120, 100]} />

        <meshStandardMaterial color="#0f172a" transparent opacity={0.45} />
      </mesh>

      {/* ================================================================
          2. RENDER VENUE ZONES
      ================================================================ */}

      {Object.values(ZONES).map((zone) => {
        const [cx, , cz] = zone.center;
        const [w, d] = zone.size;

        const isSelected = activeZone === zone.id;

        const riskData = zoneRiskData[zone.id] || {};

        const riskColor = riskData.color || zone.color;

        return (
          <group key={zone.id} position={[cx, 0, cz]}>
            {/* ------------------------------------------------------------
                Zone Floor
            ------------------------------------------------------------ */}

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={[w, d]} />

              <meshBasicMaterial
                color={riskColor}
                transparent
                opacity={isSelected ? 0.28 : 0.12}
                depthWrite={false}
              />
            </mesh>

            {/* ------------------------------------------------------------
                Zone Border
            ------------------------------------------------------------ */}

            <lineSegments
              position={[0, 0.03, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <edgesGeometry args={[new THREE.PlaneGeometry(w, d)]} />

              <lineBasicMaterial
                color={isSelected ? "#22d3ee" : riskColor}
                linewidth={2}
              />
            </lineSegments>

            {/* ------------------------------------------------------------
                Corner Light Pillars
            ------------------------------------------------------------ */}

            {[
              [-w / 2, -d / 2],
              [w / 2, -d / 2],
              [-w / 2, d / 2],
              [w / 2, d / 2],
            ].map(([px, pz], index) => (
              <mesh key={index} position={[px, 1.5, pz]}>
                <boxGeometry args={[0.3, 3, 0.3]} />

                <meshStandardMaterial
                  color={riskColor}
                  emissive={riskColor}
                  emissiveIntensity={0.6}
                />
              </mesh>
            ))}

            {/* ============================================================
                ZONE C — MAIN STAGE
            ============================================================ */}

            {zone.id === "ZONE_C" && (
              <group position={[0, 1.2, -d / 2 + 2]}>
                {/* Stage */}

                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[16, 1, 4]} />

                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>

                {/* Stage Back Wall */}

                <mesh position={[0, 3, -1.5]}>
                  <boxGeometry args={[18, 4, 0.5]} />

                  <meshStandardMaterial
                    color="#0f172a"
                    emissive="#f59e0b"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              </group>
            )}

            {/* ============================================================
                ZONE E — REGISTRATION BOOTHS
            ============================================================ */}

            {zone.id === "ZONE_E" && (
              <group position={[0, 1.5, 0]}>
                {/* Left Booth */}

                <mesh position={[-6, 0, 0]}>
                  <boxGeometry args={[4, 2, 1]} />

                  <meshStandardMaterial color="#0e7490" />
                </mesh>

                {/* Right Booth */}

                <mesh position={[6, 0, 0]}>
                  <boxGeometry args={[4, 2, 1]} />

                  <meshStandardMaterial color="#0e7490" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* ================================================================
          3. MAIN ENTRANCE GATE
      ================================================================ */}

      <group position={MAIN_ENTRY.location}>
        {/* Entrance Canopy */}

        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[12, 0.8, 1.4]} />

          <meshStandardMaterial
            color="#0891b2"
            emissive="#06b6d4"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Left Pillar */}

        <mesh position={[-5.6, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1.2]} />

          <meshStandardMaterial
            color="#0e7490"
            emissive="#0891b2"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Right Pillar */}

        <mesh position={[5.6, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1.2]} />

          <meshStandardMaterial
            color="#0e7490"
            emissive="#0891b2"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Turnstiles */}

        {[-3.5, -1.2, 1.2, 3.5].map((tx, index) => (
          <mesh key={index} position={[tx, 0.6, 0]}>
            <boxGeometry args={[0.25, 1.2, 1.6]} />

            <meshStandardMaterial color="#38bdf8" metalness={0.7} />
          </mesh>
        ))}

        {/* Main Entrance Label */}

        <Html position={[0, 5, 0]} center zIndexRange={[50, 0]}>
          <div
            className="
              flex
              items-center
              gap-2
              whitespace-nowrap
              rounded-lg
              border-2
              border-cyan-400
              bg-cyan-950/90
              px-3.5
              py-1.5
              font-mono
              text-xs
              font-black
              text-cyan-200
              shadow-2xl
            "
          >
            <span
              className="
                h-2.5
                w-2.5
                animate-ping
                rounded-full
                bg-cyan-400
              "
            />

            <span>🎟️ MAIN ENTRANCE GATE</span>
          </div>
        </Html>
      </group>

      {/* ================================================================
          4. EMERGENCY EXIT
      ================================================================ */}

      <group position={EMERGENCY_EXIT.location} rotation={[0, Math.PI / 2, 0]}>
        {/* Emergency Arch */}

        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[8.5, 0.8, 1.2]} />

          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={1}
          />
        </mesh>

        {/* Left Pillar */}

        <mesh position={[-4, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1]} />

          <meshStandardMaterial
            color="#991b1b"
            emissive="#ef4444"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Right Pillar */}

        <mesh position={[4, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1]} />

          <meshStandardMaterial
            color="#991b1b"
            emissive="#ef4444"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Emergency Label */}

        <Html position={[0, 5, 0]} center zIndexRange={[50, 0]}>
          <div
            className="
              flex
              items-center
              gap-2
              whitespace-nowrap
              rounded-lg
              border-2
              border-red-500
              bg-red-950/95
              px-3.5
              py-1.5
              font-mono
              text-xs
              font-black
              text-white
              shadow-2xl
            "
          >
            <span
              className="
                h-2.5
                w-2.5
                animate-ping
                rounded-full
                bg-red-500
              "
            />

            <span>🚨 EMERGENCY EVACUATION GATE</span>
          </div>
        </Html>
      </group>

      {/* ================================================================
          5. PUBLIC EXIT
      ================================================================ */}

      <group position={PUBLIC_EXIT.location} rotation={[0, Math.PI / 2, 0]}>
        {/* Public Exit Arch */}

        <mesh position={[0, 3.8, 0]}>
          <boxGeometry args={[10, 0.8, 1.2]} />

          <meshStandardMaterial
            color="#059669"
            emissive="#10b981"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Left Pillar */}

        <mesh position={[-4.6, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1]} />

          <meshStandardMaterial
            color="#065f46"
            emissive="#10b981"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Right Pillar */}

        <mesh position={[4.6, 1.9, 0]}>
          <boxGeometry args={[0.8, 3.8, 1]} />

          <meshStandardMaterial
            color="#065f46"
            emissive="#10b981"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Public Exit Label */}

        <Html position={[0, 5, 0]} center zIndexRange={[50, 0]}>
          <div
            className="
              flex
              items-center
              gap-2
              whitespace-nowrap
              rounded-lg
              border-2
              border-emerald-400
              bg-emerald-950/90
              px-3.5
              py-1.5
              font-mono
              text-xs
              font-black
              text-emerald-200
              shadow-2xl
            "
          >
            <span
              className="
                h-2.5
                w-2.5
                rounded-full
                bg-emerald-400
              "
            />

            <span>🚪 PUBLIC EXIT GATE</span>
          </div>
        </Html>
      </group>
    </group>
  );
}
