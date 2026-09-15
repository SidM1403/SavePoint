import React, { useState } from 'react';
import axios from 'axios';

export default function ReviewForm({ trackingId, initialRating, initialReview, onSaved }) {
    const [rating, setRating] = useState(initialRating || '');
    const [review, setReview] = useState(initialReview || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.put(`https://savepoint-jd2r.onrender.com/api/library/${trackingId}`, {
                rating: rating ? parseInt(rating) : null,
                review
            });
            onSaved(res.data);
        } catch (err) {
            console.error('Failed to save review', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Your Review</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>Rating</label>
                    <select 
                        value={rating} 
                        onChange={e => setRating(e.target.value)}
                        style={{ 
                            padding: '12px', 
                            background: 'rgba(0,0,0,0.2)', 
                            color: '#fff', 
                            border: '1px solid var(--border-highlight)', 
                            borderRadius: 'var(--radius-sm)', 
                            width: '200px',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border-highlight)'; e.target.style.boxShadow = 'none'; }}
                    >
                        <option value="" style={{ color: '#000' }}>No Rating</option>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n} style={{ color: '#000' }}>{n} Stars</option>)}
                    </select>
                </div>
                
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>Review Text</label>
                    <textarea 
                        value={review}
                        onChange={e => setReview(e.target.value)}
                        placeholder="Write your thoughts about the game here..."
                        style={{ 
                            width: '100%', 
                            minHeight: '120px', 
                            padding: '14px', 
                            background: 'rgba(0,0,0,0.2)', 
                            color: '#fff', 
                            border: '1px solid var(--border-highlight)', 
                            borderRadius: 'var(--radius-sm)', 
                            resize: 'vertical',
                            outline: 'none',
                            transition: 'all 0.2s',
                            lineHeight: '1.6'
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border-highlight)'; e.target.style.boxShadow = 'none'; }}
                    />
                </div>
                
                <div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="btn-primary"
                        style={{ padding: '10px 24px', borderRadius: 'var(--radius-sm)' }}
                    >
                        {saving ? 'Saving...' : 'Save Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}
