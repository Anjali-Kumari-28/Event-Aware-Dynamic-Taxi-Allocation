export default function PipelineView() {
  const steps = [
    "User Input",
    "TF-IDF Event Detection",
    "Location + Time Analysis",
    "Graph Neural Network",
    "RL Agent (DQN)",
    "Taxi Allocation"
  ];

  return (
    <div style={{ background:"#0a1628", padding:16, borderRadius:8 }}>
      <div style={{ color:"#00fff7", fontWeight:700, marginBottom:10 }}>
        AI PIPELINE
      </div>

      {steps.map((s, i) => (
        <div key={i} style={{ textAlign:"center", marginBottom:6 }}>
          <div>{s}</div>
          {i < steps.length - 1 && <div style={{ color:"#0ff5" }}>↓</div>}
        </div>
      ))}
    </div>
  );
}