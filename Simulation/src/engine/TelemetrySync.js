/**
 * CrowdShield Telemetry Sync
 * Sends telemetry updates to FastAPI backend endpoint (POST /api/crowd/metrics)
 * with smart offline backoff to keep browser devtools console clean.
 */

export class TelemetrySync {
  constructor(apiUrl) {
    if (!apiUrl) {
      console.warn('[TelemetrySync] No apiUrl provided – pass VITE_API_URL via env');
    }
    this.apiUrl = apiUrl;
    this.isConnected = false;
    this.isStreamingEnabled = false; // Off by default to prevent ERR_CONNECTION_REFUSED console spam
    this.lastResponse = null;
    this.lastAttemptTime = 0;
    this.backoffMs = Number(import.meta.env.VITE_TELEMETRY_BACKOFF_MS) || 15000; // Retry after 15 seconds if server is offline
    this.subscribers = new Set();
    this.lastVisibilityTransition = 0;

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  handleVisibilityChange = () => {
    this.lastVisibilityTransition = Date.now();
    if (document.visibilityState === 'visible' && this.isStreamingEnabled) {
      this.lastAttemptTime = 0;
    }
  };

  destroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  setApiUrl(url) {
    this.apiUrl = url;
  }

  setStreamingEnabled(enabled) {
    this.isStreamingEnabled = enabled;
    if (enabled) {
      // Manual reconnect: allow an immediate attempt
      this.lastAttemptTime = 0;
    } else {
      // Manual disconnect: stop the stream and clear the live connection state
      this.isConnected = false;
    }
    this.notify({ connected: this.isConnected, enabled: this.isStreamingEnabled });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(status) {
    this.subscribers.forEach(cb => cb(status));
  }

  async sendZoneMetrics(zoneMetrics, runId = 'DEMO-STAMPEDE-001', scenario = 'normal') {
    // If streaming is disabled by user, run silently in standalone mode
    if (!this.isStreamingEnabled) {
      return { success: false, standalone: true };
    }

    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return { success: false, suppressed: true };
    }

    // If server was previously offline, respect backoff timer before retrying
    const now = Date.now();
    if (!this.isConnected && (now - this.lastAttemptTime < this.backoffMs)) {
      return { success: false, standalone: true, suppressed: true };
    }

    this.lastAttemptTime = now;

    const payload = {
      camera_id: `SIM_${zoneMetrics.zone_id}`,
      zone_id: zoneMetrics.zone_id,
      people_count: zoneMetrics.people_count,
      density: zoneMetrics.density,
      speed: Number(zoneMetrics.speed.toFixed(2)),
      direction: zoneMetrics.direction || 'NORTH',
      surge_detected: zoneMetrics.surge_detected,
      bottleneck: zoneMetrics.bottleneck,
      flow_conflict: zoneMetrics.flow_conflict,
      run_id: runId,
      scenario: scenario,
      is_simulation: true,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${this.apiUrl}/api/crowd/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        // Manual disconnect while this request was in flight: do not re-mark as connected
        if (!this.isStreamingEnabled) {
          return { success: false, standalone: true };
        }
        this.isConnected = true;
        this.lastResponse = data;
        this.notify({ connected: true, enabled: this.isStreamingEnabled, lastSent: payload, response: data });
        return { success: true, data };
      } else {
        throw new Error(`HTTP Error ${response.status}`);
      }
    } catch (err) {
      const hidden =
        typeof document !== 'undefined' && document.visibilityState === 'hidden';
      const justSwitched = Date.now() - this.lastVisibilityTransition < 1500;
      if (hidden || justSwitched) {
        return { success: false, suppressed: true, error: err.message };
      }
      this.isConnected = false;
      this.notify({ connected: false, enabled: this.isStreamingEnabled, error: err.message });
      return { success: false, error: err.message, standalone: true };
    }
  }
}

export const telemetrySync = new TelemetrySync(import.meta.env.VITE_API_URL || 'http://localhost:8000');
