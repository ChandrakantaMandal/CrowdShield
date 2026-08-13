import * as React from "react";

import { getRiskEvents, type RiskEvent } from "@/lib/api";
import { usePolling } from "@/lib/use-polling";
import { showForegroundAlert } from "@/utils/notifications";

const POLL_INTERVAL_MS = 5000;

const ALERT_LEVELS = new Set(["HIGH", "CRITICAL"]);

function eventKey(event: RiskEvent): string {
  return `${event.created_at}-${event.zone_id}`;
}

export function RiskNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const seenRef = React.useRef<Set<string>>(new Set());

  const { data } = usePolling<RiskEvent[]>({
    fetcher: () => getRiskEvents(10),
    intervalMs: POLL_INTERVAL_MS,
  });

  React.useEffect(() => {
    if (!data) {
      return;
    }

    for (const event of data) {
      const key = eventKey(event);
      if (seenRef.current.has(key)) {
        continue;
      }
      seenRef.current.add(key);

      if (ALERT_LEVELS.has(event.risk_level)) {
        showForegroundAlert(
          `${event.risk_level} risk in ${event.zone_id}`,
          event.reason,
        );
      }
    }
  }, [data]);

  return <>{children}</>;
}
