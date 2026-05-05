import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { streamChat, type ChatMsg, type Persona } from '../lib/ai';
import Markdown from './Markdown';

interface Props {
  persona?: Persona;
  intro?: string;
  suggestions?: string[];
  compact?: boolean;
  onPersonaDetected?: (p: Persona) => void;
}

const DEFAULT_INTRO =
  "Hey — I'm RacketParty's AI. Tell me whether you coach, play, or run a club, and I'll show you the part of the product that matters to you.";

const DEFAULT_SUGGESTIONS = [
  "I'm a coach — show me the lesson-notes flow",
  "I run a 12-court club — what does yield look like?",
  "I'm a 3.5 pickleball player in Austin — find me a game",
  'How is this different from CourtReserve?',
];

export default function ChatBox({
  persona = 'visitor',
  intro = DEFAULT_INTRO,
  suggestions = DEFAULT_SUGGESTIONS,
  compact = false,
  onPersonaDetected,
}: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: intro },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, busy]);

  function detectPersona(text: string): Persona | null {
    const t = text.toLowerCase();
    if (/\bcoach|teach|lesson|drill|student\b/.test(t)) return 'coach';
    if (/\bclub|operator|facility|court[- ]?hour|yield|churn|revenue\b/.test(t)) return 'club';
    if (/\bplay|player|league|partner|pickup|find a coach|find a game\b/.test(t)) return 'player';
    return null;
  }

  async function send(text: string) {
    if (busy || !text.trim()) return;
    const next: ChatMsg[] = [...messages, { role: 'user', content: text.trim() }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);

    const detected = detectPersona(text);
    if (detected && onPersonaDetected) onPersonaDetected(detected);

    abortRef.current = new AbortController();
    try {
      let acc = '';
      await streamChat(
        next,
        detected ?? persona,
        (chunk) => {
          acc += chunk;
          setMessages((m) => {
            const copy = m.slice();
            copy[copy.length - 1] = { role: 'assistant', content: acc };
            return copy;
          });
        },
        abortRef.current.signal,
      );
    } catch (e) {
      setMessages((m) => {
        const copy = m.slice();
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `Sorry — I hit an error: ${String(e)}`,
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`card flex flex-col ${compact ? 'h-[400px]' : 'h-[560px]'} max-h-[80vh]`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-700/60">
        <div className="size-7 rounded-full bg-court/20 border border-court/40 flex items-center justify-center">
          <Sparkles className="size-4 text-court" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">RacketParty AI</div>
          <div className="text-xs text-ink-400">
            {busy ? 'Thinking…' : 'Ask anything about the product'}
          </div>
        </div>
        <span className="pill">streaming</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-court text-ink-900 px-4 py-2'
                  : 'max-w-[90%] rounded-2xl rounded-bl-sm bg-ink-700/40 border border-ink-600/40 px-4 py-3'
              }
            >
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap text-sm">{m.content}</div>
              ) : m.content ? (
                <Markdown text={m.content} className="text-sm" />
              ) : (
                <div className="dot-pulse">
                  <span /> <span /> <span />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-ink-600 text-ink-200 hover:bg-ink-700/40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex items-end gap-2 p-3 border-t border-ink-700/60"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Coach, player, or club operator? Ask away…"
          className="input resize-none min-h-[42px] max-h-32"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn-primary !rounded-full !px-3 !py-2 disabled:opacity-40"
          aria-label="Send"
        >
          <ArrowUp className="size-5" />
        </button>
      </form>
    </div>
  );
}
