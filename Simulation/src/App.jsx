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
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem('crowdshield.streaming') === 'true'
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Map-only display mode (?view=map): render the 3D digital twin without any dashboard UI
  const isMapOnly = useMemo(
    () => new URLSearchParams(window.location.search).get('view') === 'map',
    []
  );

  // Instantiated Crowd Engine
  const crowdEngine = useMemo(() => new CrowdEngine(Number(import.meta.env.VITE_AGENT_COUNT) || 220), []);
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

    // Reconnect the last streaming preference, or always stream when embedded
    // as a map-only view so the admin dashboard keeps receiving live data.
    if (isMapOnly || localStorage.getItem('crowdshield.streaming') === 'true') {
      telemetrySync.setStreamingEnabled(true);
    }
    return () => unsubscribe();
  }, [apiUrl, isMapOnly]);

  const handleToggleStreaming = () => {
    const nextState = !isStreamingEnabled;
    localStorage.setItem('crowdshield.streaming', String(nextState));
    setIsStreamingEnabled(nextState);
    telemetrySync.setStreamingEnabled(nextState);
  };

  // Main Simulation Animation Loop (render/physics only)
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

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
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [crowdEngine, isPaused, simSpeed]);

  // Telemetry heartbeat - runs on its own timer so it keeps streaming even when
  // the tab is backgrounded (browsers throttle rAF there, starving the feed).
  useEffect(() => {
    const sendTelemetry = () => {
      const currentMetrics = crowdEngine.getZoneMetrics();
      setZoneMetrics(currentMetrics);

      // Stream all zones telemetry to backend endpoint
      Object.values(currentMetrics).forEach((zoneData) => {
        telemetrySync.sendZoneMetrics(zoneData, runId, scenarioKey);
      });
    };

    const timer = setInterval(sendTelemetry, 1000);

    // Reconnect instantly when the tab regains focus: background tabs throttle
    // timers (intensively after ~5 min), so the next setInterval tick could be
    // delayed by up to a minute. Fire one send immediately instead.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendTelemetry();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [crowdEngine, runId, scenarioKey]);

  // Apply a scenario to the crowd engine and shared state
  const applyScenario = (key) => {
    const sc = SCENARIOS[key] || SCENARIOS.normal;
    setScenarioKey(sc.id);
    crowdEngine.setScenario(sc.id, sc.agentCount);
    setAgents([...crowdEngine.agents]);
  };

  // Sync scenario across app instances (full dashboard + map-only embed) via BroadcastChannel
  const scenarioChannel = useMemo(() => {
    if (typeof BroadcastChannel === 'undefined') return null;
    return new BroadcastChannel('crowdshield-scenario');
  }, []);

  // Listen for scenario changes from the full dashboard (map-only mode)
  useEffect(() => {
    if (!scenarioChannel) return;
    const onMessage = (event) => {
      if (event.data?.type === 'scenario' && SCENARIOS[event.data.key]) {
        applyScenario(event.data.key);
      }
    };
    scenarioChannel.addEventListener('message', onMessage);
    return () => scenarioChannel.removeEventListener('message', onMessage);
  }, [scenarioChannel]);

  // Map-only mode: honor an optional ?scenario= param for the initial state
  useEffect(() => {
    if (!isMapOnly) return;
    const initial = new URLSearchParams(window.location.search).get('scenario');
    if (initial && SCENARIOS[initial]) {
      applyScenario(initial);
    }
  }, []);

  // Scenario change handler (full dashboard)
  const handleSelectScenario = (key) => {
    applyScenario(key);
    if (scenarioChannel) {
      scenarioChannel.postMessage({ type: 'scenario', key: SCENARIOS[key] ? key : 'normal' });
    }
  };

  // Reset simulation
  const handleReset = () => {
    applyScenario('normal');
    setSimSeconds(0);
    if (scenarioChannel) {
      scenarioChannel.postMessage({ type: 'scenario', key: 'normal' });
    }
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
      {/* 1. HUD Navigation & Header (hidden in map-only mode) */}
      {!isMapOnly && (
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
      )}

      {/* 2. Interactive Controls & Telemetry Overlay (hidden in map-only mode) */}
      {!isMapOnly && (
        <ControlPanel
          activeScenario={scenarioKey}
          onSelectScenario={handleSelectScenario}
          onReset={handleReset}
        />
      )}

      {!isMapOnly && (
        <TelemetryPanel
          zoneMetrics={zoneMetrics}
          activeZone={activeZone}
          onSelectZone={setActiveZone}
        />
      )}

      {!isMapOnly && (
        <AlertBanner
          activeScenario={scenarioKey}
          highestRiskZone={highestRiskZone}
          isStampede={scenarioKey === 'stampede'}
        />
      )}

      {/* 3. Three.js 3D Digital Twin Canvas (fills viewport) */}
      <div className={isMapOnly ? 'absolute inset-0 w-full h-full' : 'relative w-full h-full'}>
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
        {!isMapOnly && (
          <>
            <EmergencyPath3D
              activeScenario={scenarioKey}
              isCritical={highestRiskZone?.risk?.level === 'CRITICAL'}
            />
            <ZoneLabels3D
              zoneMetrics={zoneMetrics}
              activeZone={activeZone}
              onSelectZone={setActiveZone}
            />
          </>
        )}
      </Canvas>
      </div>

      {/* 4. Configuration Settings Modal (hidden in map-only mode) */}
      {!isMapOnly && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiUrl={apiUrl}
          onSaveApiUrl={setApiUrl}
          runId={runId}
          onSaveRunId={setRunId}
        />
      )}
    </div>
  );
}
