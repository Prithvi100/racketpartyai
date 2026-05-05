import { useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Markdown from '../../components/Markdown';
import { generateLessonNotes, type LessonNotes } from '../../lib/ai';
import { Mic, Square, Sparkles, Copy, Send, RefreshCw } from 'lucide-react';

export default function LessonNew() {
  const [transcript, setTranscript] = useState('');
  const [studentName, setStudentName] = useState('Maya Patel');
  const [studentLevel, setStudentLevel] = useState('Intermediate');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState<LessonNotes | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const recogRef = useRef<any>(null);
  const tickRef = useRef<number | null>(null);

  // Web Speech API for live dictation; falls back to manual paste.
  function startRecording() {
    setErr(null);
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setErr('Browser speech recognition not available — type or paste your recap below.');
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    let final = transcript ? transcript + ' ' : '';
    rec.onresult = (ev: any) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) final += r[0].transcript + ' ';
        else interim += r[0].transcript;
      }
      setTranscript((final + interim).trim());
    };
    rec.onerror = (e: any) => setErr(`Speech error: ${e.error}`);
    rec.onend = () => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
      setRecording(false);
    };
    rec.start();
    recogRef.current = rec;
    setRecording(true);
    setSeconds(0);
    tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stopRecording() {
    recogRef.current?.stop();
  }

  useEffect(() => () => recogRef.current?.stop(), []);

  async function generate() {
    setBusy(true);
    setErr(null);
    setNotes(null);
    try {
      const out = await generateLessonNotes({
        transcript,
        student_name: studentName,
        student_level: studentLevel,
      });
      setNotes(out);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      <PageHeader
        title="New lesson note"
        subtitle="Talk for 30 seconds. AI gives you structured notes, a parent update, and tomorrow's plan."
      />
      <div className="px-8 py-6 grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card p-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Student</label>
                <input className="input" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
              </div>
              <div>
                <label className="label">Level</label>
                <select className="input" value={studentLevel} onChange={(e) => setStudentLevel(e.target.value)}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`size-16 rounded-full flex items-center justify-center transition ${
                  recording ? 'bg-clay text-white mic-pulse' : 'bg-court text-ink-900 hover:bg-court-dark'
                }`}
                aria-label={recording ? 'Stop' : 'Record'}
              >
                {recording ? <Square className="size-6" fill="currentColor" /> : <Mic className="size-6" />}
              </button>
              <div>
                <div className="font-medium">{recording ? 'Listening…' : 'Tap to record'}</div>
                <div className="text-sm text-ink-400 font-mono">{fmtTime(seconds)}</div>
              </div>
              <div className="ml-auto text-xs text-ink-500">Web Speech API · stays on device</div>
            </div>

            <div className="mt-5">
              <label className="label">Transcript (edit freely)</label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={8}
                placeholder="Worked on Maya's topspin forehand today. She's getting the brush but her contact point is still late on the high ball. Got into a 12-ball rally late in the lesson. Footwork is the next thing to drill — she's loading the wrong foot on the wide ball…"
                className="input font-mono text-sm"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={generate}
                disabled={busy || !transcript.trim()}
                className="btn-primary"
              >
                <Sparkles className="size-4" />
                {busy ? 'Generating…' : 'Generate notes'}
              </button>
              {notes && (
                <button onClick={generate} className="btn-outline">
                  <RefreshCw className="size-4" /> Regenerate
                </button>
              )}
            </div>
            {err && <div className="mt-3 text-sm text-red-400">{err}</div>}
          </div>

          <SampleHints onPick={(t) => setTranscript(t)} />
        </div>

        <div className="space-y-4">
          {!notes && !busy && (
            <div className="card p-8 text-center">
              <Sparkles className="size-8 mx-auto text-court" />
              <div className="mt-3 font-medium">Your structured notes will appear here</div>
              <p className="text-sm text-ink-400 mt-1 max-w-sm mx-auto">
                One coach recording produces three artifacts: notes for you, an update for the parent,
                and a draft plan for the next session.
              </p>
            </div>
          )}
          {busy && (
            <div className="card p-8">
              <div className="dot-pulse"><span /><span /><span /></div>
              <div className="text-sm text-ink-400 mt-3">Listening to your recap…</div>
            </div>
          )}
          {notes && (
            <>
              <NotePanel
                title="Coach notes"
                body={notes.summary}
                tags={notes.technique_tags}
                onCopy={() => copy(notes.summary)}
              />
              <NotePanel
                title="Parent update"
                body={notes.parent_update}
                onCopy={() => copy(notes.parent_update)}
                action={
                  <button className="btn-primary text-xs !py-1.5">
                    <Send className="size-3.5" /> Send to parent
                  </button>
                }
              />
              <NotePanel
                title="Next session plan"
                body={notes.next_plan}
                onCopy={() => copy(notes.next_plan)}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function NotePanel({
  title,
  body,
  tags,
  onCopy,
  action,
}: {
  title: string;
  body: string;
  tags?: string[];
  onCopy: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {action}
          <button onClick={onCopy} className="btn-ghost text-xs !py-1.5">
            <Copy className="size-3.5" /> Copy
          </button>
        </div>
      </div>
      <Markdown text={body} className="mt-3 text-sm" />
      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="pill">#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const SAMPLES = [
  "Maya's topspin forehand really clicked today. She's brushing up consistently but her contact point is late on the high ball. We got into a 12-ball cross-court rally late in the lesson — that was the breakthrough moment. Footwork on the wide ball is what we drill next, she's loading the wrong foot.",
  'Worked with Diego on serves for 30 minutes. We hit targets — he loved that. Toss is still inconsistent, drifts to the left. Live points went well, he won 4 of 7. Confidence is way up. Next time more serve targets and a return drill.',
  'Sofia practiced her backhand slice for 20 mins, then approach shots. Slice is staying low which is great. On the approach shot she keeps drifting to the middle of the court instead of recovering to the open side. Volleys at the end were sharp.',
];

function SampleHints({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-ink-300 font-medium mb-2">Try a sample recap</div>
      <div className="space-y-2">
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            onClick={() => onPick(s)}
            className="text-left text-sm text-ink-300 hover:text-ink-50 px-3 py-2 rounded-lg border border-ink-700 hover:border-ink-500 w-full"
          >
            {s.slice(0, 120)}…
          </button>
        ))}
      </div>
    </div>
  );
}
