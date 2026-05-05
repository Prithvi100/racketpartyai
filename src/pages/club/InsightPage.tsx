import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Markdown from '../../components/Markdown';
import { clubInsight } from '../../lib/ai';
import { Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  kind: 'yield' | 'churn' | 'mix' | 'conversion';
  context: unknown;
  preface: React.ReactNode;
}

export default function InsightPage({ title, subtitle, kind, context, preface }: Props) {
  const [analysis, setAnalysis] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    try {
      const res = await clubInsight({ kind, context });
      setAnalysis(res.analysis);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <button onClick={run} disabled={busy} className="btn-outline">
            <RefreshCw className={`size-4 ${busy ? 'animate-spin' : ''}`} /> Re-run
          </button>
        }
      />
      <div className="px-8 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">{preface}</div>
        <div className="lg:col-span-2">
          <div className="card p-6 min-h-[300px]">
            <div className="flex items-center gap-2 text-court mb-4">
              <Sparkles className="size-4" />
              <span className="text-sm font-medium">AI analysis</span>
            </div>
            {busy && (
              <div className="dot-pulse">
                <span /> <span /> <span />
              </div>
            )}
            {err && <div className="text-sm text-red-400">{err}</div>}
            {!busy && analysis && <Markdown text={analysis} />}
          </div>
        </div>
      </div>
    </>
  );
}
