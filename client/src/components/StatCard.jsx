import React from 'react';

export default function StatCard({ title, value, color }) {
    return (
        <div className="glass-panel" style={{ 
            padding: '24px', 
            flex: '1 1 200px', 
            borderTop: `3px solid ${color}`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s'
        }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `linear-gradient(180deg, ${color}11 0%, transparent 100%)`, zIndex: 0 }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{title}</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: color, textShadow: `0 0 10px ${color}44` }}>{value}</div>
            </div>
        </div>
    );
}
