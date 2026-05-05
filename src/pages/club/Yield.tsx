import InsightPage from './InsightPage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const HEAT = [
  { hour: '7a', util: 22, price: 18 },
  { hour: '9a', util: 64, price: 26 },
  { hour: '11a', util: 41, price: 22 },
  { hour: '1p', util: 28, price: 18 },
  { hour: '3p', util: 35, price: 20 },
  { hour: '5p', util: 78, price: 30 },
  { hour: '7p', util: 96, price: 32 },
  { hour: '9p', util: 52, price: 24 },
];

export default function Yield() {
  return (
    <InsightPage
      title="Yield management"
      subtitle="Demand forecasting + dynamic pricing for court-hours. Like RevPAR, but for racquet courts."
      kind="yield"
      context={{
        facility: 'Pickleball Kingdom — Austin Domain',
        courts: 14,
        booking_system: 'CourtReserve',
        last_14d_avg_utilization: 0.71,
        slots: HEAT,
        external_factors: { weather_avg: 'mild', local_competitor_promotions: 1 },
      }}
      preface={
        <div className="card p-5">
          <div className="font-semibold">Today by hour</div>
          <div className="text-xs text-ink-400 mb-3">Util % vs current price</div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={HEAT}>
                <CartesianGrid stroke="#2a2c37" strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="#7a7c89" fontSize={11} />
                <YAxis stroke="#7a7c89" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a1c25', border: '1px solid #2a2c37', borderRadius: 8 }} />
                <Bar dataKey="util" fill="#c4ff3e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-sm mt-2">
            <thead className="text-xs text-ink-400">
              <tr><th className="text-left">Hour</th><th className="text-left">Util</th><th className="text-left">Price</th></tr>
            </thead>
            <tbody>
              {HEAT.map((h) => (
                <tr key={h.hour} className="border-t border-ink-800">
                  <td className="py-1.5">{h.hour}</td>
                  <td className={h.util > 85 ? 'text-court' : h.util < 35 ? 'text-clay' : 'text-ink-200'}>{h.util}%</td>
                  <td>${h.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    />
  );
}
