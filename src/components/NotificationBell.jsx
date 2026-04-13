import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markAllRead, markOneRead } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import './NotificationBell.css';

const POLL_INTERVAL = 30000; // poll every 30 seconds

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen]           = useState(false);
  const [notes, setNotes]         = useState([]);
  const [unread, setUnread]       = useState(0);
  const [loading, setLoading]     = useState(false);
  const dropdownRef               = useRef(null);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { count } = await getUnreadCount();
      setUnread(count);
    } catch { /* silent */ }
  }, [isAuthenticated]);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotes(data);
      setUnread(data.filter(n => !n.read).length);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  // Poll unread count every 30s
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (!open) fetchAll();
    setOpen(o => !o);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotes(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const handleClickNote = async (note) => {
    if (!note.read) {
      await markOneRead(note._id);
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (note.orderId) {
      // Farmers go to farmer orders, customers go to my-orders
      navigate('/my-orders');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="nb-wrap" ref={dropdownRef}>
      <button className="nb-btn" onClick={handleOpen} aria-label="Notifications">
        🔔
        {unread > 0 && (
          <span className="nb-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="nb-dropdown">
          <div className="nb-header">
            <span>Notifications</span>
            {unread > 0 && (
              <button className="nb-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="nb-list">
            {loading && <div className="nb-empty">Loading...</div>}
            {!loading && notes.length === 0 && (
              <div className="nb-empty">No notifications yet</div>
            )}
            {!loading && notes.map(note => (
              <div
                key={note._id}
                className={`nb-item${note.read ? '' : ' nb-unread'}`}
                onClick={() => handleClickNote(note)}
              >
                <div className="nb-item-dot" />
                <div className="nb-item-body">
                  <div className="nb-item-title">{note.title}</div>
                  <div className="nb-item-msg">{note.message}</div>
                  <div className="nb-item-time">{timeAgo(note.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
