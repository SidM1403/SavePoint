import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import GameSlider from '../components/GameSlider';

export default function GameDetail() {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Library state
    const [libraryEntry, setLibraryEntry] = useState(null);
    const [adding, setAdding] = useState(false);
    
    // Lists state
    const [myLists, setMyLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [addingToList, setAddingToList] = useState(false);
    
    // Community Reviews state
    const [communityReviews, setCommunityReviews] = useState([]);

    useEffect(() => {
        const fetchGameAndLibrary = async () => {
            try {
                const gameRes = await axios.get(`https://savepoint-jd2r.onrender.com/api/games/${id}`);
                setGame(gameRes.data);
                
                const reviewsRes = await axios.get(`https://savepoint-jd2r.onrender.com/api/games/${id}/reviews`);
                setCommunityReviews(reviewsRes.data);

                if (user && token) {
                    const libRes = await axios.get('https://savepoint-jd2r.onrender.com/api/library', { headers: { Authorization: `Bearer ${token}` } });
                    const entry = libRes.data.find(e => e.rawg_id.toString() === id);
                    if (entry) setLibraryEntry(entry);

                    const listsRes = await axios.get('https://savepoint-jd2r.onrender.com/api/lists/my-lists', { headers: { Authorization: `Bearer ${token}` } });
                    setMyLists(listsRes.data);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load game details');
            } finally {
                setLoading(false);
            }
        };
        fetchGameAndLibrary();
    }, [id, user]);

    const handleAddToLibrary = async (status) => {
        setAdding(true);
        try {
            const res = await axios.post('https://savepoint-jd2r.onrender.com/api/library', { rawg_id: parseInt(id), status }, { headers: { Authorization: `Bearer ${token}` } });
            setLibraryEntry({ tracking_id: res.data.id, status: res.data.status, rating: null, review: null });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to library');
        } finally {
            setAdding(false);
        }
    };

    const handleAddToList = async () => {
        if (!selectedList) return;
        setAddingToList(true);
        try {
            await axios.post(`https://savepoint-jd2r.onrender.com/api/lists/${selectedList}/games`, { game_id: game.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Game added to list!');
            setSelectedList('');
        } catch (err) {
            console.error(err);
            alert('Failed to add to list');
        } finally {
            setAddingToList(false);
        }
    };

    const handleReviewSaved = (updatedData) => {
        setLibraryEntry(prev => ({ ...prev, rating: updatedData.rating, review: updatedData.review }));
    };

    if (loading) return <div className="container" style={{ padding: '100px 24px', textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading game data...</div>;
    if (error || !game) return <div className="container" style={{ padding: '100px 24px', textAlign: 'center', color: '#ef4444' }}>{error || 'Game not found'}</div>;

    const myReview = communityReviews.find(r => r.username === user?.username);
    const otherReviews = communityReviews.filter(r => r.username !== user?.username);

    // Use background_url for hero banner
    const heroBgUrl = game.background_url || (game.cover_url ? game.cover_url.replace('t_cover_big', 't_1080p') : '');

    return (
        <div style={{ width: '100%' }}>
            {/* Hero Banner Area */}
            <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '500px', 
                overflow: 'hidden',
                background: 'var(--bg-primary)'
            }}>
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundImage: `url(${heroBgUrl})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center 25%'
                }}></div>
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: 'linear-gradient(to bottom, transparent 0%, var(--bg-primary) 100%)' 
                }}></div>
                
                {/* Content over hero banner */}
                <div className="container" style={{ position: 'absolute', bottom: '-40px', left: 0, right: 0, zIndex: 10 }}>
                    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-end' }}>
                        <img 
                            src={game.cover_url ? game.cover_url.replace('t_cover_big', 't_720p') : ''} 
                            alt={game.title} 
                            style={{ 
                                width: '220px', 
                                height: '330px', 
                                objectFit: 'cover', 
                                borderRadius: 'var(--radius-md)', 
                                boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.1)',
                                background: 'transparent'
                            }} 
                        />
                        <div style={{ paddingBottom: '50px' }}>
                            <h1 style={{ fontSize: '5rem', lineHeight: 1.1, marginBottom: '12px', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>
                                {game.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)', fontFamily: 'Space Mono', fontWeight: 'bold' }}>
                                <span>{game.release_date && game.release_date !== 'N/A' ? new Date(game.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'}) : 'TBA'}</span>
                                <span style={{ opacity: 0.5 }}>•</span>
                                <span>{game.developer}</span>
                                <span style={{ opacity: 0.5 }}>•</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {game.genres && game.genres.map(g => (
                                        <span key={g} style={{ borderBottom: '2px dotted var(--text-muted)' }}>{g}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="container" style={{ marginTop: '80px', paddingBottom: '100px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '60px' }}>
                    
                    {/* Left Column: Description & Reviews */}
                    <div>
                        {game.description && (
                            <div style={{ marginBottom: '48px' }}>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'Caveat' }}>About</h2>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.15rem', whiteSpace: 'pre-wrap', fontFamily: 'Space Mono' }}>
                                    {game.description}
                                </p>
                            </div>
                        )}
                        
                        {(game.platforms?.length > 0 || game.themes?.length > 0) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
                                {game.platforms?.length > 0 && (
                                    <div>
                                        <h3 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--text-primary)', fontFamily: 'Caveat' }}>Platforms</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {game.platforms.map(p => (
                                                <span key={p} style={{ background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '4px', fontSize: '1rem', color: 'var(--text-secondary)', fontFamily: 'Space Mono', border: '1px solid var(--border-subtle)' }}>{p}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {game.themes?.length > 0 && (
                                    <div>
                                        <h3 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--text-primary)', fontFamily: 'Caveat' }}>Themes</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {game.themes.map(t => (
                                                <span key={t} style={{ background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '4px', fontSize: '1rem', color: 'var(--text-secondary)', fontFamily: 'Space Mono', border: '1px solid var(--border-subtle)' }}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {game.trailer && (
                            <div style={{ marginBottom: '48px', width: '100%', maxWidth: '900px' }}>
                                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                                    <iframe 
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        src={`https://www.youtube.com/embed/${game.trailer}`} 
                                        title="Game Trailer" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}
                        {user && libraryEntry && (
                            <div className="scrapbook-panel" style={{ padding: '32px', marginBottom: '48px', borderLeft: '4px solid var(--accent-primary)' }}>
                                <ReviewForm 
                                    trackingId={libraryEntry.tracking_id} 
                                    initialRating={libraryEntry.rating} 
                                    initialReview={libraryEntry.review} 
                                    onSaved={handleReviewSaved} 
                                />
                            </div>
                        )}

                        <div>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Caveat' }}>
                                Community Reviews
                                <span style={{ fontSize: '1rem', background: 'var(--bg-tertiary)', padding: '2px 10px', borderRadius: '12px', color: 'var(--text-secondary)', fontFamily: 'Space Mono', border: '1px solid var(--border-subtle)' }}>{communityReviews.length}</span>
                            </h2>
                            
                            {communityReviews.length === 0 ? (
                                <div className="scrapbook-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Be the first to review this game!
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {myReview && <ReviewCard review={myReview} />}
                                    {otherReviews.map((review, i) => (
                                        <ReviewCard key={i} review={review} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {game.similar_games && game.similar_games.length > 0 && (
                            <div style={{ marginTop: '48px', position: 'relative' }}>
                                <GameSlider title="Similar Games" games={game.similar_games} />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Library Status & Stats */}
                    <div>
                        <div className="scrapbook-panel" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontFamily: 'Space Mono' }}>IGDB Rating</span>
                                <div style={{ background: '#fbbf2422', color: '#fbbf24', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Space Mono' }}>
                                    <span>★</span> {game.rawg_rating || 'N/A'}
                                </div>
                            </div>
                            
                            <hr style={{ border: 'none', borderTop: '2px dashed var(--border-subtle)', margin: '0 0 24px 0' }} />
                            
                            <h3 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'Caveat' }}>Library Status</h3>
                            
                            {!user ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '4px', textAlign: 'center', fontFamily: 'Space Mono' }}>
                                    Log in to track this game in your collection.
                                </div>
                            ) : libraryEntry ? (
                                <div>
                                    <div style={{ 
                                        background: 'var(--accent-glow)', 
                                        color: '#fff', 
                                        padding: '12px 16px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        textAlign: 'center', 
                                        fontWeight: 'bold', 
                                        marginBottom: '12px',
                                        border: '1px solid var(--accent-primary)',
                                        letterSpacing: '1px'
                                    }}>
                                        {libraryEntry.status.replace('_', ' ').toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                        Currently tracked in your library
                                    </div>
                                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                         <button disabled={adding} onClick={() => handleAddToLibrary('playing')} className="btn-outline" style={{ padding: '8px', fontSize: '0.85rem' }}>Set Playing</button>
                                         <button disabled={adding} onClick={() => handleAddToLibrary('completed')} className="btn-outline" style={{ padding: '8px', fontSize: '0.85rem' }}>Set Completed</button>
                                         <button disabled={adding} onClick={() => handleAddToLibrary('dropped')} className="btn-outline" style={{ padding: '8px', fontSize: '0.85rem', gridColumn: 'span 2' }}>Set Dropped</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button disabled={adding} onClick={() => handleAddToLibrary('playing')} className="btn-primary" style={{ background: '#2563eb', color: '#fff' }}>Currently Playing</button>
                                    <button disabled={adding} onClick={() => handleAddToLibrary('completed')} className="btn-primary" style={{ background: '#16a34a', color: '#fff' }}>Completed</button>
                                    <button disabled={adding} onClick={() => handleAddToLibrary('want_to_play')} className="btn-primary" style={{ background: '#d97706', color: '#fff' }}>Want to Play</button>
                                    <button disabled={adding} onClick={() => handleAddToLibrary('dropped')} className="btn-primary" style={{ background: '#dc2626', color: '#fff' }}>Dropped</button>
                                </div>
                            )}
                            
                            {user && myLists.length > 0 && (
                                <div style={{ marginTop: '32px', borderTop: '2px dashed var(--border-subtle)', paddingTop: '24px' }}>
                                    <h4 style={{ fontSize: '1.4rem', marginBottom: '12px', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>Add to List</h4>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select 
                                            value={selectedList} 
                                            onChange={e => setSelectedList(e.target.value)}
                                            style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'Space Mono', borderRadius: '4px', outline: 'none' }}
                                        >
                                            <option value="">Select a list...</option>
                                            {myLists.map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={handleAddToList} 
                                            disabled={addingToList || !selectedList}
                                            className="btn-primary"
                                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                        >
                                            {addingToList ? 'Adding...' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
