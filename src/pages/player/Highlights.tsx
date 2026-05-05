import PageHeader from '../../components/PageHeader';
import { Play, Heart, Share2, Sparkles } from 'lucide-react';

interface Clip {
  id: string;
  title: string;
  coach: string;
  when: string;
  callout: string;
  duration: string;
}

const CLIPS: Clip[] = [
  { id: '1', title: '12-ball cross-court rally', coach: 'Coach Avery', when: '2 days ago', callout: 'Topspin forehand consistency', duration: '0:42' },
  { id: '2', title: 'First ace of the year', coach: 'Coach Avery', when: '5 days ago', callout: 'Serve placement (T)', duration: '0:18' },
  { id: '3', title: 'Dink battle won the point', coach: 'Coach Park', when: '1 week ago', callout: 'Patience at the kitchen', duration: '0:36' },
  { id: '4', title: 'Backhand winner down the line', coach: 'Coach Avery', when: '2 weeks ago', callout: 'Backhand redirect', duration: '0:28' },
];

export default function Highlights() {
  return (
    <>
      <PageHeader
        title="My highlights"
        subtitle="Auto-edited clips from your coach. AI picks the best 5 each session and writes the technique callout."
        actions={
          <span className="pill">
            <Sparkles className="size-3 text-court" /> AI-edited
          </span>
        }
      />
      <div className="px-8 py-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLIPS.map((c) => (
          <div key={c.id} className="card overflow-hidden group">
            <div className="aspect-video bg-gradient-to-br from-ink-700 to-ink-900 relative flex items-center justify-center">
              <div className="size-14 rounded-full bg-court/20 border border-court/40 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition">
                <Play className="size-6 text-court fill-court" />
              </div>
              <div className="absolute bottom-2 right-2 text-xs text-ink-200 bg-ink-900/80 px-2 py-0.5 rounded">
                {c.duration}
              </div>
              <div className="absolute top-2 left-2 pill bg-ink-900/80">
                <Sparkles className="size-3 text-court" /> {c.callout}
              </div>
            </div>
            <div className="p-3">
              <div className="font-medium text-sm">{c.title}</div>
              <div className="text-xs text-ink-400 mt-0.5">{c.coach} · {c.when}</div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <button className="btn-ghost !py-1.5"><Heart className="size-3.5" /></button>
                <button className="btn-ghost !py-1.5"><Share2 className="size-3.5" /> Share</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
