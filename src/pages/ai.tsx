import Head from 'next/head';
import { useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, BrainCircuit, Database, FileUp, Loader2, MessageSquare, Send } from 'lucide-react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/components/AuthProvider';
import { AgentAnswer, genai } from '@/lib/trading';

type Tab = 'ask' | 'upload' | 'prompt';

const EXAMPLES = [
  'Which underlyings made or lost the most realized P&L in the last 7 days, and what were the top close reasons?',
  'What news did the pipeline record about Sandisk this month and how was it graded?',
  'How many positions in the weekly shadow book breached, by strategy?',
  'List the index events recorded and their effective dates.',
];

// Traders get the trading chat ("Ask the book"); file analysis and the direct
// prompt stay admin-only, as the API enforces (/api/genai/agent/ask is the
// only GENAI route open to trader).
const TABS = [['ask', 'Ask the book', Database, false], ['upload', 'Analyze a file', FileUp, true], ['prompt', 'Direct prompt', MessageSquare, true]] as const;

function Lab() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [tab, setTab] = useState<Tab>('ask');
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [answer, setAnswer] = useState<AgentAnswer | { content: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    if (!query.trim()) return;
    setBusy(true); setErr(null); setAnswer(null);
    try {
      if (tab === 'ask') setAnswer(await genai.ask(query));
      else if (tab === 'upload') {
        if (!files.length) throw new Error('Choose at least one CSV or PDF.');
        setAnswer(await genai.upload(files, query));
      } else setAnswer(await genai.llm(query));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'request failed');
    } finally {
      setBusy(false);
    }
  };

  const text = answer ? ('final_answer' in answer ? answer.final_answer : answer.content) : '';
  const agent = answer && 'agents_used' in answer ? answer : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-indigo-300 text-sm mb-2"><BrainCircuit className="w-4 h-4" /> AI lab · Gemini</div>
        <h1 className="text-3xl font-bold text-white">Ask the trading book</h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          A multi-agent supervisor. Questions with no upload go to the trading-database agent, which writes one guarded read-only SQL query over the positions, history, news verdicts and shadow books, searches the news vectors when the question is about news, and shows you the SQL it ran.
        </p>
      </div>

      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit mb-4">
        {TABS.filter(([, , , adminOnly]) => isAdmin || !adminOnly).map(([k, label, Icon]) => (
          <button key={k} onClick={() => { setTab(k); setAnswer(null); }} className={clsx('inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md', tab === k ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white')}><Icon className="w-4 h-4" />{label}</button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        {tab === 'upload' && (
          <input type="file" multiple accept=".csv,.pdf" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} className="block mb-3 text-sm text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white" />
        )}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void run(); }}
          rows={3}
          placeholder={tab === 'ask' ? 'e.g. What was the realized P&L by underlying this week?' : tab === 'upload' ? 'What should the agent do with the file?' : 'Any prompt for the model'}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm outline-none focus:border-indigo-500"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-2">
            {tab === 'ask' && EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => setQuery(ex)} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white truncate max-w-xs" title={ex}>{ex.slice(0, 48)}…</button>
            ))}
          </div>
          <button onClick={() => void run()} disabled={busy || !query.trim()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Run
          </button>
        </div>
      </div>

      {err && <div className="mt-4 flex items-center gap-2 bg-rose-950/40 border border-rose-800/50 text-rose-200 rounded-xl px-4 py-3 text-sm"><AlertTriangle className="w-4 h-4" /> {err}</div>}

      {answer && (
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 text-xs text-slate-500 flex gap-3">
            {agent ? <span>agents: {agent.agents_used.join(', ') || 'none'}</span> : <span>direct model call</span>}
          </div>
          <div className="px-5 py-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{text}</div>
          {agent?.db_sql && (
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60">
              <div className="text-xs text-slate-500 mb-1">SQL the agent ran (read-only, guarded)</div>
              <pre className="text-xs text-indigo-200 whitespace-pre-wrap font-mono">{agent.db_sql}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIPage() {
  return (
    <>
      <Head><title>AI lab — Data AI Systems</title></Head>
    <RequireAuth roles={['admin', 'trader']}>
      <Lab />
    </RequireAuth>
    </>
  );
}
