/**
 * Tech Fest 3D Venue Configuration
 * Zone bounds, capacities, coordinates, and emergency exits.
 */

export const ZONES = {
  ZONE_A: {
    id: 'ZONE_A',
    name: 'Exhibition Hall A',
    role: 'Tech Demos & Booths',
    capacity: 180,
    color: '#3b82f6', // Blue
    accentColor: 'rgba(59, 130, 246, 0.4)',
    center: [-18, 0, 8],
    size: [18, 16],
    cameraPos: [-18, 20, 20],
    description: 'Hardware startups & sponsor product exhibits.'
  },
  ZONE_B: {
    id: 'ZONE_B',
    name: 'Robotics & AI Arena',
    role: 'Robotics Showcase',
    capacity: 160,
    color: '#8b5cf6', // Violet/Purple
    accentColor: 'rgba(139, 92, 246, 0.4)',
    center: [18, 0, 8],
    size: [18, 16],
    cameraPos: [18, 20, 20],
    description: 'Autonomous robotics arena and AI live lab.'
  },
  ZONE_C: {
    id: 'ZONE_C',
    name: 'Main Stage Arena',
    role: 'Keynotes & Competitions',
    capacity: 800,
    color: '#f59e0b', // Amber
    accentColor: 'rgba(245, 158, 11, 0.4)',
    center: [0, 0, -12],
    size: [32, 18],
    cameraPos: [0, 25, 12],
    description: 'Central keynote auditorium and hackathon awards stage.'
  },
  ZONE_D: {
    id: 'ZONE_D',
    name: 'Food & Lounge Plaza',
    role: 'Rest & Refreshments',
    capacity: 350,
    color: '#10b981', // Emerald
    accentColor: 'rgba(16, 185, 129, 0.4)',
    center: [25, 0, -14],
    size: [14, 18],
    cameraPos: [25, 18, 2],
    description: 'Dining stalls, coffee lounge, and networking zone.'
  },
  ZONE_E: {
    id: 'ZONE_E',
    name: 'Registration & Main Entry',
    role: 'Entry / Check-in',
    capacity: 250,
    color: '#06b6d4', // Cyan
    accentColor: 'rgba(6, 182, 212, 0.4)',
    center: [0, 0, 24],
    size: [24, 12], // width, depth (X, Z)
    cameraPos: [0, 20, 42],
    description: 'Primary ingress point for attendees and VIP registration.'
  },
};

export const EMERGENCY_EXIT = {
  id: 'EMERGENCY_EXIT',
  name: 'WEST EMERGENCY EVACUATION GATE',
  location: [-30, 0, -4], // Optimal West evacuation concourse between Main Stage & Hall A
  doorWidth: 10,
  glowColor: '#ef4444' // Red alert
};

export const MAIN_ENTRY = {
  id: 'MAIN_ENTRY',
  name: 'MAIN ENTRANCE GATE',
  location: [0, 0, 31],
  width: 12,
  color: '#06b6d4'
};

export const PUBLIC_EXIT = {
  id: 'PUBLIC_EXIT',
  name: 'PUBLIC EXIT GATE (ZONE B)',
  location: [30, 0, 9],
  width: 12,
  color: '#10b981'
};


export const GATES = {
  MAIN_ENTRY,
  EMERGENCY_EXIT,
  PUBLIC_EXIT
};

export const SCENARIOS = {
  normal: {
    id: 'normal',
    name: 'Normal Flow',
    badge: 'SAFE',
    agentCount: 220,
    description: 'Steady, uniform crowd movement across all 5 zones.'
  },
  crowd_increase: {
    id: 'crowd_increase',
    name: 'Crowd Influx',
    badge: 'WARNING',
    agentCount: 450,
    description: 'Rapid attendee arrival at Registration (ZONE_E).'
  },
  bottleneck: {
    id: 'bottleneck',
    name: 'Stage Bottleneck',
    badge: 'HIGH',
    agentCount: 520,
    description: 'Heavy crowd movement funneling into Main Stage (ZONE_C).'
  },
  surge: {
    id: 'surge',
    name: 'Crowd Surge',
    badge: 'CRITICAL',
    agentCount: 650,
    description: 'Sudden high density and flow conflict in central passageways.'
  },
  stampede: {
    id: 'stampede',
    name: 'Simulate Stampede Drill',
    badge: 'SAFETY DRILL',
    agentCount: 780,
    description: 'High-speed mass evacuation rush toward Emergency Exit Gate.'
  }
};
