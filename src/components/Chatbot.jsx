import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const BOT_API = 'https://farmtofork-backend-2.onrender.com/api/chatbot';

const QUICK_ACTIONS = [
  { label: '💰 Check Prices',  text: 'market price' },
  { label: '🌾 Sell Product',  text: 'sell product' },
  { label: '📦 Track Order',   text: 'track order' }
];

const Chatbot = () => {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hey! 👋 I'm FarmBot. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (inputText) => {
    const message = (inputText || userInput).trim();
    if (!message) return;

    // Add user message immediately
    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    setUserInput('');
    setLoading(true);

    try {
      const res = await fetch(BOT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      const reply = data.reply || data.message || "Sorry, I couldn't get a response 😊";

      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (error) {
      console.error('FarmBot error:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: '⚠️ Something went wrong. Please try again.'
      }]);
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
            <button className="farmbot-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="farmbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`fb-msg ${msg.sender}`}>{msg.text}</div>
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
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKey}
              aria-label="Chat input"
            />
            <button onClick={() => sendMessage()} aria-label="Send">➤</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
