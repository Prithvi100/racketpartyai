import InsightPage from './InsightPage';

export default function Churn() {
  return (
    <InsightPage
      title="Churn prediction"
      subtitle="Per-club model on attendance, lessons, leagues, and check-ins. Surface the at-risk list and suggest save plays."
      kind="churn"
      context={{
        status: 'member attendance and payment event tables are not connected',
        required_data: ['member roster', 'check-ins', 'bookings by member', 'membership payments'],
      }}
      preface={
        <div className="card p-5">
          <div className="font-semibold">Churn model not connected</div>
          <p className="text-sm text-ink-400 mt-2">
            Connect member roster, check-ins, bookings by member, and membership payment events before producing risk scores.
          </p>
        </div>
      }
    />
  );
}
