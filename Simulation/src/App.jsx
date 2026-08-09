import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CrowdEngine } from './engine/CrowdEngine';
import { calculateZoneRisk } from './engine/RiskEngine';
import { telemetrySync } from './engine/TelemetrySync';
import { SCENARIOS, ZONES } from './data/venueConfig';

import { Venue3D } from './components/3d/Venue3D';
import { CrowdAgents } from './components/3d/CrowdAgents';
import { EmergencyPath3D } from './components/3d/EmergencyPath3D';
import { ZoneLabels3D } from './components/3d/ZoneLabels3D';

import { TopHeader } from './components/ui/TopHeader';
import { ControlPanel } from './components/ui/ControlPanel';
import { TelemetryPanel } from './components/ui/TelemetryPanel';
import { AlertBanner } from './components/ui/AlertBanner';
import { SettingsModal } from './components/ui/SettingsModal';

export default function App() {
  const [scenarioKey, setScenarioKey] = useState('normal');
  const [simSpeed, setSimSpeed] = useState(1);
  const [simSeconds, setSimSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeZone, setActiveZone] = useState('ZONE_C');
  const [runId, setRunId] = useState(import.meta.env.VITE_DEFAULT_RUN_ID || 'DEMO-STAMPEDE-001');
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [isConnected, setIsConnected] = useState(false);
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Instantiated Crowd Engine
  const crowdEngine = useMemo(() => new CrowdEngine(220), []);
  const [agents, setAgents] = useState([]);
  const [zoneMetrics, setZoneMetrics] = useState({});

  // Initialize engine & telemetry connection
  useEffect(() => {
    telemetrySync.setApiUrl(apiUrl);
    const unsubscribe = telemetrySync.subscribe((status) => {
      setIsConnected(status.connected);
      if (status.enabled !== undefined) {
        setIsStreamingEnabled(status.enabled);
      }
    });
    return () => unsubscribe();
  }, [apiUrl]);

  const handleToggleStreaming = () => {
    const nextState = !isStreamingEnabled;
    setIsStreamingEnabled(nextState);
    telemetrySync.setStreamingEnabled(nextState);
  };

  // Main Simulation Animation & Telemetry Tick Loop
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();
    let telemetryTimer = 0;

    const tick = (now) => {
      const deltaSeconds = (now - lastTime) / 1000;
      lastTime = now;

      if (!isPaused) {
        // Update crowd engine movement physics
        crowdEngine.simSpeedMultiplier = simSpeed;
        crowdEngine.update(Math.min(deltaSeconds, 0.1));
        setAgents([...crowdEngine.agents]);

        // Advance simulation clock
        setSimSeconds((prev) => prev + deltaSeconds * simSpeed);

        // Periodically aggregate metrics and stream telemetry
        telemetryTimer += deltaSeconds;
        if (telemetryTimer >= 1.0) {
          telemetryTimer = 0;
          const currentMetrics = crowdEngine.getZoneMetrics();
          setZoneMetrics(currentMetrics);

          // Stream active zone telemetry to backend endpoint
          const activeZData = currentMetrics[activeZone];
          if (activeZData) {
            telemetrySync.sendZoneMetrics(activeZData, runId, scenarioKey);
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [crowdEngine, isPaused, simSpeed, activeZone, runId, scenarioKey]);

  // Scenario change handler
  const handleSelectScenario = (key) => {
    setScenarioKey(key);
    const sc = SCENARIOS[key] || SCENARIOS.normal;
    crowdEngine.setScenario(key, sc.agentCount);
    setAgents([...crowdEngine.agents]);
  };

  // Reset simulation
  const handleReset = () => {
    setScenarioKey('normal');
    setSimSeconds(0);
    crowdEngine.setScenario('normal', 220);
    setAgents([...crowdEngine.agents]);
  };

  // Determine highest risk zone for emergency alert banner
  const highestRiskZone = useMemo(() => {
    let highest = null;
    let maxScore = -1;

    Object.keys(ZONES).forEach((zid) => {
      const zm = zoneMetrics[zid] || { people_count: 0, density: 0 };
      const risk = calculateZoneRisk({ ...zm, capacity: ZONES[zid].capacity });
      if (risk.score > maxScore) {
        maxScore = risk.score;
        highest = { zone_id: zid, risk };
      }
    });

    return highest;
  }, [zoneMetrics]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 1. HUD Navigation & Header */}
      <TopHeader
        simSeconds={simSeconds}
        simSpeed={simSpeed}
        onChangeSimSpeed={setSimSpeed}
        scenarioKey={scenarioKey}
        runId={runId}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        isConnected={isConnected}
        isStreamingEnabled={isStreamingEnabled}
        onToggleStreaming={handleToggleStreaming}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Interactive Controls & Telemetry Overlay */}
      <ControlPanel
        activeScenario={scenarioKey}
        onSelectScenario={handleSelectScenario}
        onReset={handleReset}
      />

      <TelemetryPanel
        zoneMetrics={zoneMetrics}
        activeZone={activeZone}
        onSelectZone={setActiveZone}
      />

      <AlertBanner
        activeScenario={scenarioKey}
        highestRiskZone={highestRiskZone}
        isStampede={scenarioKey === 'stampede'}
      />

      {/* 3. Three.js 3D Digital Twin Canvas */}
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 45, 55]} fov={50} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={15}
          maxDistance={90}
        />

        {/* Scene Lighting & Fog */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[30, 50, 20]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
        />
        <pointLight position={[-30, 15, -12]} color="#ef4444" intensity={2} /> {/* Emergency exit glow */}
        <color attach="background" args={['#050811']} />
        <fog attach="fog" args={['#050811', 45, 120]} />

        {/* 3D Scene Components */}
        <Venue3D activeZone={activeZone} zoneRiskData={zoneMetrics} />
        <CrowdAgents agents={agents} scenario={scenarioKey} />
        <EmergencyPath3D
          activeScenario={scenarioKey}
          isCritical={highestRiskZone?.risk?.level === 'CRITICAL'}
        />
        <ZoneLabels3D
          zoneMetrics={zoneMetrics}
          activeZone={activeZone}
          onSelectZone={setActiveZone}
        />
      </Canvas>

      {/* 4. Configuration Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiUrl={apiUrl}
        onSaveApiUrl={setApiUrl}
        runId={runId}
        onSaveRunId={setRunId}
      />
    </div>
  );
}
