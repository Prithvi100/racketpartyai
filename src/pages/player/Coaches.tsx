import PageHeader from '../../components/PageHeader';
import { Star, MapPin, BadgeCheck } from 'lucide-react';

interface Coach {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  rate: number;
  specialties: string[];
  verified: boolean;
  outcomes: string;
}

const COACHES: Coach[] = [
  { id: '1', name: 'Coach Avery', city: 'Austin, TX', rating: 4.95, reviews: 87, rate: 80, specialties: ['Pickleball 3.0–4.0', 'Junior development'], verified: true, outcomes: '12 of last 14 students improved DUPR by ≥0.4 in 12 wks' },
  { id: '2', name: 'Coach Park', city: 'Austin, TX', rating: 4.88, reviews: 142, rate: 95, specialties: ['Tennis high school prep', 'Topspin'], verified: true, outcomes: 'Coached 4 state-ranked juniors in 2025' },
  { id: '3', name: 'Coach Sims', city: 'Round Rock, TX', rating: 4.82, reviews: 56, rate: 70, specialties: ['Beginner pickleball', 'Adult 50+'], verified: false, outcomes: 'New to RacketParty — 2 verified outcomes so far' },
  { id: '4', name: 'Coach Reyes', city: 'Austin, TX', rating: 4.97, reviews: 211, rate: 110, specialties: ['Padel', 'Tennis 4.5+'], verified: true, outcomes: 'Top 1% in player progression score' },
];

export default function Coaches() {
  return (
    <>
      <PageHeader
        title="Find a coach"
        subtitle="Verified outcomes, not just star ratings."
      />
      <div className="px-8 py-6 grid md:grid-cols-2 gap-4">
        {COACHES.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-full bg-ink-700/60 border border-ink-600 flex items-center justify-center font-medium">
                {c.name.split(' ').slice(-1)[0][0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{c.name}</span>
                  {c.verified && <BadgeCheck className="size-4 text-court" />}
                </div>
                <div className="text-sm text-ink-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3.5" /> {c.city}
                </div>
                <div className="flex items-center gap-1 text-sm mt-1">
                  <Star className="size-3.5 text-court fill-court" />
                  <span>{c.rating}</span>
                  <span className="text-ink-500">· {c.reviews} reviews</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold">${c.rate}<span className="text-sm text-ink-400">/hr</span></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {c.specialties.map((s) => (
                <span key={s} className="pill">{s}</span>
              ))}
            </div>
            <p className="text-sm text-court mt-3 italic">{c.outcomes}</p>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary text-sm">Book a lesson</button>
              <button className="btn-ghost text-sm">View profile</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
