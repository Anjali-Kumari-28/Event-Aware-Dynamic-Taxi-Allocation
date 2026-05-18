export default function TimeImpact({ data }: any) {
  const base = data?.zones?.map((z:any)=>z.demand) || [];
  const boosted = data?.gnn_demand || [];

  const avgBase = base.reduce((a:number,b:number)=>a+b,0) / (base.length || 1);
  const avgFinal = boosted.reduce((a:number,b:number)=>a+b,0) / (boosted.length || 1);

  return (
    <div style={{ background:"#0a1628", padding:16, borderRadius:8 }}>
      <div style={{ color:"#00fff7", fontWeight:700 }}>TIME INFLUENCE</div>

      <div>Base Demand: {avgBase.toFixed(2)}</div>
      <div>→ After Time Boost</div>
      <div>Final Demand: {avgFinal.toFixed(2)}</div>

      <div style={{ color:"#06b6d4", marginTop:8 }}>
        Multiplier: {data?.time_info?.time_boost_factor}x
      </div>
    </div>
  );
}