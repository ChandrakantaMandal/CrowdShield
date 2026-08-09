# CrowdShield — 3D Digital Twin Crowd Simulation

A real-time 3D crowd simulation digital twin built with **React + Three.js + Vite** for event safety monitoring and evacuation drills.

## Features
- **3D Digital Twin Venue**: Tech Fest floor plan featuring 5 distinct zones (`ZONE_A` Exhibition, `ZONE_B` Robotics, `ZONE_C` Main Stage, `ZONE_D` Food Lounge, `ZONE_E` Registration) & Emergency Exit Gate.
- **Autonomous Crowd Agents**: Renders hundreds of interactive 3D agents with real-time target seeking, flocking physics, and collision avoidance.
- **Weighted Risk Engine**: Evaluates density ($35\%$), speed ($20\%$), flow conflict ($20\%$), surge ($15\%$), and bottleneck ($10\%$) to assign risk status (`SAFE`, `WARNING`, `HIGH`, `CRITICAL`).
- **Interactive Scenarios**:
  - 🟢 **Normal Flow**
  - 🟡 **Crowd Influx**
  - 🟠 **Stage Bottleneck**
  - 🔴 **Crowd Surge**
  - 🚨 **Simulate Stampede Safety Drill** (Emergency exit rush & automated response protocol)
- **Accelerated Simulation Clock**: Configurable speed ($1\times, 10\times, 60\times, 300\times$).
- **FastAPI / Supabase Integration**: Dispatches telemetry (`POST /api/crowd/metrics`) with offline standalone fallback.

## Running the 3D Simulation

```bash
# Navigate to the Simulation directory
cd Simulation

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

Open `http://localhost:3000` in your browser.
