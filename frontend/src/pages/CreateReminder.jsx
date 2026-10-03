import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft } from 'lucide-react';

export default function CreateReminder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [text, setText] = useState('');
  const [type, setType] = useState(null); // 'location' or 'time'
  
  // Location state
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationStatus, setLocationStatus] = useState(''); // '' | 'loading' | 'success' | 'error'
  
  // Time state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  function handleNextStep() {
    if (step === 1 && text.trim()) {
      setStep(2);
    } else if (step === 2 && type) {
      setStep(3);
    }
  }

  function handleTypeSelect(selectedType) {
    setType(selectedType);
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

  async function handleSave() {
    const payload = {
      text,
      type
    };

    if (type === 'location') {
      if (!latitude || !longitude || !locationName.trim()) return;
      payload.location = {
        name: locationName,
        latitude,
        longitude
      };
    } else if (type === 'time') {
      if (!date || !time) return;
      payload.reminderTime = new Date(`${date}T${time}`).toISOString();
    }

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

        {step === 3 && type === 'location' && (
          <div style={{ marginTop: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Where?
            </label>
            
            <div className="form-group">
              <label className="form-label">Name this location</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. VIT Library"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
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
        {step === 3 && type === 'location' && (
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={!locationName.trim() || locationStatus !== 'success'}
          >
            SAVE
          </button>
        )}
        {step === 3 && type === 'time' && (
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={!date || !time}
          >
            SAVE
          </button>
        )}
      </div>
    </>
  );
}
