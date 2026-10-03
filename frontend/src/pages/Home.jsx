import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, CheckCircle2, Trash2, Plus } from 'lucide-react';

export default function Home() {
  const [reminders, setReminders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    fetchReminders();
    startLocationTracking();
  }, []);

  async function fetchReminders() {
    try {
      const response = await fetch('http://localhost:5000/api/reminders');
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  }

  function startLocationTracking() {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );
    }
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  }

  function isReminderDue(reminder) {
    if (reminder.completed) return false;
    
    if (reminder.type === 'location') {
      if (!currentLocation) return false;
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        reminder.location.latitude,
        reminder.location.longitude
      );
      // Assuming within 100 meters is "due"
      return distance <= 100;
    } else if (reminder.type === 'time') {
      const now = new Date();
      const reminderTime = new Date(reminder.reminderTime);
      return now >= reminderTime;
    }
    
    return false;
  }

  async function markComplete(id) {
    try {
      await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
      });
      fetchReminders();
    } catch (error) {
      console.error('Error updating:', error);
    }
  }

  async function deleteReminder(id) {
    try {
      await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: 'DELETE'
      });
      fetchReminders();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

  const activeReminders = reminders.filter(r => !r.completed);

  return (
    <>
      <div className="header">
        <h1>LocReminder</h1>
        <p style={{ color: 'var(--text-muted)' }}>Things waiting for you</p>
      </div>
      
      <div className="content">
        {activeReminders.length === 0 ? (
          <div className="empty-state">
            <p>Nothing waiting.</p>
            <p>Got something to remember?</p>
          </div>
        ) : (
          activeReminders.map(reminder => {
            const due = isReminderDue(reminder);
            
            return (
              <div key={reminder._id} className="card" style={due ? { borderColor: 'var(--accent-color)', boxShadow: '0 4px 12px rgba(37,99,235,0.1)' } : {}}>
                <div className="card-header">{reminder.text}</div>
                <div className="card-body">
                  {reminder.type === 'location' ? (
                    <>
                      <MapPin size={18} />
                      <span>{reminder.location?.name || 'Saved Location'}</span>
                    </>
                  ) : (
                    <>
                      <Clock size={18} />
                      <span>
                        {new Date(reminder.reminderTime).toLocaleDateString()} · {new Date(reminder.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
                
                {due && (
                  <div style={{ marginBottom: '1rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                    {reminder.type === 'location' ? "📍 You're here!" : "🕐 It's time!"}
                  </div>
                )}
                
                <div className="card-actions">
                  <button className="btn btn-success" onClick={() => markComplete(reminder._id)}>
                    <CheckCircle2 size={20} style={{ marginRight: '8px' }} /> Done
                  </button>
                  <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => deleteReminder(reminder._id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="floating-action">
        <Link to="/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={24} style={{ marginRight: '8px' }} /> REMEMBER SOMETHING
        </Link>
      </div>
    </>
  );
}
