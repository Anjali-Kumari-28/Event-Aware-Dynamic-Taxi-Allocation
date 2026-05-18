export default function TopZones({ zones, allocations, data }: any) {
  const isArray = Array.isArray(zones) && zones.length > 0;

  // ✅ REPLACED (safe sorting with fallback demand)
  const sorted = isArray
    ? (zones || [])
        .map((z: any) => ({ ...z, demand: z.demand || 0 }))
        .sort((a, b) =>
          (data?.gnn_demand?.[b.PULocationID] || 0) -
          (data?.gnn_demand?.[a.PULocationID] || 0)
        )
        .slice(0, 8)
    : [];

  const maxDemand = sorted[0]?.demand || 1;

  const allocMap: Record<number, number> = {};
  (allocations || []).forEach((a: any) => { allocMap[a.zone_id] = a.taxis_needed; });

  return (
    <div style={{ background: "#070d1a", border: "1px solid #0ff2", borderRadius: 8, padding: 16, height: "100%", overflowY: "auto" as const }}>
      <div style={{ fontSize: 10, color: "#00fff7", letterSpacing: 2, fontWeight: 700, marginBottom: 16 }}>
        TOP DEMAND ZONES
      </div>

      {!isArray ? (
        <div style={{ color: "#0ff4", fontSize: 12, textAlign: "center" as const, marginTop: 40 }}>
          Run dispatch to see zone data
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {sorted.map((z: any, i: number) => {
            const pct = (z.demand / maxDemand) * 100;
            const taxis = allocMap[z.PULocationID];
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: "#00fff7" }}>Zone {z.PULocationID}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {taxis && (
                      <span style={{ background: "#a855f744", color: "#a855f7", padding: "1px 6px", borderRadius: 4, fontSize: 10 }}>
                        {taxis} taxis
                      </span>
                    )}
                    <span style={{ color: "#f59e0b" }}>{Math.round(z.demand)}</span>
                  </div>
                </div>
                <div style={{ background: "#0a1628", borderRadius: 4, height: 6, overflow: "hidden" as const }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: i === 0 ? "#00fff7" : i < 3 ? "#3b82f6" : "#0ff4", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 10, color: "#0ff5", marginTop: 2 }}>
                  avg fare: ${z.fare_amount?.toFixed(2) || "—"} · dist: {z.trip_distance?.toFixed(1) || "—"} mi
                </div>
              </div>
            );
          })}
        </div>
      )}

      {allocations?.length > 0 && (
        <div style={{ marginTop: 20, borderTop: "1px solid #0ff2", paddingTop: 12 }}>
          <div style={{ fontSize: 10, color: "#00fff7", letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>
            RL AGENT ALLOCATION
          </div>
          {allocations.map((a: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#0ff9", marginBottom: 4 }}>
              <span>Zone {a.zone_id}</span>
              <span style={{ color: "#a855f7" }}>{a.taxis_needed} taxis</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}