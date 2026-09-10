import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingHero({ user, loading, bgGames }) {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      minHeight: '600px',
      display: 'flex',
      alignItems: 'flex-end',
      background: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* Background Grid of Game Covers filling entire area */}
      <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
      }}>
          {/* 4 Rows of scrolling posters, each with unique games */}
          {[0, 1, 2, 3].map(rowIndex => {
              const chunkSize = Math.ceil(bgGames.length / 4);
              const rowGames = bgGames.slice(rowIndex * chunkSize, (rowIndex + 1) * chunkSize);
              if (rowGames.length === 0) return null;
              return (
              <div key={rowIndex} className="hero-marquee-track" style={{ 
                  height: '25%',
                  animationDuration: '60s'
              }}>
                  {[...rowGames, ...rowGames, ...rowGames].map((game, i) => (
                    <div key={`${rowIndex}-${game.id}-${i}`} style={{ height: '100%', width: '110px', flexShrink: 0, padding: '1px' }}>
                        <img
                          src={game.cover_url ? game.cover_url.replace('t_cover_big', 't_720p') : ''}
                          alt={game.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '3px'
                          }}
                        />
                    </div>
                  ))}
              </div>
              );
          })}
      </div>
      
      {/* Uniform dark overlay across entire background */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1, pointerEvents: 'none' }}></div>
      {/* Bottom gradient for text area */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-primary) 5%, transparent 50%)', zIndex: 1, pointerEvents: 'none' }}></div>
      
      {/* Torn paper bottom edge */}
      <div style={{ position: 'absolute', bottom: -2, left: 0, width: '100%', height: '40px', zIndex: 2, background: 'var(--bg-primary)', clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 95% 40%, 90% 10%, 85% 50%, 80% 20%, 75% 60%, 70% 30%, 65% 70%, 60% 10%, 55% 50%, 50% 20%, 45% 60%, 40% 10%, 35% 50%, 30% 20%, 25% 60%, 20% 10%, 15% 50%, 10% 20%, 5% 60%, 0% 10%)' }}></div>
      
      <div className="container" style={{ position: 'relative', zIndex: 2, padding: '40px 24px', paddingBottom: '60px' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
              <h1 style={{ fontSize: '6.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1, textShadow: '0 4px 10px rgba(0,0,0,0.9)' }}>
                  QuestLog
              </h1>
              <div style={{ height: '6px', background: 'var(--accent-primary)', width: '80%', marginTop: '4px', borderRadius: '4px' }}></div>
          </div>
          <p style={{ fontSize: '1.8rem', color: '#e4e4e7', marginBottom: '40px', fontWeight: '500', maxWidth: '600px', fontFamily: 'Caveat', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
              Discover, collect, and analyze your games
          </p>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link to="/register" className="btn-primary" style={{ fontSize: '1.6rem', background: 'transparent', color: '#ffffff', borderColor: '#ffffff' }}>
                  Create a free account
              </Link>
              {!user && (
                <span style={{ color: '#f4f4f5', fontSize: '1.2rem', fontFamily: 'Space Mono', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                    or <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', fontWeight: 'bold' }}>log in</Link> if you have an account
                </span>
              )}
          </div>
      </div>
    </div>
  );
}
