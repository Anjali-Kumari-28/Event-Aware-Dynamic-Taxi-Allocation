import { useState } from "react";
import { predict, simulateTaxis } from "./api";
import MapView from "./components/MapView";
import Metrics from "./components/Metrics";
import TopZones from "./components/TopZones";
import Sidebar from "./components/Sidebar";
import TimeImpact from "./components/TimeImpact";
import PipelineView from "./components/pipelineView";


export default function App() {
  const [data, setData] = useState<any>(null);
  const [taxis, setTaxis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // ✅ NEW error state

  const run = async (text: string) => {
    setLoading(true);
    setError(null); // ✅ Clear previous error

    try {
      const res = await predict(text);

      // ✅ If backend returns an error field, show it and stop
      if (res.error) {
        setError(res.error);
        setData(null);
        setTaxis([]);
        return;
      }

      const taxiSim = await simulateTaxis(res.allocations || []);
      setData(res);
      setTaxis(taxiSim || []);

    } catch (err: any) {
      // ✅ Handle HTTP error responses (400, 422)
      const msg = err?.response?.data?.error || "Something went wrong. Please try again.";
      setError(msg);
      setData(null);
      setTaxis([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050a13", color: "#e2e8f0", fontFamily: "monospace" }}>
      
      {/* Header */}
      <div style={{ borderBottom: "1px solid #0ff3", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#070d1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00fff7" }} />
          <span style={{ color: "#00fff7", fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>NYC AI DISPATCH</span>
          <span style={{ color: "#334155", fontSize: 12, marginLeft: 8 }}>EVENT-AWARE DYNAMIC TAXI ALLOCATION</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#0ff8" }}>
          <span>GNN: GraphSAGE</span>
          <span style={{ color: "#1e293b" }}>|</span>
          <span>RL: DQN Agent</span>
          <span style={{ color: "#1e293b" }}>|</span>
          <span>ML: TF-IDF</span>
          <span style={{ color: "#1e293b" }}>|</span>
          <span>Data: NYC TLC 2026</span>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 53px)" }}>
        <Sidebar onRun={run} loading={loading} />

        <div style={{ flex: 1, padding: 16, overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: 16 }}>

          {/* ✅ Error banner — shows when gibberish or invalid input entered */}
          {error && (
            <div style={{
              background: "#1a0a0a",
              border: "1px solid #ef444488",
              borderLeft: "3px solid #ef4444",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{ color: "#ef4444", fontSize: 16 }}>⚠</span>
              <div>
                <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>INVALID INPUT</div>
                <div style={{ color: "#fca5a5", fontSize: 12, marginTop: 2 }}>{error}</div>
                <div style={{ color: "#0ff5", fontSize: 11, marginTop: 4 }}>
                  Try: "concert at madison square garden" or use Quick Events below
                </div>
              </div>
            </div>
          )}

        <div className="dashboard-grid">

          <Metrics data={data} />
          
          <PipelineView />

        </div>

          <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1 }}>
              <MapView data={data} taxisData={taxis} allocations={data?.allocations || []}  />
            </div>
            <div style={{ width: 260 }}>
              <TopZones data={data} 
                zones={Array.isArray(data?.zones) ? data.zones : []}
                allocations={data?.allocations || []}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
