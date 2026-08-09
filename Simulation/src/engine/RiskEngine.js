/**
 * CrowdShield Risk Engine
 * Evaluates real-time crowd metrics and computes weighted risk scores.
 * 
 * Formula:
 * Risk = (Density * 0.35) + (SpeedScore * 0.20) + (FlowConflict * 0.20) + (Surge * 0.15) + (Bottleneck * 0.10)
 */

export function calculateZoneRisk(metrics) {
  const {
    people_count = 0,
    capacity = 250,
    speed = 1.0, // meters / sec
    surge_detected = false,
    bottleneck = false,
    flow_conflict = false
  } = metrics;

  // 1. Density Score (0 - 100)
  const densityRatio = Math.min(people_count / capacity, 1.5);
  const densityScore = Math.min(Math.round(densityRatio * 100), 100);

  // 2. Speed Score (Higher risk when speed is dangerously high OR stalled in bottleneck)
  // Normal walking speed = 1.2 m/s. > 2.5 m/s indicates running/panic; < 0.3 m/s in high density indicates crushing stall.
  let speedScore = 20; // default safe baseline
  if (speed > 2.2) {
    speedScore = 95; // Panic running speed
  } else if (speed < 0.35 && densityScore > 75) {
    speedScore = 85; // Crushing bottleneck stall
  } else if (speed > 1.8) {
    speedScore = 65;
  } else {
    speedScore = Math.round(speed * 25);
  }

  // 3. Flow Conflict Score (0 or 100)
  const conflictScore = flow_conflict ? 100 : 10;

  // 4. Surge Score (0 or 100)
  const surgeScore = surge_detected ? 100 : 0;

  // 5. Bottleneck Score (0 or 100)
  const bottleneckScore = bottleneck ? 100 : 0;

  // Compute weighted score
  const score = Math.round(
    densityScore * 0.35 +
    speedScore * 0.20 +
    conflictScore * 0.20 +
    surgeScore * 0.15 +
    bottleneckScore * 0.10
  );

  const boundedScore = Math.max(0, Math.min(100, score));

  // Determine Risk Level
  let level = 'SAFE';
  let color = '#10b981'; // Green
  let recommendations = 'Normal operations. Monitor crowd flow routinely.';

  if (boundedScore > 80) {
    level = 'CRITICAL';
    color = '#ef4444'; // Red
    recommendations = 'CRITICAL OVERCROWDING: Open Emergency Exit Gates immediately, halt ingress, and dispatch security stewards.';
  } else if (boundedScore > 60) {
    level = 'HIGH';
    color = '#f97316'; // Orange
    recommendations = 'HIGH RISK: Divert crowd influx to alternate corridors and prepare exit routes.';
  } else if (boundedScore > 30) {
    level = 'WARNING';
    color = '#f59e0b'; // Yellow
    recommendations = 'ELEVATED DENSITY: Monitor registration queues and adjust ticket scan velocity.';
  }

  return {
    score: boundedScore,
    level,
    color,
    recommendations,
    breakdown: {
      densityScore,
      speedScore,
      conflictScore,
      surgeScore,
      bottleneckScore
    }
  };
}
