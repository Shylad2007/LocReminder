import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, Mic, Trash2, Plus, MicOff } from 'lucide-react';

export default function CreateReminder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [text, setText] = useState('');
  const [type, setType] = useState(null);

  // Location state
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationView, setLocationView] = useState('list');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationStatus, setLocationStatus] = useState(''); // '' | 'loading' | 'success' | 'error'

  // Time state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);
  const voiceTarget = useRef('text');

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSpeechSupported(false); return; }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      if (voiceTarget.current === 'location') setLocationName(t);
      else setText(t);
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    setRecognition(rec);
  }, []);

  function startListening(target, e) {
    if (e?.cancelable) e.preventDefault();
    if (!recognition || isListening) return;
    voiceTarget.current = target;
    if (target === 'location') setLocationName('');
    else setText('');
    setIsListening(true);
    try { recognition.start(); } catch (_) { /* already running */ }
  }

  function stopListening(e) {
    if (e?.cancelable) e.preventDefault();
    if (!recognition || !isListening) return;
    setIsListening(false);
    recognition.stop();
  }

  function goBack() {
    if (step === 3 && type === 'location' && locationView === 'new' && savedLocations.length > 0) {
      setLocationView('list');
    } else if (step > 1) {
      setStep(s => s - 1);
    } else {
      navigate('/');
    }
  }

  async function fetchLocations() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSavedLocations(data);
        setLocationView(data.length === 0 ? 'new' : 'list');
      }
    } catch (err) { console.error(err); }
  }

  function handleTypeSelect(t) {
    setType(t);
    if (t === 'location') fetchLocations();
    setStep(3);
  }

  function getCurrentLocation() {
    setLocationStatus('loading');
    if (!('geolocation' in navigator)) { setLocationStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); setLocationStatus('success'); },
      () => setLocationStatus('error')
    );
  }

  useEffect(() => {
    if (step === 3 && type === 'location' && locationView === 'new' && locationStatus === '') {
      getCurrentLocation();
    }
  }, [step, type, locationView, locationStatus]);

  async function saveReminderWithLocation(name, lat, lng) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, type: 'location', location: { name, latitude: lat, longitude: lng } })
      });
      navigate('/');
    } catch (err) { console.error(err); }
  }

  async function handleSaveNewLocation() {
    if (!latitude || !longitude || !locationName.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: locationName, latitude, longitude })
      });
      if (res.ok) saveReminderWithLocation(locationName, latitude, longitude);
    } catch (err) { console.error(err); }
  }

  async function handleDeleteLocation(id) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/locations/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchLocations();
    } catch (err) { console.error(err); }
  }

  async function handleSaveTime() {
    if (!date || !time) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, type: 'time', reminderTime: new Date(`${date}T${time}`).toISOString() })
      });
      navigate('/');
    } catch (err) { console.error(err); }
  }

  /* ---- Step 1 progress ---- */
  const stepLabel = step === 1 ? 'What?' : step === 2 ? 'When?' : type === 'location' ? 'Where?' : 'Set time';

  return (
    <>
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button className="btn-icon" onClick={goBack} aria-label="Go back">
            <ArrowLeft size={15} />
          </button>
          <div>
            <p className="header-title">New Reminder</p>
            <p className="header-user">Step {step} of 3 — {stepLabel}</p>
          </div>
        </div>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: step >= s ? 'var(--blue)' : 'var(--border-soft)',
              border: '1.5px solid var(--border)',
              transition: 'background 0.2s'
            }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="content">

        {/* ---- STEP 1: Reminder text ---- */}
        {step === 1 && (
          <div>
            <p className="step-question">What do you need to remember?</p>

            <div className="form-group">
              <label className="form-label">Reminder</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Return library book"
                value={text}
                onChange={e => setText(e.target.value)}
                autoFocus
              />
            </div>

            {speechSupported ? (
              <div className="mic-wrap">
                <button
                  className={`mic-btn ${isListening && voiceTarget.current === 'text' ? 'listening' : ''}`}
                  onMouseDown={e => startListening('text', e)}
                  onMouseUp={stopListening}
                  onMouseLeave={stopListening}
                  onTouchStart={e => startListening('text', e)}
                  onTouchEnd={stopListening}
                  aria-label="Hold to speak reminder"
                >
                  <Mic size={26} />
                </button>
                <span className={`mic-hint ${isListening && voiceTarget.current === 'text' ? 'active' : ''}`}>
                  {isListening && voiceTarget.current === 'text' ? 'Listening…' : 'Hold to speak'}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: '1rem' }}>
                Voice input is not supported in this browser.
              </p>
            )}
          </div>
        )}

        {/* ---- STEP 2: Choose type ---- */}
        {step === 2 && (
          <div>
            <p className="step-question">When should I remind you?</p>

            <div className="choice-grid">
              <button className="choice-btn" onClick={() => handleTypeSelect('location')}>
                <span className="choice-icon"><MapPin size={16} /></span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>When I'm there</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 500 }}>Trigger by location</p>
                </div>
              </button>
              <button className="choice-btn" onClick={() => handleTypeSelect('time')}>
                <span className="choice-icon"><Clock size={16} /></span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>At a specific time</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 500 }}>Pick a date and time</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ---- STEP 3: Location list ---- */}
        {step === 3 && type === 'location' && locationView === 'list' && (
          <div>
            <p className="step-question">Where should I remind you?</p>
            <p className="section-label">Saved locations</p>

            <div>
              {savedLocations.map(loc => (
                <div key={loc._id} className="loc-card">
                  <button className="loc-btn" onClick={() => saveReminderWithLocation(loc.name, loc.latitude, loc.longitude)}>
                    <MapPin size={15} color="var(--blue)" />
                    {loc.name}
                  </button>
                  <button className="loc-delete" onClick={() => handleDeleteLocation(loc._id)} aria-label={`Delete ${loc.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button className="choice-btn dashed" style={{ marginTop: '0.25rem' }} onClick={() => setLocationView('new')}>
                <Plus size={16} /> Add new location
              </button>
            </div>
          </div>
        )}

        {/* ---- STEP 3: New location form ---- */}
        {step === 3 && type === 'location' && locationView === 'new' && (
          <div>
            <p className="step-question">New location</p>

            <div className="form-group">
              <label className="form-label">Location name</label>
              <div className="input-row">
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. VIT Library"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                />
                {speechSupported && (
                  <button
                    className={`mic-inline ${isListening && voiceTarget.current === 'location' ? 'listening' : ''}`}
                    onMouseDown={e => startListening('location', e)}
                    onMouseUp={stopListening}
                    onMouseLeave={stopListening}
                    onTouchStart={e => startListening('location', e)}
                    onTouchEnd={stopListening}
                    aria-label="Hold to speak location name"
                  >
                    <Mic size={17} />
                  </button>
                )}
              </div>
              {isListening && voiceTarget.current === 'location' && (
                <p className="text-xs" style={{ color: 'var(--blue)', marginTop: '0.35rem', fontWeight: 600 }}>Listening…</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">GPS coordinates</label>
              {locationStatus === 'success' ? (
                <div className="status-box success">✓ Location captured successfully</div>
              ) : (
                <button
                  className="btn"
                  onClick={getCurrentLocation}
                  disabled={locationStatus === 'loading'}
                  style={{ justifyContent: 'center', gap: '0.5rem' }}
                >
                  <MapPin size={15} />
                  {locationStatus === 'loading' ? 'Getting location…' : locationStatus === 'error' ? 'Retry getting location' : 'Use my current location'}
                </button>
              )}
              {locationStatus === 'error' && (
                <div className="status-box error" style={{ marginTop: '0.5rem' }}>
                  Couldn't get your location. Check location permissions and try again.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- STEP 3: Time ---- */}
        {step === 3 && type === 'time' && (
          <div>
            <p className="step-question">When exactly?</p>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                className="input-field"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>
        )}

      </div>

      {/* Bottom action */}
      <div className="floating-action">
        {step === 1 && (
          <button className="btn btn-primary" onClick={() => text.trim() && setStep(2)} disabled={!text.trim()}>
            Continue
          </button>
        )}
        {step === 3 && type === 'location' && locationView === 'new' && (
          <button
            className="btn btn-primary"
            onClick={handleSaveNewLocation}
            disabled={!locationName.trim() || locationStatus !== 'success'}
          >
            Save location &amp; reminder
          </button>
        )}
        {step === 3 && type === 'time' && (
          <button className="btn btn-primary" onClick={handleSaveTime} disabled={!date || !time}>
            Save reminder
          </button>
        )}
      </div>
    </>
  );
}
