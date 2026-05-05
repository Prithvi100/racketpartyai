import InsightPage from './InsightPage';

const AT_RISK = [
  { name: 'K. Patel', risk: 0.81, lastVisit: '31d', tenure: '2.4y' },
  { name: 'M. Alvarez', risk: 0.78, lastVisit: '26d', tenure: '1.1y' },
  { name: 'J. Liu', risk: 0.74, lastVisit: '22d', tenure: '3.2y' },
  { name: 'S. Garcia', risk: 0.71, lastVisit: '19d', tenure: '0.8y' },
  { name: 'R. Khan', risk: 0.69, lastVisit: '20d', tenure: '4.0y' },
  { name: 'D. Chen', risk: 0.66, lastVisit: '17d', tenure: '0.5y' },
  { name: 'T. Brooks', risk: 0.62, lastVisit: '15d', tenure: '2.0y' },
  { name: 'A. Gomez', risk: 0.58, lastVisit: '14d', tenure: '1.3y' },
];

export default function Churn() {
  return (
    <InsightPage
      title="Churn prediction"
      subtitle="Per-club model on attendance, lessons, leagues, and check-ins. Surface the at-risk list and suggest save plays."
      kind="churn"
      context={{
        facility: 'Pickleball Kingdom — Austin Domain',
        members: 1420,
        rolling_30d_attrition: 0.024,
        at_risk: AT_RISK,
        common_signals: ['missed two consecutive league nights', 'preferred clinic discontinued'],
      }}
      preface={
        <div className="card p-5">
          <div className="font-semibold">Top at-risk (model score)</div>
          <table className="w-full text-sm mt-3">
            <thead className="text-xs text-ink-400">
              <tr>
                <th className="text-left">Member</th>
                <th className="text-left">Risk</th>
                <th className="text-left">Last visit</th>
              </tr>
            </thead>
            <tbody>
              {AT_RISK.map((m) => (
                <tr key={m.name} className="border-t border-ink-800">
                  <td className="py-1.5">{m.name}</td>
                  <td>
                    <span className={m.risk >= 0.75 ? 'text-clay' : m.risk >= 0.6 ? 'text-court' : 'text-ink-200'}>
                      {(m.risk * 100).toFixed(0)}
                    </span>
                  </td>
                  <td className="text-ink-400">{m.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    />
  );
}
