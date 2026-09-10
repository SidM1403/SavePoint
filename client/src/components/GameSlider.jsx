import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function GameSlider({ title, games, numbered = false }) {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!games || games.length === 0) return null;

  return (
    <div style={{ marginBottom: '60px', position: 'relative', overflow: 'hidden' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: 'var(--accent-primary)' }}>■</span> {title}
      </h2>
      
      <div style={{ position: 'relative' }} className="slider-group">
        <button 
          onClick={() => scroll('left')}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: '20px',
            width: '50px',
            background: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '2rem',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s'
          }}
          className="slider-btn"
        >
          ‹
        </button>

        <div 
          ref={sliderRef}
          style={{ 
            display: 'flex', 
            gap: numbered ? '40px' : '20px', 
            overflowX: 'auto', 
            paddingBottom: '20px', 
            paddingLeft: numbered ? '40px' : '0px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
          className="no-scrollbar"
        >
          {games.map((game, index) => (
            <Link 
              key={game.id} 
              to={`/game/${game.id}`} 
              style={{ 
                textDecoration: 'none', 
                flexShrink: 0, 
                width: '220px', 
                transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                scrollSnapAlign: 'start',
                position: 'relative'
              }} 
              className="game-card-hover"
            >
              {numbered && (
                <div style={{
                  position: 'absolute',
                  left: '-40px',
                  bottom: '-20px',
                  fontSize: '8rem',
                  fontWeight: '900',
                  color: '#000',
                  WebkitTextStroke: '2px var(--text-muted)',
                  lineHeight: '1',
                  zIndex: -1,
                  fontFamily: 'Impact, sans-serif',
                  opacity: 0.5
                }}>
                  {index + 1}
                </div>
              )}
              <div 
                className="polaroid-card"
                style={{ 
                  position: 'relative', 
                  overflow: 'hidden', 
                  height: '100%',
                  transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`
                }}
              >
                <img src={game.cover_url} alt={game.title} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 10px 10px 10px', background: 'linear-gradient(to top, var(--bg-tertiary) 30%, transparent 100%)' }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '800', fontFamily: 'Caveat', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px', fontFamily: 'Space Mono' }}>
                     {game.release_date && game.release_date !== 'N/A' ? new Date(game.release_date).getFullYear() : ''}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: '20px',
            width: '50px',
            background: 'linear-gradient(to left, var(--bg-primary) 0%, transparent 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '2rem',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s'
          }}
          className="slider-btn"
        >
          ›
        </button>
      </div>
    </div>
  );
}
