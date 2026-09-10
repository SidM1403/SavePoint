import React from 'react';

export default function ReviewCard({ review }) {
    return (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-glow))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '1.2rem', boxShadow: 'var(--shadow-md)' }}>
                        {review.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', color: '#fff', fontSize: '1.05rem' }}>{review.username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(review.updated_at || review.added_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                
                {review.rating && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', color: '#fbbf24', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {review.rating} / 10
                    </div>
                )}
            </div>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {review.review || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No written review provided.</span>}
            </div>
        </div>
    );
}
