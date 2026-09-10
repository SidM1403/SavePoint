import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GameCard from '../components/GameCard';

export default function ListDetail() {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchList();
    }, [id]);

    const fetchList = async () => {
        try {
            const res = await axios.get(`http://localhost:5005/api/lists/${id}`);
            setList(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load list. It might be private or deleted.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveGame = async (gameId) => {
        if (!confirm('Are you sure you want to remove this game from the list?')) return;
        try {
            await axios.delete(`http://localhost:5005/api/lists/${id}/games/${gameId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setList({
                ...list,
                games: list.games.filter(g => g.id !== gameId)
            });
        } catch (err) {
            console.error(err);
            alert('Failed to remove game');
        }
    };

    if (loading) {
        return <div className="container" style={{ padding: '100px 24px', textAlign: 'center', fontFamily: 'Space Mono' }}>Loading list...</div>;
    }

    if (error || !list) {
        return <div className="container" style={{ padding: '100px 24px', textAlign: 'center', fontFamily: 'Space Mono', color: 'var(--accent-primary)' }}>{error}</div>;
    }

    const isOwner = user && user.id === list.user_id;

    return (
        <div className="container" style={{ padding: '60px 24px' }}>
            <div className="scrapbook-panel" style={{ padding: '40px', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '4.5rem', margin: '0 0 16px 0', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>{list.name}</h1>
                <p style={{ fontSize: '1.2rem', fontFamily: 'Space Mono', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {list.description || 'No description.'}
                </p>
                <div style={{ marginTop: '24px', fontFamily: 'Space Mono', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '20px' }}>
                    <span>Created: {new Date(list.created_at).toLocaleDateString()}</span>
                    <span>{list.is_private ? '🔒 Private List' : '🌍 Public List'}</span>
                    <span>{list.games.length} Games</span>
                </div>
            </div>

            {list.games.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed var(--border-subtle)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '1.2rem', fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>This list is empty.</p>
                    {isOwner && (
                        <Link to="/search" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>Go Find Games</Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                    {list.games.map(game => (
                        <div key={game.entry_id} style={{ position: 'relative' }}>
                            <GameCard game={game} />
                            {isOwner && (
                                <button 
                                    onClick={() => handleRemoveGame(game.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        background: 'var(--accent-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        zIndex: 10,
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                    }}
                                    title="Remove from list"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
