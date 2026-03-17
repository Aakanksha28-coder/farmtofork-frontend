import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import './Chatbot.css';

const QUICK_ACTIONS = [
  { label: '💰 Check Prices', text: 'market price' },
  { label: '🌾 Sell Product', text: 'how to sell product' },
  { label: '📦 Track Order', text: 'track my order' }
];

const Chatbot = () => {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hey! 👋 I'm FarmBot. How can I help you today?" }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: "Sorry, couldn't connect. Please try again 😊" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <>
      <button
        className="farmbot-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label="Open FarmBot chat"
        title="FarmBot"
      >
        {open ? '✕' : '🌿'}
      </button>

      {open && (
        <div className="farmbot-window" role="dialog" aria-label="FarmBot chat window">
          <div className="farmbot-header">
            <div><span>🌿</span> FarmBot</div>
            <button className="farmbot-close" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>

          <div className="farmbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`fb-msg ${m.from}`}>{m.text}</div>
            ))}
            {loading && <div className="fb-msg bot">...</div>}
            <div ref={bottomRef} />
          </div>

          <div className="farmbot-quick">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} onClick={() => sendMessage(a.text)}>{a.label}</button>
            ))}
          </div>

          <div className="farmbot-input">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              aria-label="Chat input"
            />
            <button onClick={() => sendMessage()} aria-label="Send message">➤</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
