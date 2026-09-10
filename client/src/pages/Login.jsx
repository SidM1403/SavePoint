import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5005/api/auth/login', { email, password });
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 150px)', position: 'relative' }}>
            {/* Background glow effects */}
            <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'rgba(124, 58, 237, 0.2)', filter: 'blur(100px)', borderRadius: '50%', zIndex: -1 }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(100px)', borderRadius: '50%', zIndex: -1 }}></div>
            
            <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter your details to access your collection.</p>
                </div>
                
                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            style={{ 
                                padding: '14px', 
                                background: 'rgba(0,0,0,0.2)', 
                                border: '1px solid var(--border-highlight)', 
                                color: '#fff', 
                                borderRadius: 'var(--radius-sm)',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-highlight)'; e.target.style.boxShadow = 'none'; }}
                            required
                        />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            style={{ 
                                padding: '14px', 
                                background: 'rgba(0,0,0,0.2)', 
                                border: '1px solid var(--border-highlight)', 
                                color: '#fff', 
                                borderRadius: 'var(--radius-sm)',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-highlight)'; e.target.style.boxShadow = 'none'; }}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', marginTop: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#fff', fontWeight: '600', textDecoration: 'underline', textUnderlineOffset: '4px' }}>Sign up</Link>
                </div>
            </div>
        </div>
    );
}
