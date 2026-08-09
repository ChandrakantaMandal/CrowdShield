/**
 * CrowdEngine.js
 * Visual agent simulation engine: physics, pathfinding, movement,
 * zone aggregation, and scenario behaviors.
 */

import { ZONES, EMERGENCY_EXIT, MAIN_ENTRY } from '../data/venueConfig.js';
import { calculateZoneRisk } from './RiskEngine.js';

function getRandomInZone(zone) {
  const [cx, , cz] = zone.center;
  const [w, d] = zone.size;
  const rx = cx + (Math.random() - 0.5) * (w * 0.85);
  const rz = cz + (Math.random() - 0.5) * (d * 0.85);
  return [rx, 0, rz];
}

function getZoneForPosition(pos) {
  const [x, , z] = pos;
  for (const zoneId of Object.keys(ZONES)) {
    const zone = ZONES[zoneId];
    const [cx, , cz] = zone.center;
    const [w, d] = zone.size;
    if (Math.abs(x - cx) <= w / 2 + 1 && Math.abs(z - cz) <= d / 2 + 1) {
      return zoneId;
    }
  }
  return 'ZONE_C'; // Fallback central hall
}

function calculateDirection(dx, dz) {
  const angle = Math.atan2(dz, dx) * (180 / Math.PI);
  if (angle >= -22.5 && angle < 22.5) return 'EAST';
  if (angle >= 22.5 && angle < 67.5) return 'SOUTH_EAST';
  if (angle >= 67.5 && angle < 112.5) return 'SOUTH';
  if (angle >= 112.5 && angle < 157.5) return 'SOUTH_WEST';
  if (angle >= 157.5 || angle < -157.5) return 'WEST';
  if (angle >= -157.5 && angle < -112.5) return 'NORTH_WEST';
  if (angle >= -112.5 && angle < -67.5) return 'NORTH';
  return 'NORTH_EAST';
}

export class CrowdEngine {
  constructor(targetAgentCount = 250) {
    this.agents = [];
    this.scenario = 'normal';
    this.simSpeedMultiplier = 1; // 1x, 10x, 60x, 300x
    this.initAgents(targetAgentCount);
  }

  initAgents(count) {
    const zoneKeys = Object.keys(ZONES);
    this.agents = [];

    for (let i = 0; i < count; i++) {
      // Distribute initial agents across zones
      const zoneId = zoneKeys[i % zoneKeys.length];
      const zone = ZONES[zoneId];
      const pos = getRandomInZone(zone);
      const target = getRandomInZone(zone);

      this.agents.push({
        id: `agent_${i}`,
        pos: [...pos],
        target: [...target],
        speed: 1.0 + Math.random() * 0.4,
        zone_id: zoneId,
        direction: 'NORTH',
        colorOffset: Math.random()
      });
    }
  }

  setScenario(scenarioKey, targetCount = 300) {
    this.scenario = scenarioKey;
    const zoneKeys = Object.keys(ZONES);

    if (scenarioKey === 'normal') {
      // Re-initialize and distribute agents uniformly across all 5 zones with fresh random positions & targets
      this.initAgents(targetCount);
      return;
    }

    const currentCount = this.agents.length;

    if (targetCount > currentCount) {
      // Add new agents distributed across zones
      for (let i = currentCount; i < targetCount; i++) {
        const zoneId = zoneKeys[i % zoneKeys.length];
        const entryPos = getRandomInZone(ZONES[zoneId] || ZONES.ZONE_E);
        this.agents.push({
          id: `agent_${i}`,
          pos: [...entryPos],
          target: getRandomInZone(ZONES[zoneId]),
          speed: 1.1 + Math.random() * 0.4,
          zone_id: zoneId,
          direction: 'NORTH',
          colorOffset: Math.random()
        });
      }
    } else if (targetCount < currentCount) {
      this.agents = this.agents.slice(0, targetCount);
    }

    // Retarget existing agents based on the selected scenario rules
    this.agents.forEach(agent => {
      this.assignScenarioTarget(agent);
    });
  }


