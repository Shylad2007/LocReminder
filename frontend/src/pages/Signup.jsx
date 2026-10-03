import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!name || !email || !password) return setError('Please fill in all fields.');
        if (password.length < 6) return setError('Password must be at least 6 characters.');

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                navigate('/login');
            } else {
                setError(data.error || 'Sign up failed. Please try again.');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-header">
                <p className="auth-brand">LocReminder</p>
                <h1>Create account</h1>
                <p>Start remembering things when you're there.</p>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        className="input-field"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoComplete="name"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        className="input-field"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        className="input-field"
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                    {loading ? 'Creating account…' : 'Create account'}
                </button>
            </form>

            <div className="auth-footer">
                <span>Already have an account?</span>
                <Link to="/login">Sign in</Link>
            </div>
        </div>
    );
}
