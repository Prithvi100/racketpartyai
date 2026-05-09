import { supabase } from './supabase';

export interface CourtBooking {
  id: string;
  club_id: string | null;
  court_no: number | null;
  starts_at: string | null;
  duration_min: number | null;
  price: number | null;
  utilization_pct: number | null;
  surface: string | null;
  programming_type: string | null;
}

export interface RevenuePoint {
  day: string;
  revenue: number;
}

export interface UtilizationPoint {
  hour: string;
  util: number;
  price: number;
}

export interface MixPoint {
  name: string;
  value: number;
  fill: string;
}

export interface ClubMetrics {
  bookings: CourtBooking[];
  revenue: RevenuePoint[];
  utilization: UtilizationPoint[];
  mix: MixPoint[];
  totals: {
    revenue: number;
    utilization: number;
    atRiskMembers: number | null;
    revpach: number;
  };
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MIX_COLORS = ['#c4ff3e', '#d97742', '#7a7c89', '#a8a9b3', '#3c3e4b'];

export async function loadClubBookings(clubId?: string | null): Promise<CourtBooking[]> {
  if (!supabase) throw new Error('Supabase is not configured.');

  let query = supabase
    .from('court_bookings')
    .select('*')
    .order('starts_at', { ascending: true });

  if (clubId) query = query.eq('club_id', clubId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CourtBooking[];
}

export function buildClubMetrics(bookings: CourtBooking[]): ClubMetrics {
  const revenueByDay = new Map<string, number>();
  const utilizationByHour = new Map<string, { util: number; price: number; count: number }>();
  const mixByType = new Map<string, number>();

  let totalRevenue = 0;
  let utilizationSum = 0;
  let utilizationCount = 0;
  let courtHours = 0;

  for (const booking of bookings) {
    if (!booking.starts_at) continue;

    const start = new Date(booking.starts_at);
    const day = DAY_LABELS[start.getDay()];
    const hour = formatHour(start);
    const durationHours = (booking.duration_min ?? 60) / 60;
    const revenue = Number(booking.price ?? 0);
    const utilization = Number(booking.utilization_pct ?? 0);

    totalRevenue += revenue;
    courtHours += durationHours;
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + revenue);

    if (utilization > 0) {
      utilizationSum += utilization;
      utilizationCount += 1;
      const bucket = utilizationByHour.get(hour) ?? { util: 0, price: 0, count: 0 };
      bucket.util += utilization;
      bucket.price += revenue;
      bucket.count += 1;
      utilizationByHour.set(hour, bucket);
    }

    const type = normalizeType(booking.programming_type);
    mixByType.set(type, (mixByType.get(type) ?? 0) + durationHours);
  }

  const revenue = DAY_LABELS.slice(1).concat(DAY_LABELS[0]).map((day) => ({
    day,
    revenue: Math.round(revenueByDay.get(day) ?? 0),
  }));

  const utilization = Array.from(utilizationByHour.entries())
    .sort(([a], [b]) => hourSortValue(a) - hourSortValue(b))
    .map(([hour, value]) => ({
      hour,
      util: Math.round(value.util / value.count),
      price: Math.round(value.price / value.count),
    }));

  const mix = Array.from(mixByType.entries()).map(([name, value], index) => ({
    name,
    value: Math.round(value * 10) / 10,
    fill: MIX_COLORS[index % MIX_COLORS.length],
  }));

  return {
    bookings,
    revenue,
    utilization,
    mix,
    totals: {
      revenue: Math.round(totalRevenue),
      utilization: utilizationCount ? Math.round(utilizationSum / utilizationCount) : 0,
      atRiskMembers: null,
      revpach: courtHours ? Math.round((totalRevenue / courtHours) * 100) / 100 : 0,
    },
  };
}

function normalizeType(type?: string | null) {
  if (!type) return 'Unclassified';
  return type
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatHour(date: Date) {
  const hour = date.getHours();
  const suffix = hour >= 12 ? 'p' : 'a';
  const h12 = hour % 12 || 12;
  return `${h12}${suffix}`;
}

function hourSortValue(hour: string) {
  const match = /^(\d+)([ap])$/.exec(hour);
  if (!match) return 0;
  const raw = Number(match[1]) % 12;
  return raw + (match[2] === 'p' ? 12 : 0);
}
