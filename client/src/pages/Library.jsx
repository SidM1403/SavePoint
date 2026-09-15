import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LibraryRow from '../components/LibraryRow';
import { Navigate } from 'react-router-dom';

export default function Library() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) return;
        const fetchLibrary = async () => {
            try {
                const res = await axios.get('https://savepoint-jd2r.onrender.com/api/library');
                setLibrary(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, [user]);

    if (authLoading) return <div className="container" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    const filteredLibrary = filter === 'all' ? library : library.filter(entry => entry.status === filter);

    const handleUpdate = (updatedEntry) => {
        setLibrary(library.map(entry => entry.tracking_id === updatedEntry.id ? { ...entry, status: updatedEntry.status, rating: updatedEntry.rating } : entry));
    };

    const handleRemove = (trackingId) => {
        setLibrary(library.filter(entry => entry.tracking_id !== trackingId));
    };

    return (
        <div className="container" style={{ padding: '60px 24px' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '16px', color: '#fff' }}>My Library</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px' }}>
                Manage your gaming collection and track your progress.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {['all', 'playing', 'completed', 'want_to_play', 'dropped'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setFilter(tab)}
                        style={{ 
                            background: filter === tab ? 'var(--accent-primary)' : 'var(--bg-tertiary)', 
                            color: filter === tab ? '#fff' : 'var(--text-secondary)',
                            border: filter === tab ? '1px solid var(--accent-glow)' : '1px solid var(--border-subtle)',
                            padding: '10px 24px', 
                            borderRadius: '30px', 
                            cursor: 'pointer', 
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            boxShadow: filter === tab ? 'var(--shadow-glow)' : 'none'
                        }}
                    >
                        {tab.replace('_', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your games...</div>
            ) : filteredLibrary.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', padding: '60px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-highlight)' }}>
                    No games found in this category.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredLibrary.map(entry => (
                        <LibraryRow 
                            key={entry.tracking_id} 
                            entry={entry} 
                            onUpdate={handleUpdate}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
