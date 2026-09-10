import React from 'react';
import GameSlider from './GameSlider';

export default function LandingDiscovery({ loading, recommended, gamesData, activity }) {
  return (
    <div className="container" style={{ padding: '80px 0', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Game Sliders */}
        <div style={{ flex: '1 1 72%', minWidth: '300px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', animation: 'pulse 1.5s infinite', color: 'var(--accent-primary)', marginBottom: '16px', fontFamily: 'Caveat' }}>Loading the best games...</div>
            </div>
          ) : (
            <>
              {recommended && (
                 <GameSlider title={`Because you loved ${recommended.basedOn}...`} games={recommended.games} />
              )}
              <GameSlider title="Popular This Week" games={gamesData.popular} numbered={true} />
              <GameSlider title="New & Upcoming Releases" games={gamesData.newReleases} />
              <GameSlider title="Highest Rated Classics" games={gamesData.highlyRated} />
            </>
          )}
        </div>

        {/* Right Side: Activity Feed */}
        <div style={{ flex: '1 1 25%', minWidth: '280px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-primary)', fontSize: '2.5rem' }}>*</span> Community Activity
          </h2>
          <div className="scrapbook-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {activity.length > 0 ? activity.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', borderBottom: idx < activity.length - 1 ? '1px dashed var(--border-highlight)' : 'none', paddingBottom: idx < activity.length - 1 ? '20px' : '0' }}>
                <img src={act.game_cover} alt={act.game_title} style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }} />
                <div>
                  <p style={{ fontSize: '1rem', margin: '0 0 6px', color: 'var(--text-secondary)', fontFamily: 'Space Mono' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{act.username}</span> 
                    {act.rating ? ` rated ${act.game_title} ${act.rating}/10` : 
                     act.status === 'playing' ? ` is playing ${act.game_title}` : 
                     ` completed ${act.game_title}`}
                  </p>
                  {act.review && (
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontFamily: 'Caveat', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{act.review}"</p>
                  )}
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>No recent activity.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
