import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Theme Toggle Logic — default to dark
  const [theme, setTheme] = useState(() => {
    const stored = document.documentElement.getAttribute('data-theme');
    if (!stored) document.documentElement.setAttribute('data-theme', 'dark');
    return stored || 'dark';
  });
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000,
      padding: '16px 0', 
      borderBottom: '2px solid var(--text-primary)', 
      background: 'var(--bg-primary)'
    }}>
      <div className="container" style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left: Logo and Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexShrink: 0 }}>
            <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '800', fontSize: '2.2rem', letterSpacing: '0', fontFamily: 'Caveat' }}>
              Quest<span style={{ color: 'var(--accent-primary)' }}>Log</span>
            </Link>
            
            {user && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link to="/community" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '700', transition: 'color 0.2s', fontFamily: 'Caveat', fontSize: '1.4rem' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Community</Link>
                    <Link to="/lists" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '700', transition: 'color 0.2s', fontFamily: 'Caveat', fontSize: '1.4rem' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>My Lists</Link>
                    <Link to="/recommend" style={{ 
                        color: 'var(--accent-primary)', 
                        textDecoration: 'none', 
                        fontWeight: '700', 
                        fontFamily: 'Caveat', 
                        fontSize: '1.5rem',
                        borderBottom: '2px dashed var(--accent-primary)',
                        paddingBottom: '2px',
                        transition: 'all 0.2s'
                    }} onMouseOver={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'var(--text-primary)'; }} onMouseOut={e => { e.target.style.color = 'var(--accent-primary)'; e.target.style.borderColor = 'var(--accent-primary)'; }}>
                        AI Matchmaker
                    </Link>
                </div>
            )}
        </div>
        
        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '500px', margin: '0 24px', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search games..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 16px 12px 42px', 
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', 
              background: 'var(--bg-tertiary)', 
              border: '2px solid var(--text-primary)', 
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.2s',
              fontSize: '0.95rem',
              fontFamily: 'Space Mono'
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '3px 3px 0 rgba(0,0,0,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.boxShadow = 'none'; }}
          />
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/search')}
            style={{ 
              background: 'transparent', 
              border: '2px solid var(--text-primary)', 
              color: 'var(--text-primary)', 
              borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px', 
              padding: '10px 14px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            title="Advanced Filters"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </form>

        {/* Right: User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px'
              }}
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {user ? (
              <div 
                style={{ position: 'relative' }} 
              onMouseEnter={() => setDropdownOpen(true)} 
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    cursor: 'pointer', 
                    padding: '6px 12px',
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--text-primary)', 
                    color: 'var(--text-primary)', 
                    fontWeight: 'bold',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ fontSize: '1rem', fontFamily: 'Space Mono' }}>{user.username}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.9rem', border: '1px solid var(--bg-primary)' }}>
                      {user.username.charAt(0).toUpperCase()}
                  </div>
                </button>

              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', paddingTop: '8px', zIndex: 1001 }}>
                  <div style={{ 
                    width: '200px', 
                    background: 'var(--bg-tertiary)', 
                    border: '2px solid var(--text-primary)', 
                    borderRadius: '4px', 
                    padding: '8px 0', 
                    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
                  }}>
                    <Link to="/dashboard" style={{ display: 'block', padding: '12px 20px', color: 'var(--text-primary)', textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.target.style.background = 'transparent'}>Dashboard</Link>
                    <Link to="/library" style={{ display: 'block', padding: '12px 20px', color: 'var(--text-primary)', textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.target.style.background = 'transparent'}>Library</Link>
                    <div style={{ height: '1px', background: 'var(--text-primary)', margin: '8px 0' }}></div>
                    <div onClick={handleLogout} style={{ display: 'block', padding: '12px 20px', color: '#ef4444', textDecoration: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={e => e.target.style.background = 'transparent'}>Logout</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Log In</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 20px' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
