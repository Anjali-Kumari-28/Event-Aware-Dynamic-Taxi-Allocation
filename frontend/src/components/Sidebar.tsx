import React, { useState } from "react";

const SAMPLE_EVENTS = [
  "concert at madison square garden",
  "nba finals game night",
  "heavy rain in manhattan",
  "flight delay at jfk airport",
  "fire emergency in brooklyn",
  "morning rush hour traffic",
  "university exam week",
  "snowstorm in nyc",
];

type Props = { onRun: (text: string) => void; loading?: boolean; };

export default function Sidebar({ onRun, loading }: Props) {
  const [text, setText] = useState<string>("");

  const handleRun = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // ✅ Basic frontend check — warn if clearly too short
    if (trimmed.length < 5 || trimmed.split(" ").length < 2) {
      alert("Please enter a meaningful event description (e.g. 'concert at madison square garden')");
      return;
    }
    onRun(trimmed);
  };

  return (
    <div style={{ width: 240, background: "#070d1a", borderRight: "1px solid #0ff2", padding: 16, display: "flex", flexDirection: "column" as const, gap: 14, overflowY: "auto" as const }}>
      
      {/* System Status */}
      <div>
        <div style={{ fontSize: 10, color: "#00fff7", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>SYSTEM STATUS</div>
        {["Backend API", "ML Classifier", "GNN Graph", "RL Agent"].map(item => (
          <div key={item} style={{ display: "flex", alignItems: "center", fontSize: 11, color: "#0ff9", marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", display: "inline-block", marginRight: 8 }} />
            {item}
            <span style={{ marginLeft: "auto", color: "#00ff88", fontSize: 10 }}>ONLINE</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #0ff2" }} />

      {/* Event Input */}
      <div>
        <div style={{ fontSize: 10, color: "#00fff7", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>EVENT INPUT</div>
        
        {/* ✅ Placeholder hint added */}
        <div style={{ fontSize: 10, color: "#0ff5", marginBottom: 6 }}>
          Describe a real NYC event below
        </div>

        <textarea
          style={{ width: "100%", background: "#0a1628", border: "1px solid #0ff4", color: "#e2e8f0", padding: "10px 12px", borderRadius: 6, fontSize: 12, fontFamily: "monospace", resize: "vertical" as const, minHeight: 80, outline: "none", boxSizing: "border-box" as const }}
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          placeholder="e.g. concert at madison square garden"
          // ✅ Allow Enter key to submit
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleRun();
            }
          }}
        />

        <button
          style={{ width: "100%", background: loading ? "#0a1628" : "#00fff7", color: loading ? "#0ff8" : "#050a13", border: "1px solid #00fff7", padding: "10px 0", borderRadius: 6, fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: loading ? "not-allowed" : "pointer", fontFamily: "monospace", marginTop: 8 }}
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? "PROCESSING..." : "RUN DISPATCH"}
        </button>
      </div>

      <div style={{ borderTop: "1px solid #0ff2" }} />

      {/* Quick Events */}
      <div>
        <div style={{ fontSize: 10, color: "#00fff7", letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>QUICK EVENTS</div>
        {SAMPLE_EVENTS.map((e) => (
          <button
            key={e}
            style={{ background: "transparent", border: "1px solid #0ff2", color: "#0ff9", padding: "6px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", fontFamily: "monospace", width: "100%", textAlign: "left" as const, marginBottom: 4 }}
            onClick={() => { setText(e); onRun(e); }}
          >
            › {e}
          </button>
        ))}
      </div>
    </div>
  );
}