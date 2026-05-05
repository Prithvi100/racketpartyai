import InsightPage from './InsightPage';

const DEMAND = [
  { hour: '7a', tennis: 0.4, pickleball: 0.6 },
  { hour: '9a', tennis: 1.0, pickleball: 0.7 },
  { hour: '11a', tennis: 0.5, pickleball: 0.4 },
  { hour: '1p', tennis: 0.2, pickleball: 0.3 },
  { hour: '3p', tennis: 0.4, pickleball: 0.6 },
  { hour: '5p', tennis: 0.7, pickleball: 1.7 },
  { hour: '7p', tennis: 0.5, pickleball: 2.2 },
  { hour: '9p', tennis: 0.3, pickleball: 0.9 },
];

export default function Conversion() {
  return (
    <InsightPage
      title="Court conversion plan"
      subtitle="When does a tennis court flip to two pickleball courts? Daily, by hour, with quantified upside."
      kind="conversion"
      context={{
        facility: 'Mixed-use facility, 8 tennis + 6 pickleball',
        flippable_courts: ['T5', 'T6'],
        demand_index_hourly: DEMAND,
        last_4_weekends: 'pickleball waitlist averaged 9 at 5:30 PM Saturdays',
      }}
      preface={
        <div className="card p-5">
          <div className="font-semibold">Demand index by hour</div>
          <div className="text-xs text-ink-400 mb-2">Pickleball &gt; Tennis means flip is favorable.</div>
          <div className="space-y-1.5">
            {DEMAND.map((d) => {
              const ratio = d.pickleball / Math.max(d.tennis, 0.01);
              return (
                <div key={d.hour} className="flex items-center gap-2 text-sm">
                  <span className="w-10 text-ink-400">{d.hour}</span>
                  <div className="flex-1 grid grid-cols-2 gap-1">
                    <div className="h-2 rounded bg-ink-800 overflow-hidden">
                      <div className="h-full bg-clay" style={{ width: `${Math.min(d.tennis * 50, 100)}%` }} />
                    </div>
                    <div className="h-2 rounded bg-ink-800 overflow-hidden">
                      <div className="h-full bg-court" style={{ width: `${Math.min(d.pickleball * 50, 100)}%` }} />
                    </div>
                  </div>
                  <span className={`w-12 text-right text-xs ${ratio > 1.5 ? 'text-court' : 'text-ink-400'}`}>
                    {ratio.toFixed(1)}×
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="size-2.5 bg-clay rounded" /> tennis</span>
            <span className="flex items-center gap-1"><span className="size-2.5 bg-court rounded" /> pickleball</span>
          </div>
        </div>
      }
    />
  );
}