  assignScenarioTarget(agent) {
    const zoneKeys = Object.keys(ZONES);

    switch (this.scenario) {
      case 'stampede':
        // Everyone rushes to Emergency Exit
        agent.target = [
          EMERGENCY_EXIT.location[0] + (Math.random() - 0.5) * 6,
          0,
          EMERGENCY_EXIT.location[2] + (Math.random() - 0.5) * 6
        ];
        agent.speed = 2.4 + Math.random() * 0.8; // Fast panic speed
        break;

      case 'bottleneck':
        // Funnel 80% to Zone C Main Stage stage entry
        if (Math.random() < 0.8) {
          agent.target = [0 + (Math.random() - 0.5) * 6, 0, -4 + (Math.random() - 0.5) * 4];
          agent.speed = 0.4 + Math.random() * 0.3; // Slowed bottleneck speed
        } else {
          agent.target = getRandomInZone(ZONES[agent.zone_id] || ZONES.ZONE_C);
          agent.speed = 1.0;
        }
        break;

      case 'surge':
        // High density in Main Stage with opposing vectors
        if (Math.random() < 0.5) {
          agent.target = [8 + (Math.random() - 0.5) * 4, 0, -12 + (Math.random() - 0.5) * 4]; // Moving right
        } else {
          agent.target = [-8 + (Math.random() - 0.5) * 4, 0, -12 + (Math.random() - 0.5) * 4]; // Moving left (Flow Conflict)
        }
        agent.speed = 1.8;
        break;

      case 'crowd_increase':
        // Influx through ZONE_E and towards ZONE_A/B
        if (agent.zone_id === 'ZONE_E' || Math.random() < 0.4) {
          const nextZone = Math.random() > 0.5 ? ZONES.ZONE_A : ZONES.ZONE_B;
          agent.target = getRandomInZone(nextZone);
        } else {
          agent.target = getRandomInZone(ZONES[agent.zone_id] || ZONES.ZONE_C);
        }
        agent.speed = 1.2;
        break;

      case 'normal':
      default:
        // Regular random wandering: 40% cross-zone exploration, 60% intra-zone wandering
        if (Math.random() < 0.4 || !ZONES[agent.zone_id]) {
          const nextZoneId = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
          agent.target = getRandomInZone(ZONES[nextZoneId]);
        } else {
          agent.target = getRandomInZone(ZONES[agent.zone_id] || ZONES.ZONE_C);
        }
        agent.speed = 1.0 + Math.random() * 0.4;
        break;
    }
  }


  update(deltaSeconds) {
    const effectiveDelta = deltaSeconds * this.simSpeedMultiplier;

    this.agents.forEach(agent => {
      const dx = agent.target[0] - agent.pos[0];
      const dz = agent.target[2] - agent.pos[2];
      const dist = Math.hypot(dx, dz);

      if (dist < 0.8) {
        // Arrived at target: assign new target
        this.assignScenarioTarget(agent);
      } else {
        // Move towards target
        const step = Math.min(agent.speed * effectiveDelta, dist);
        const nx = dx / dist;
        const nz = dz / dist;

        agent.pos[0] += nx * step;
        agent.pos[2] += nz * step;
        agent.direction = calculateDirection(nx, nz);

        // Update assigned zone
        agent.zone_id = getZoneForPosition(agent.pos);
      }
    });
  }

  getZoneMetrics() {
    const metricsMap = {};

    Object.keys(ZONES).forEach(zoneId => {
      metricsMap[zoneId] = {
        zone_id: zoneId,
        people_count: 0,
        capacity: ZONES[zoneId].capacity,
        speedSum: 0,
        directions: {},
        surge_detected: false,
        bottleneck: false,
        flow_conflict: false
      };
    });

    // Aggregate agent state
    this.agents.forEach(agent => {
      const zid = agent.zone_id;
      if (metricsMap[zid]) {
        const m = metricsMap[zid];
        m.people_count += 1;
        m.speedSum += agent.speed;
        m.directions[agent.direction] = (m.directions[agent.direction] || 0) + 1;
      }
    });

    // Compute zone summaries & flags based on scenario
    Object.keys(metricsMap).forEach(zoneId => {
      const m = metricsMap[zoneId];
      const cap = m.capacity;
      m.density = Math.min(Math.round((m.people_count / cap) * 100), 150);
      m.speed = m.people_count > 0 ? m.speedSum / m.people_count : 1.0;

      // Find predominant direction
      let maxDir = 'NORTH';
      let maxCount = 0;
      Object.entries(m.directions).forEach(([dir, cnt]) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          maxDir = dir;
        }
      });
      m.direction = maxDir;

      // Scenario-based telemetry triggers
      if (this.scenario === 'stampede') {
        m.surge_detected = true;
        m.flow_conflict = true;
        m.bottleneck = zoneId === 'ZONE_A' || zoneId === 'ZONE_C';
      } else if (this.scenario === 'surge') {
        if (zoneId === 'ZONE_C' || zoneId === 'ZONE_E') {
          m.surge_detected = true;
          m.flow_conflict = true;
        }
      } else if (this.scenario === 'bottleneck') {
        if (zoneId === 'ZONE_C') {
          m.bottleneck = true;
        }
      } else if (this.scenario === 'crowd_increase') {
        if (zoneId === 'ZONE_E') {
          m.surge_detected = true;
        }
      }

      // Calculate risk metrics
      const risk = calculateZoneRisk(m);
      m.score = risk.score;
      m.level = risk.level;
      m.color = risk.color;
      m.recommendations = risk.recommendations;
    });

    return metricsMap;
  }
}

