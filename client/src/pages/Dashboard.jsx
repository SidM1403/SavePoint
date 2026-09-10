import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import StatCard from '../components/StatCard';

export default function Dashboard() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('http://localhost:5005/api/dashboard');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    if (authLoading) return <div className="container" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (loading) return <div className="container" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;
    if (!data) return <div className="container" style={{ padding: '60px 24px', textAlign: 'center', color: '#ef4444' }}>Failed to load dashboard</div>;

    const { stats, topGenres, recentGames } = data;

    return (
        <div className="container" style={{ padding: '40px 24px' }}>
            <div style={{ marginBottom: '40px', background: 'var(--bg-glass)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'var(--accent-glow)', filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Welcome back, <span style={{ color: 'var(--accent-primary)' }}>{user.username}</span>!</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Here is an overview of your gaming library.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <StatCard title="Total Tracked" value={stats.totalTracked} color="#a1a1aa" />
                <StatCard title="Completed" value={stats.completed} color="#10b981" />
                <StatCard title="Playing" value={stats.playing} color="#3b82f6" />
                <StatCard title="Avg Rating" value={stats.avgRating || '-'} color="#f59e0b" />
            </div>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <div className="glass-panel" style={{ flex: '1 1 300px', padding: '32px' }}>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--accent-primary)' }}>■</span> Top Genres
                    </h3>
                    {topGenres.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)' }}>Not enough data.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {topGenres.map((g, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{g.genre}</span>
                                    <span style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>{g.count} games</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-panel" style={{ flex: '1 1 300px', padding: '32px' }}>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#3b82f6' }}>■</span> Quick Links
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Link to="/search" className="btn-primary" style={{ padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>Find a Game</Link>
                        <Link to="/recommend" className="btn-outline" style={{ padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)', borderColor: 'var(--accent-primary)' }}>Get AI Recommendations</Link>
                        <Link to="/library" className="btn-outline" style={{ padding: '16px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>View Full Library</Link>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#10b981' }}>■</span> Recently Added
                </h3>
                {recentGames.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)' }}>Your library is empty.</div>
                ) : (
                    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
                        {recentGames.map(game => (
                            <Link key={game.tracking_id} to={`/game/${game.rawg_id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                                <div style={{ 
                                    width: '180px', 
                                    background: 'var(--bg-tertiary)', 
                                    borderRadius: 'var(--radius-md)', 
                                    overflow: 'hidden', 
                                    border: '1px solid var(--border-highlight)',
                                    transition: 'transform 0.2s'
                                }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                    <img src={game.cover_url} alt={game.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                                    <div style={{ padding: '12px' }}>
                                        <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>{game.title}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', textTransform: 'capitalize' }}>{game.status.replace('_', ' ')}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
