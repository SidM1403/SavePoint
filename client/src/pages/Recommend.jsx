import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

export default function Recommend() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [mood, setMood] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mood.trim()) return;

        setLoading(true);
        setError('');
        setSubmitted(true);
        setRecommendations([]);

        try {
            const res = await axios.post('http://localhost:5005/api/ai/recommend', { mood });
            setRecommendations(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to get recommendations. Claude API might be unavailable.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="container" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="container" style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))' }}>✨</div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>AI Game Matchmaker</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Tell the AI what you're in the mood for. It will look at your personal library 
                    to ensure it doesn't recommend games you've already played.
                </p>
            </div>

            {!submitted || error ? (
                <form className="glass-panel" onSubmit={handleSubmit} style={{ padding: '32px', position: 'relative' }}>
                    <textarea 
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        placeholder="e.g. 'I want a dark, story-heavy RPG with turn-based combat' or 'Something relaxing after a long day of work...'"
                        style={{ 
                            width: '100%', 
                            minHeight: '140px', 
                            padding: '20px', 
                            background: 'rgba(0,0,0,0.3)', 
                            color: '#fff', 
                            border: '1px solid var(--border-highlight)', 
                            borderRadius: 'var(--radius-md)', 
                            fontSize: '1.05rem', 
                            resize: 'vertical', 
                            marginBottom: '24px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            lineHeight: '1.6'
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = 'var(--shadow-glow)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border-highlight)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                        {loading ? 'Consulting the Oracle...' : 'Get Recommendations'}
                    </button>
                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>{error}</div>}
                </form>
            ) : (
                <div>
                    {loading ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--accent-primary)' }}>
                            <div style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>AI is analyzing your mood...</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Scanning thousands of games and comparing with your library.</div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Your Curated Picks</h3>
                                <button onClick={() => { setSubmitted(false); setMood(''); }} className="btn-outline" style={{ padding: '8px 20px', fontSize: '0.95rem' }}>Try Another Mood</button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {recommendations.map((rec, i) => (
                                    <div key={i} className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'var(--accent-glow)', filter: 'blur(50px)', borderRadius: '50%', zIndex: 0, opacity: 0.5 }}></div>
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                <h4 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>{rec.title}</h4>
                                                <Link to={`/search?q=${encodeURIComponent(rec.title)}`} className="btn-outline" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                                                    Search Game
                                                </Link>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                                {rec.genres && rec.genres.map(g => (
                                                    <span key={g} style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-primary)', border: '1px solid var(--border-highlight)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem' }}>{g}</span>
                                                ))}
                                            </div>
                                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
                                                    <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Why this fits: </strong>
                                                    {rec.reason}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
