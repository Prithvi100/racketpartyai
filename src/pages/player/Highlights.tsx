import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { Play, Heart, Share2, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Clip {
  id: string;
  video_url: string | null;
  thumbnail_url: string | null;
  ai_caption: string | null;
  technique_callout: string | null;
  created_at: string | null;
}

export default function Highlights() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setErr('Supabase is not configured.');
      return;
    }

    async function load() {
      const { data, error } = await supabase!
        .from('highlights')
        .select('id, video_url, thumbnail_url, ai_caption, technique_callout, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClips((data ?? []) as Clip[]);
    }

    load().catch((e: unknown) => setErr(String(e)));
  }, []);

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
        {err && <div className="card p-5 text-sm text-red-400 md:col-span-2 lg:col-span-3">{err}</div>}
        {!err && clips.length === 0 && (
          <div className="card p-5 md:col-span-2 lg:col-span-3">
            <div className="font-semibold">No highlights yet</div>
            <p className="text-sm text-ink-400 mt-1">Real highlight clips appear here after coaches publish them.</p>
          </div>
        )}
        {clips.map((c) => (
          <div key={c.id} className="card overflow-hidden group">
            <div
              className="aspect-video bg-ink-800 relative flex items-center justify-center bg-cover bg-center"
              style={c.thumbnail_url ? { backgroundImage: `url(${c.thumbnail_url})` } : undefined}
            >
              <div className="size-14 rounded-full bg-court/20 border border-court/40 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition">
                <Play className="size-6 text-court fill-court" />
              </div>
              <div className="absolute top-2 left-2 pill bg-ink-900/80">
                <Sparkles className="size-3 text-court" /> {c.technique_callout ?? 'No callout'}
              </div>
            </div>
            <div className="p-3">
              <div className="font-medium text-sm">{c.ai_caption ?? 'Untitled highlight'}</div>
              <div className="text-xs text-ink-400 mt-0.5">{c.created_at ? formatDate(c.created_at) : 'Date unavailable'}</div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <button className="btn-ghost !py-1.5"><Heart className="size-3.5" /></button>
                {c.video_url && <a className="btn-ghost !py-1.5" href={c.video_url} target="_blank" rel="noreferrer"><Share2 className="size-3.5" /> Open</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}
