import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, Mic, Trash2, Plus } from 'lucide-react';

export default function CreateReminder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [text, setText] = useState('');
  const [type, setType] = useState(null); // 'location' or 'time'
  
  // Location state
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationView, setLocationView] = useState('list'); // 'list' | 'new'
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationStatus, setLocationStatus] = useState(''); // '' | 'loading' | 'success' | 'error'
  
  // Time state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);
  const activeVoiceTarget = useRef('text'); // 'text' | 'location'

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (activeVoiceTarget.current === 'location') {
          setLocationName(currentTranscript);
        } else {
          setText(currentTranscript);
        }
      };
      
      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(rec);
    } else {
      setSpeechSupported(false);
    }
  }, []);

  function startListening(target, e) {
    if (e && e.cancelable) e.preventDefault();
    if (recognition && !isListening) {
      activeVoiceTarget.current = target;
      if (target === 'location') setLocationName('');
      else setText('');
      
      setIsListening(true);
      try {
        recognition.start();
      } catch (err) {
        // Already started
      }
    }
  }

  function stopListening(e) {
    if (e && e.cancelable) e.preventDefault();
    if (recognition && isListening) {
      setIsListening(false);
      recognition.stop();
    }
  }

  function handleNextStep() {
    if (step === 1 && text.trim()) {
      setStep(2);
    } else if (step === 2 && type) {
      setStep(3);
    }
  }

  async function fetchLocations() {
    try {
      const response = await fetch('http://localhost:5000/api/locations');
      if (response.ok) {
        const data = await response.json();
        setSavedLocations(data);
        if (data.length === 0) setLocationView('new');
        else setLocationView('list');
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleTypeSelect(selectedType) {
    setType(selectedType);
    if (selectedType === 'location') {
      fetchLocations();
    }
    setStep(3);
  }

  function getCurrentLocation() {
    setLocationStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationStatus('success');
        },
        (error) => {
          console.error(error);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('error');
    }
  }

  async function saveReminderWithLocation(name, lat, lng) {
    const payload = {
      text,
      type: 'location',
      location: { name, latitude: lat, longitude: lng }
    };
    try {
      await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      navigate('/');
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  }

  async function handleSaveNewLocation() {
    if (!latitude || !longitude || !locationName.trim()) return;
    try {
      const locRes = await fetch('http://localhost:5000/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: locationName, latitude, longitude })
      });
      if (locRes.ok) {
        saveReminderWithLocation(locationName, latitude, longitude);
      }
    } catch (error) {
      console.error('Error saving location:', error);
    }
  }

  async function handleDeleteLocation(id) {
    try {
      await fetch(`http://localhost:5000/api/locations/${id}`, {
        method: 'DELETE'
      });
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  }

  async function handleSaveTime() {
    if (!date || !time) return;
    const payload = {
      text,
      type: 'time',
      reminderTime: new Date(`${date}T${time}`).toISOString()
    };
    try {
      await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      navigate('/');
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  }

  return (
    <>
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.25rem' }}>New Reminder</h1>
      </div>

      <div className="content">
        {step === 1 && (
          <div style={{ marginTop: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              What do you need to remember?
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Return library book"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            
            {speechSupported ? (
              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  type="button"
                  onMouseDown={(e) => startListening('text', e)}
                  onMouseUp={stopListening}
                  onMouseLeave={stopListening}
                  onTouchStart={(e) => startListening('text', e)}
                  onTouchEnd={stopListening}
                  className={`btn ${isListening && activeVoiceTarget.current === 'text' ? 'btn-danger' : 'btn-primary'}`}
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    boxShadow: isListening && activeVoiceTarget.current === 'text' ? '0 0 25px rgba(239, 68, 68, 0.6)' : '0 4px 12px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s',
                    transform: isListening && activeVoiceTarget.current === 'text' ? 'scale(1.05)' : 'scale(1)',
                    touchAction: 'none'
                  }}
                >
                  <Mic size={48} color="white" />
                </button>
                <p style={{ marginTop: '1.5rem', color: isListening && activeVoiceTarget.current === 'text' ? 'var(--danger-color)' : 'var(--text-muted)', fontWeight: isListening && activeVoiceTarget.current === 'text' ? 'bold' : 'normal' }}>
                  {isListening && activeVoiceTarget.current === 'text' ? 'Listening...' : 'Press and hold to speak'}
                </p>
              </div>
            ) : (
              <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                Voice capture is unavailable in this browser.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div style={{ marginTop: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              When should LocReminder remind you?
            </label>
            <div className="choice-grid">
              <button className="choice-btn" onClick={() => handleTypeSelect('location')}>
                <MapPin size={24} /> WHEN I'M THERE
              </button>
              <button className="choice-btn" onClick={() => handleTypeSelect('time')}>
                <Clock size={24} /> AT A SPECIFIC TIME
              </button>
            </div>
          </div>
        )}

        {step === 3 && type === 'location' && locationView === 'list' && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
              <label className="form-label" style={{ fontSize: '1.5rem', margin: 0 }}>
                Where should I remember this?
              </label>
            </div>
            
            <div className="choice-grid">
              {savedLocations.map(loc => (
                <div key={loc._id} style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="choice-btn" 
                    style={{ flex: 1, justifyContent: 'flex-start' }} 
                    onClick={() => saveReminderWithLocation(loc.name, loc.latitude, loc.longitude)}
                  >
                    <MapPin size={24} /> {loc.name}
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '0 1.25rem', borderRadius: '16px' }} 
                    onClick={() => handleDeleteLocation(loc._id)}
                  >
                    <Trash2 size={20} color="var(--danger-color)" />
                  </button>
                </div>
              ))}
              
              <button className="choice-btn" style={{ borderStyle: 'dashed' }} onClick={() => setLocationView('new')}>
                <Plus size={24} /> Add new location
              </button>
            </div>
          </div>
        )}

        {step === 3 && type === 'location' && locationView === 'new' && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
              <button className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setLocationView('list')}>
                <ArrowLeft size={20} />
              </button>
              <label className="form-label" style={{ fontSize: '1.5rem', margin: 0 }}>
                New Location
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location name</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ marginBottom: 0 }}
                  placeholder="e.g. VIT Library"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
                {speechSupported && (
                  <button
                    type="button"
                    onMouseDown={(e) => startListening('location', e)}
                    onMouseUp={stopListening}
                    onMouseLeave={stopListening}
                    onTouchStart={(e) => startListening('location', e)}
                    onTouchEnd={stopListening}
                    className={`btn ${isListening && activeVoiceTarget.current === 'location' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      touchAction: 'none'
                    }}
                  >
                    <Mic size={24} color={isListening && activeVoiceTarget.current === 'location' ? 'white' : 'var(--accent-color)'} />
                  </button>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              {locationStatus === 'success' ? (
                <div style={{ padding: '1rem', background: '#d1fae5', color: '#065f46', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                  ✓ Location captured
                </div>
              ) : (
                <button 
                  className="btn btn-secondary" 
                  onClick={getCurrentLocation}
                  disabled={locationStatus === 'loading'}
                >
                  <MapPin size={20} style={{ marginRight: '8px' }} />
                  {locationStatus === 'loading' ? 'Getting location...' : 'Use my current location'}
                </button>
              )}
              {locationStatus === 'error' && (
                <div style={{ color: 'var(--danger-color)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Could not get location. Make sure permissions are granted.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && type === 'time' && (
          <div style={{ marginTop: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              When?
            </label>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input 
                type="time" 
                className="input-field" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="floating-action">
        {step === 1 && (
          <button className="btn btn-primary" onClick={handleNextStep} disabled={!text.trim()}>
            NEXT
          </button>
        )}
        {step === 3 && type === 'location' && locationView === 'new' && (
          <button 
            className="btn btn-primary" 
            onClick={handleSaveNewLocation} 
            disabled={!locationName.trim() || locationStatus !== 'success'}
          >
            SAVE LOCATION
          </button>
        )}
        {step === 3 && type === 'time' && (
          <button 
            className="btn btn-primary" 
            onClick={handleSaveTime} 
            disabled={!date || !time}
          >
            SAVE
          </button>
        )}
      </div>
    </>
  );
}
