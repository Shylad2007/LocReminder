import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Check, Trash2, Plus, LogOut, Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const [reminders, setReminders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const { logout, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchReminders();
      startLocationTracking();
    }
  }, [user]);

  async function fetchReminders() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders`, { credentials: 'include' });
      if (res.ok) setReminders(await res.json());
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  }

  function startLocationTracking() {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.error('Location error:', err),
        { enableHighAccuracy: true }
      );
    }
  }

  function calcDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function isReminderDue(r) {
    if (r.completed) return false;
    if (r.type === 'location') {
      if (!currentLocation) return false;
      return calcDistance(currentLocation.latitude, currentLocation.longitude, r.location.latitude, r.location.longitude) <= 100;
    }
    if (r.type === 'time') return new Date() >= new Date(r.reminderTime);
    return false;
  }

  async function markComplete(id) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: true })
      });
      fetchReminders();
    } catch (err) { console.error(err); }
  }

  async function deleteReminder(id) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchReminders();
    } catch (err) { console.error(err); }
  }

  const active = reminders.filter(r => !r.completed);

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="header-brand">
          <span className="brand-name">LocReminder</span>
          <span className="brand-tagline">Remember it when you're there</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </span>
          <button className="btn-icon" onClick={logout} title="Log out" aria-label="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        {active.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Bell size={20} /></div>
            <p className="empty-title">No reminders yet</p>
            <p className="empty-sub">Create your first reminder below.</p>
          </div>
        ) : (
          <>
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Your reminders</p>
            {active.map(r => {
              const due = isReminderDue(r);
              return (
                <div key={r._id} className={`card ${due ? 'card-active' : ''}`}>
                  {due && (
                    <div className="card-due-banner">
                      {r.type === 'location' ? <MapPin size={12} /> : <Clock size={12} />}
                      {r.type === 'location' ? "You're here!" : "It's time!"}
                    </div>
                  )}

                  <p className="card-badge">
                    {r.type === 'location' ? <><MapPin size={11} /> Location</> : <><Clock size={11} /> Time</>}
                  </p>

                  <p className="card-title">{r.text}</p>

                  <p className="card-meta">
                    {r.type === 'location'
                      ? <>{r.location?.name || 'Saved location'}</>
                      : <>{new Date(r.reminderTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {new Date(r.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                    }
                  </p>

                  <div className="card-actions">
                    <button className="btn btn-success" onClick={() => markComplete(r._id)}>
                      <Check size={14} /> Done
                    </button>
                    <button
                      className="btn"
                      style={{ width: 'auto', padding: '0.5rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--border-soft)', boxShadow: '2px 2px 0 0 var(--border-soft)' }}
                      onClick={() => deleteReminder(r._id)}
                      aria-label="Delete reminder"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Floating action */}
      <div className="floating-action">
        <Link to="/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={16} /> New Reminder
        </Link>
      </div>
    </>
  );
}
