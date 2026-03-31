import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Paperclip,
  Bot,
  User,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { genaiLLM, genaiQueryUpload } from '@/lib/api';
import type { ChatMessage } from '@/types';

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I\'m your DataAI Solutions assistant. Ask me anything about our services, or upload a PDF/CSV file and I\'ll analyze it for you.',
    },
  ]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && files.length === 0) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text || 'Please analyze the uploaded file(s).',
      files: files.map((f) => f.name),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    const uploadedFiles = [...files];
    setFiles([]);

    try {
      let reply: string;
      if (uploadedFiles.length > 0) {
        const res = await genaiQueryUpload(uploadedFiles, text || 'Summarize this document.');
        reply = res.results.map((r) => r.content).join('\n\n') || 'No results found.';
      } else {
        const res = await genaiLLM(text);
        reply = res.content;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const CSV_MAX = 1 * 1024 * 1024;  // 1 MB
    const PDF_MAX = 5 * 1024 * 1024;  // 5 MB
    const selected: File[] = [];
    const errors: string[] = [];

    Array.from(e.target.files || []).forEach((f) => {
      const isCSV = f.type === 'text/csv' || f.name.endsWith('.csv');
      const isPDF = f.type === 'application/pdf';
      if (!isCSV && !isPDF) return;
      if (isCSV && f.size > CSV_MAX) {
        errors.push(`${f.name} exceeds the 1 MB CSV limit.`);
      } else if (isPDF && f.size > PDF_MAX) {
        errors.push(`${f.name} exceeds the 5 MB PDF limit.`);
      } else {
        selected.push(f);
      }
    });

    if (errors.length > 0) setError(errors.join(' '));
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-indigo-500/40 hover:scale-110 transition-all flex items-center justify-center group"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          <div className="absolute right-16 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            AI Assistant
          </div>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 flex flex-col transition-all duration-300 ${
            minimized ? 'h-14' : 'h-[560px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 rounded-t-2xl flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">DataAI Assistant</p>
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
                Online
              </p>
            </div>
            <button
              onClick={() => setMinimized(!minimized)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setOpen(false); setMinimized(false); }}
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-indigo-600'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[78%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                      }`}
                    >
                      {msg.files && msg.files.length > 0 && (
                        <div className="mb-1.5 flex flex-wrap gap-1">
                          {msg.files.map((f, fi) => (
                            <span
                              key={fi}
                              className="inline-flex items-center gap-1 bg-white/10 rounded px-1.5 py-0.5 text-xs"
                            >
                              <FileText className="w-3 h-3" />
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-xl rounded-tl-sm px-4 py-3">
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-xl px-3 py-2.5 text-sm text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* File chips */}
              {files.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {files.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 rounded-lg px-2.5 py-1 text-xs font-medium"
                    >
                      <FileText className="w-3 h-3" />
                      {f.name.length > 20 ? f.name.slice(0, 18) + '…' : f.name}
                      <button
                        onClick={() => removeFile(i)}
                        className="text-indigo-400 hover:text-red-400 transition-colors ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="px-4 py-3 border-t border-slate-700 flex-shrink-0">
                <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question or upload a file…"
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 resize-none outline-none max-h-24 py-0.5"
                    style={{ scrollbarWidth: 'none' }}
                  />
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-400 hover:text-indigo-400 transition-colors p-1"
                      title="Upload PDF or CSV"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={loading || (!input.trim() && files.length === 0)}
                      className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg flex items-center justify-center disabled:opacity-40 hover:from-indigo-500 hover:to-purple-500 transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-center text-slate-600 text-xs mt-1.5">
                  Powered by DataAI GenAI · Supports PDF & CSV
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
