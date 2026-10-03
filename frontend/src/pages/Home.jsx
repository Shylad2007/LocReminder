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
  const locationCount = active.filter(r => r.type === 'location').length;
  const timeCount = active.filter(r => r.type === 'time').length;
  const dueCount = active.filter(r => isReminderDue(r)).length;

  return (
    <>
      {/* Header */}
      <div className="header">
        <div className="header-brand">
          <span className="brand-name">LocReminder</span>
          <span className="brand-tagline">Remember it when you're there</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.6875rem', color: 'var(--ink-muted)', fontWeight: 600,
            maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {user?.name}
          </span>
          <button className="btn-icon" onClick={logout} title="Log out" aria-label="Log out">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Hero section */}
      <div className="hero">
        <p className="hero-eyebrow">◆ Active reminders</p>
        <h1 className="hero-title">
          {active.length === 0
            ? 'Nothing yet.'
            : active.length === 1
            ? '1 reminder active.'
            : `${active.length} reminders active.`}
        </h1>
        {active.length > 0 && (
          <p className="hero-sub">
            {dueCount > 0
              ? `${dueCount} ${dueCount === 1 ? 'is' : 'are'} due now — check below.`
              : 'Waiting for you to arrive or for the time.'}
          </p>
        )}
        {active.length === 0 && (
          <p className="hero-sub">Tap New Reminder to add your first one.</p>
        )}
      </div>

      {/* Stat strip — only show when there are reminders */}
      {active.length > 0 && (
        <div className="stat-strip">
          <div className="stat-item">
            <div className="stat-number">{active.length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: locationCount > 0 ? 'var(--blue)' : 'var(--ink)' }}>
              {locationCount}
            </div>
            <div className="stat-label">By location</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{timeCount}</div>
            <div className="stat-label">By time</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: dueCount > 0 ? 'var(--blue)' : 'var(--ink)' }}>
              {dueCount}
            </div>
            <div className="stat-label">Due now</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="content">
        {active.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Bell size={22} /></div>
            <p className="empty-title">No reminders yet</p>
            <p className="empty-sub">
              Create a location reminder to be notified when you arrive somewhere, or a time reminder for a specific moment.
            </p>
          </div>
        ) : (
          <>
            <p className="section-label">Your reminders</p>
            {active.map(r => {
              const due = isReminderDue(r);
              return (
                <div key={r._id} className={`card ${due ? 'card-active' : ''}`}>
                  {due && (
                    <div className="card-due-banner">
                      {r.type === 'location' ? <MapPin size={11} /> : <Clock size={11} />}
                      {r.type === 'location' ? "You're here!" : "It's time!"}
                    </div>
                  )}

                  <p className="card-badge">
                    {r.type === 'location'
                      ? <><MapPin size={10} /> Location</>
                      : <><Clock size={10} /> Time</>}
                  </p>

                  <p className="card-title">{r.text}</p>

                  <p className="card-meta">
                    {r.type === 'location'
                      ? <><MapPin size={11} color="var(--blue)" /> {r.location?.name || 'Saved location'}</>
                      : <><Clock size={11} />
                          {new Date(r.reminderTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {' · '}
                          {new Date(r.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                    }
                  </p>

                  <div className="card-actions">
                    <button className="btn btn-success" onClick={() => markComplete(r._id)}>
                      <Check size={14} /> Done
                    </button>
                    <button
                      className="btn"
                      style={{ width: 'auto', padding: '0.45rem 0.75rem', color: 'var(--danger)', borderColor: 'var(--border-soft)', boxShadow: '2px 2px 0 0 var(--border-soft)' }}
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
