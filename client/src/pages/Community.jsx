import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Community() {
    const { user, token } = useContext(AuthContext);
    const [feed, setFeed] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && token) {
            fetchFeed();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const fetchFeed = async () => {
        try {
            const res = await axios.get('http://localhost:5005/api/users/feed/activity', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeed(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        try {
            const res = await axios.get(`http://localhost:5005/api/users/search/all?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFollow = async (userId) => {
        try {
            await axios.post(`http://localhost:5005/api/users/${userId}/follow`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Simple UX: just alert or change button state. For now we just alert.
            alert('Followed user!');
        } catch (err) {
            console.error(err);
            alert('Failed to follow');
        }
    };

    if (!user) {
        return (
            <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>Community</h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'Space Mono' }}>Log in to see your friends' activity and discover new users.</p>
                <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>Log In</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 24px', maxWidth: '1200px' }}>
            <h1 style={{ fontSize: '4.5rem', marginBottom: '40px', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>Community</h1>

            <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
                {/* Left Side: Feed */}
                <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>Friends Activity</h2>
                    
                    {loading ? (
                        <p style={{ fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>Loading feed...</p>
                    ) : feed.length === 0 ? (
                        <div className="scrapbook-panel" style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>Your feed is empty. Search for users to follow on the right!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {feed.map((act, idx) => (
                                <div key={idx} className="scrapbook-panel" style={{ padding: '24px', display: 'flex', gap: '20px' }}>
                                    <img src={act.game_cover} alt={act.game_title} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-subtle)' }} />
                                    <div>
                                        <p style={{ fontSize: '1.1rem', margin: '0 0 10px 0', fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>
                                            <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{act.username}</span>
                                            {act.rating ? ` rated ` : act.status === 'playing' ? ` is playing ` : ` added `}
                                            <Link to={`/game/${act.game_id}`} style={{ color: 'var(--text-primary)', fontWeight: 'bold', textDecoration: 'none' }}>{act.game_title}</Link>
                                            {act.rating && <span style={{ color: '#fbbf24', marginLeft: '8px' }}>★ {act.rating}/10</span>}
                                        </p>
                                        {act.review && (
                                            <p style={{ margin: 0, fontFamily: 'Caveat', fontSize: '1.4rem', color: 'var(--text-primary)', borderLeft: '3px solid var(--accent-primary)', paddingLeft: '16px' }}>
                                                "{act.review}"
                                            </p>
                                        )}
                                        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
                                            {new Date(act.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Search Users */}
                <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
                    <div className="scrapbook-panel" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '20px', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>Find Users</h2>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by username..."
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'transparent',
                                    border: '2px solid var(--border-subtle)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px',
                                    fontFamily: 'Space Mono',
                                    outline: 'none'
                                }}
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '1rem' }}>Search</button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {searchResults.map(u => (
                                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px dashed var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono' }}>
                                            {u.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ fontFamily: 'Space Mono', color: 'var(--text-primary)', fontWeight: 'bold' }}>{u.username}</span>
                                    </div>
                                    {u.id !== user.id && (
                                        <button 
                                            onClick={() => handleFollow(u.id)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--accent-primary)',
                                                color: 'var(--accent-primary)',
                                                padding: '4px 12px',
                                                borderRadius: '4px',
                                                fontFamily: 'Space Mono',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Follow
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
