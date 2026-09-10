import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingFeatures() {
  return (
    <>
      {/* Features Section */}
      <div className="container" style={{ padding: '100px 0', borderTop: '2px dashed var(--border-highlight)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '4.5rem', marginBottom: '16px', letterSpacing: '-0.02em', fontFamily: 'Caveat' }}>
            Your Gaming Life, <span style={{ color: 'var(--accent-primary)' }}>Documented</span>
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6', fontFamily: 'Space Mono' }}>
            QuestLog provides all the premium tools you need to build your collection, log your playtime, and share your reviews with a growing community of gamers.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '100px', alignItems: 'center' }}>
          
          {/* Feature 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '60px', maxWidth: '1000px', flexDirection: 'row' }}>
            <div style={{ flex: 1 }}>
              <div className="scrapbook-panel" style={{ padding: '20px', transform: 'rotate(-1deg)' }}>
                <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop" alt="Game Collection" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '3rem', marginBottom: '16px', fontFamily: 'Caveat' }}>Track your personal collection</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', fontFamily: 'Space Mono' }}>
                Log any and every game you've played, are currently playing, and want to play. Be as detailed as you want with features such as time tracking, daily journaling, platform ownership and more.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '60px', maxWidth: '1000px', flexDirection: 'row-reverse' }}>
            <div style={{ flex: 1 }}>
              <div className="scrapbook-panel" style={{ padding: '20px', transform: 'rotate(1deg)' }}>
                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop" alt="Reviews" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '3rem', marginBottom: '16px', fontFamily: 'Caveat' }}>Express your thoughts with reviews</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', fontFamily: 'Space Mono' }}>
                See what everyone is thinking with reviews. Every game has an average rating comprised of everyone's rating to give you a quality score from a glance. Then once you're ready, add your review to define what the game means to you.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '60px', maxWidth: '1000px', flexDirection: 'row' }}>
            <div style={{ flex: 1 }}>
              <div className="scrapbook-panel" style={{ padding: '20px', transform: 'rotate(-2deg)' }}>
                <img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=400&fit=crop" alt="Friends" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '3rem', marginBottom: '16px', fontFamily: 'Caveat' }}>Keep up with friends</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', fontFamily: 'Space Mono' }}>
                Follow others for an all-in-one activity feed that will keep you updated with their latest gaming progress. Games, reviews, and lists from friends appear directly on your home page so you don't miss a thing.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '60px', maxWidth: '1000px', flexDirection: 'row-reverse' }}>
            <div style={{ flex: 1 }}>
              <div className="scrapbook-panel" style={{ padding: '20px', transform: 'rotate(2deg)' }}>
                <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop" alt="Lists" style={{ width: '100%', borderRadius: 'var(--radius-sm)' }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '3rem', marginBottom: '16px', fontFamily: 'Caveat' }}>Create custom lists</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', fontFamily: 'Space Mono' }}>
                Lists allow you to create a custom collection of games with options such as tracking your progress or enabling rankings. You can then decide to share your list with the community or keep it private to yourself.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* About CTA Section */}
      <div style={{ position: 'relative', padding: '120px 24px', textAlign: 'center', borderTop: '2px dashed var(--border-highlight)' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '4.5rem', marginBottom: '24px', letterSpacing: '-0.02em', color: 'var(--text-primary)', fontFamily: 'Caveat' }}>Ready to start your journey?</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6', fontFamily: 'Space Mono' }}>
                Join thousands of gamers who are already tracking their collections, writing reviews, and discovering their next favorite games on QuestLog.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Link to="/register" className="btn-primary">
                    Create Free Account
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}
