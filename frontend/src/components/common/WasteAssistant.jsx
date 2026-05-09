import { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../../services/chatService';
import useAuth from '../../hooks/useAuth';

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm **EcoBot** — your waste management assistant. I can help you with:\n- Filing & tracking complaints\n- E-waste pickup scheduling\n- Recycling & disposal tips\n- Finding drop-off centres\n\nWhat can I help you with?",
};

const SUGGESTIONS = [
  'How do I file a complaint?',
  'Schedule e-waste pickup',
  'What bin does plastic go in?',
  'How do I earn eco points?',
];

// Tiny markdown renderer — bold only (**text**)
const renderContent = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
};

// Render line breaks + bold
const MessageText = ({ content }) => (
  <span>
    {content.split('\n').map((line, i, arr) => (
      <span key={i}>
        {renderContent(line)}
        {i < arr.length - 1 && <br />}
      </span>
    ))}
  </span>
);

export default function WasteAssistant() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Don't show to unauthenticated users
  if (!isAuthenticated) return null;

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (open) {
      scrollToBottom();
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      // Only send role+content pairs to the API (exclude the welcome message's
      // formatting from history — send only real exchanges)
      const apiHistory = history
        .slice(1) // skip welcome
        .map(({ role, content }) => ({ role, content }));

      const res = await chatService.sendMessage(apiHistory);
      const botMsg = { role: 'assistant', content: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't connect right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, open]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME]);
    setInput('');
  };

  return (
    <>
      {/* Inject ping animation once */}
      <style>{`
        @keyframes wa-ping { 75%,100%{transform:scale(2);opacity:0} }
        @keyframes wa-slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wa-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .wa-msg { animation: wa-slide-up 0.22s ease both; }
        .wa-dot:nth-child(1){animation:wa-dot 1.2s ease infinite 0s}
        .wa-dot:nth-child(2){animation:wa-dot 1.2s ease infinite 0.2s}
        .wa-dot:nth-child(3){animation:wa-dot 1.2s ease infinite 0.4s}
      `}</style>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', right: '24px',
          width: '360px', maxWidth: 'calc(100vw - 48px)',
          height: '520px', maxHeight: 'calc(100vh - 120px)',
          background: 'white', borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          zIndex: 9998,
          animation: 'wa-slide-up 0.24s ease both',
          border: '1px solid #e5e7eb',
        }}>
          {/* Header */}
          <div style={{
            background: '#16a34a', padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>
                ♻
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: '14px', margin: 0, fontFamily: 'Syne, sans-serif' }}>
                  EcoBot
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#86efac', display: 'inline-block',
                  }} />
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>Online</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={handleReset} title="Reset chat" style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '8px', width: '32px', height: '32px',
                color: 'white', cursor: 'pointer', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>↺</button>
              <button onClick={() => setOpen(false)} title="Close" style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '8px', width: '32px', height: '32px',
                color: 'white', cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px',
            background: '#f9fafb',
          }}>
            {messages.map((msg, i) => (
              <div key={i} className="wa-msg" style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: '#dcfce7', border: '1.5px solid #bbf7d0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', flexShrink: 0, marginRight: '8px',
                    alignSelf: 'flex-end',
                  }}>♻</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 13px',
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#16a34a' : 'white',
                  color: msg.role === 'user' ? 'white' : '#111827',
                  fontSize: '13.5px',
                  lineHeight: '1.55',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                  border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                }}>
                  <MessageText content={msg.content} />
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="wa-msg" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: '#dcfce7', border: '1.5px solid #bbf7d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', flexShrink: 0,
                }}>♻</div>
                <div style={{
                  padding: '12px 16px', background: 'white', borderRadius: '16px 16px 16px 4px',
                  border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[1,2,3].map(n => (
                    <div key={n} className="wa-dot" style={{
                      width: '7px', height: '7px', borderRadius: '50%', background: '#9ca3af',
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — only shown when it's just the welcome message */}
          {messages.length === 1 && !loading && (
            <div style={{
              padding: '0 12px 10px', background: '#f9fafb',
              display: 'flex', flexWrap: 'wrap', gap: '6px',
            }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  background: 'white', border: '1px solid #d1fae5',
                  borderRadius: '20px', padding: '5px 11px',
                  fontSize: '12px', color: '#15803d', cursor: 'pointer',
                  fontWeight: 500, transition: 'all 0.15s',
                }}
                  onMouseEnter={e => e.target.style.background = '#f0fdf4'}
                  onMouseLeave={e => e.target.style.background = 'white'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '12px', background: 'white',
            borderTop: '1px solid #f3f4f6', flexShrink: 0,
            display: 'flex', gap: '8px', alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about waste disposal..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '12px',
                padding: '9px 12px', fontSize: '13.5px', outline: 'none',
                resize: 'none', fontFamily: 'DM Sans, sans-serif',
                color: '#111827', background: '#f9fafb',
                transition: 'border-color 0.15s',
                lineHeight: '1.4',
              }}
              onFocus={e => e.target.style.borderColor = '#16a34a'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: input.trim() && !loading ? '#16a34a' : '#e5e7eb',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                color: input.trim() && !loading ? 'white' : '#9ca3af',
                fontSize: '16px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* FAB trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Chat with EcoBot"
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '56px', height: '56px', borderRadius: '50%',
          background: open ? '#15803d' : '#16a34a',
          border: 'none', cursor: 'pointer', zIndex: 9999,
          boxShadow: '0 4px 20px rgba(22,163,74,0.4), 0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', transition: 'all 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '♻'}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <div style={{
            position: 'absolute', top: '-2px', right: '-2px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#ef4444', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', color: 'white', fontWeight: 700,
          }}>
            {unread}
          </div>
        )}

        {/* Pulse ring */}
        {!open && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: '#16a34a', opacity: 0.35,
            animation: 'wa-ping 2s cubic-bezier(0,0,0.2,1) infinite',
          }} />
        )}
      </button>
    </>
  );
}