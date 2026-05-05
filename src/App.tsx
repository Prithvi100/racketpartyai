import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CoachHome from './pages/coach/Home';
import CoachStudents from './pages/coach/Students';
import CoachLessonNew from './pages/coach/LessonNew';
import CoachDrills from './pages/coach/Drills';
import CoachSchedule from './pages/coach/Schedule';
import PlayerHome from './pages/player/Home';
import PlayerMatches from './pages/player/Matches';
import PlayerHighlights from './pages/player/Highlights';
import PlayerCoaches from './pages/player/Coaches';
import ClubHome from './pages/club/Home';
import ClubYield from './pages/club/Yield';
import ClubChurn from './pages/club/Churn';
import ClubMix from './pages/club/Mix';
import ClubConversion from './pages/club/Conversion';

function RequireRole({ allow, children }: { allow: string[]; children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <div className="p-8 text-ink-400">Loading…</div>;
  if (!profile) return <Navigate to="/login" replace />;
  if (!allow.includes(profile.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<RequireRole allow={['coach']}><Layout /></RequireRole>}>
        <Route path="/coach" element={<CoachHome />} />
        <Route path="/coach/students" element={<CoachStudents />} />
        <Route path="/coach/lessons/new" element={<CoachLessonNew />} />
        <Route path="/coach/drills" element={<CoachDrills />} />
        <Route path="/coach/schedule" element={<CoachSchedule />} />
      </Route>

      <Route element={<RequireRole allow={['player', 'parent']}><Layout /></RequireRole>}>
        <Route path="/player" element={<PlayerHome />} />
        <Route path="/player/matches" element={<PlayerMatches />} />
        <Route path="/player/highlights" element={<PlayerHighlights />} />
        <Route path="/player/coaches" element={<PlayerCoaches />} />
      </Route>

      <Route element={<RequireRole allow={['club_admin']}><Layout /></RequireRole>}>
        <Route path="/club" element={<ClubHome />} />
        <Route path="/club/yield" element={<ClubYield />} />
        <Route path="/club/churn" element={<ClubChurn />} />
        <Route path="/club/mix" element={<ClubMix />} />
        <Route path="/club/conversion" element={<ClubConversion />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
