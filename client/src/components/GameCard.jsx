import React from 'react';
import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
    // Generate a slight random rotation between -2deg and 2deg to give it a scattered polaroid feel
    const randomRotation = Math.random() * 4 - 2;

    return (
        <Link 
            to={`/game/${game.id}`} 
            className="game-card-hover"
            style={{ 
                textDecoration: 'none', 
                display: 'block',
                position: 'relative',
                transform: `rotate(${randomRotation}deg)`,
                transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
        >
            <div className="polaroid-card" style={{ height: '100%' }}>
                <img 
                    src={game.cover_url} 
                    alt={game.title} 
                    style={{ 
                        width: '100%', 
                        height: '300px', 
                        objectFit: 'cover', 
                        borderRadius: 'var(--radius-sm)' 
                    }} 
                />
                
                {/* Meta details over the bottom of the image */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    padding: '40px 10px 10px 10px', 
                    background: 'linear-gradient(to top, var(--bg-tertiary) 40%, transparent 100%)' 
                }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '800', fontFamily: 'Caveat', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {game.title}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'Space Mono' }}>
                            {game.release_date && game.release_date !== 'N/A' ? new Date(game.release_date).getFullYear() : 'TBA'}
                        </div>
                        {game.rawg_rating && (
                            <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'Space Mono' }}>
                                ★ {game.rawg_rating}
                            </div>
                        )}
                    </div>

                    {game.genres && game.genres.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {game.genres.slice(0, 2).map(genre => (
                                <span key={genre} style={{ 
                                    background: 'var(--bg-secondary)', 
                                    color: 'var(--text-secondary)', 
                                    border: '1px solid var(--border-subtle)', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.7rem',
                                    fontFamily: 'Space Mono'
                                }}>
                                    {genre.name || genre} 
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
