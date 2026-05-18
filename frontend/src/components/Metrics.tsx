const EVENT_COLORS: Record<string, string> = {
  concert: "#a855f7",
  sports: "#3b82f6",
  weather: "#06b6d4",
  travel: "#f59e0b",
  commute: "#10b981",
  exam: "#8b5cf6",
  emergency: "#ef4444",
  normal: "#6b7280",
};

export default function Metrics({ data }: any) {
  const time = data?.time_info || {};
  const cardStyle = (accent: string) => ({
    background: "#0a1628",
    border: `1px solid ${accent}44`,
    borderTop: `2px solid ${accent}`,
    borderRadius: 8,
    padding: "14px 16px",
    flex: 1,
    minWidth: 140,
  });

  if (!data) {
    return (
      <div style={{ display: "flex", gap: 12 }}>
        {["EVENT TYPE", "MULTIPLIER", "SURGE FARE", "EMERGENCY", "TAXIS NEEDED"].map(label => (
          <div key={label} style={cardStyle("#0ff3")}>
            <div style={{ fontSize: 10, color: "#0ff6", letterSpacing: 2, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a2a3a" }}>—</div>
          </div>
        ))}
      </div>
    );
  }

  const event = data.event || {};
  const eventType = event.eventType || "unknown";
  const accent = EVENT_COLORS[eventType] || "#00fff7";
  const isEmergency = event.is_emergency;
  const totalTaxis = (data.allocations || []).reduce((s: number, a: any) => s + (a.taxis_needed || 0), 0);

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
      <div style={cardStyle(accent)}>
        <div style={{ fontSize: 10, color: "#0ff6", letterSpacing: 2, marginBottom: 8 }}>EVENT TYPE</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: accent, textTransform: "uppercase" as const }}>{eventType}</div>
        <div style={{ fontSize: 11, color: "#0ff5", marginTop: 4 }}>TF-IDF Classified</div>
      </div>

      <div style={cardStyle("#f59e0b")}>
        <div style={{ fontSize: 10, color: "#0ff6", letterSpacing: 2, marginBottom: 8 }}>SURGE MULTIPLIER</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{event.multiplier?.toFixed(2)}x</div>
        <div style={{ fontSize: 11, color: "#0ff5", marginTop: 4 }}>Confidence: {((event.confidence || 0) * 100).toFixed(0)}%</div>
      </div>

      <div style={cardStyle("#00ff88")}>
        <div style={{ fontSize: 10, color: "#0ff6", letterSpacing: 2, marginBottom: 8 }}>SURGE FARE</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#00ff88" }}>${data.fare?.toFixed(2)}</div>
        <div style={{ fontSize: 11, color: "#0ff5", marginTop: 4 }}>Base: $10.00</div>
      </div>

      <div style={cardStyle(isEmergency ? "#ef4444" : "#0ff3")}>
        <div style={{ fontSize: 10, color: "#0ff6", letterSpacing: 2, marginBottom: 8 }}>EMERGENCY</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: isEmergency ? "#ef4444" : "#10b981" }}>
          {isEmergency ? "ACTIVE" : "CLEAR"}
        </div>
        <div style={{ fontSize: 11, color: "#0ff5", marginTop: 4 }}>{isEmergency ? "Base fare applied" : "Surge active"}</div>
      </div>

      <div style={cardStyle("#a855f7")}>
        <div style={{ fontSize: 10, color: "#0ff6", letterSpacing: 2, marginBottom: 8 }}>TAXIS DEPLOYED</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#a855f7" }}>{totalTaxis}</div>
        <div style={{ fontSize: 11, color: "#0ff5", marginTop: 4 }}>Across {(data.allocations || []).length} zones</div>
      </div>
      <div style={cardStyle("#06b6d4")}>
        <div style={{ fontSize: 10 }}>TIME CONTEXT</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {time.hour ?? "--"}:00
        </div>

        <div style={{ fontSize: 12, color: "#0ff5" }}>
         Rush Hour: {time.rush_hour_detected ? "YES" : "NO"}
        </div>
        <div style={{ fontSize: 12 }}>
         Boost: {time.time_boost_factor ?? 1}x
        </div>
      </div>
    </div>
  );
}
