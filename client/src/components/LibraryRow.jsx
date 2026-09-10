import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function LibraryRow({ entry, onUpdate, onRemove }) {
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState(entry.status);
    const [rating, setRating] = useState(entry.rating || '');
    
    const statusColors = {
        'playing': { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: '#3b82f6' },
        'completed': { bg: 'rgba(16, 185, 129, 0.2)', text: '#86efac', border: '#10b981' },
        'dropped': { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: '#ef4444' },
        'want_to_play': { bg: 'rgba(245, 158, 11, 0.2)', text: '#fcd34d', border: '#f59e0b' }
    };

    const handleSave = async () => {
        try {
            const res = await axios.put(`http://localhost:5005/api/library/${entry.tracking_id}`, {
                status, rating: rating ? parseInt(rating) : null
            });
            onUpdate(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update', err);
        }
    };

    const handleRemove = async () => {
        if (!window.confirm('Are you sure you want to remove this game from your library?')) return;
        try {
            await axios.delete(`http://localhost:5005/api/library/${entry.tracking_id}`);
            onRemove(entry.tracking_id);
        } catch (err) {
            console.error('Failed to remove', err);
        }
    };

    return (
        <div className="glass-panel" style={{ 
            padding: '20px', 
            display: 'flex', 
            gap: '24px', 
            alignItems: 'center',
            transition: 'transform 0.2s',
            borderLeft: `4px solid ${statusColors[entry.status]?.border || 'var(--border-subtle)'}`
        }} onMouseOver={e => !isEditing && (e.currentTarget.style.transform = 'translateX(4px)')} onMouseOut={e => !isEditing && (e.currentTarget.style.transform = 'translateX(0)')}>
            <Link to={`/game/${entry.rawg_id}`} style={{ flexShrink: 0 }}>
                <img src={entry.cover_url} alt={entry.title} style={{ width: '90px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }} />
            </Link>
            
            <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/game/${entry.rawg_id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.title}</h3>
                </Link>
                
                {isEditing ? (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
                        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-highlight)', borderRadius: 'var(--radius-sm)', outline: 'none' }}>
                            <option value="playing">Playing</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                            <option value="want_to_play">Want to Play</option>
                        </select>
                        <select value={rating} onChange={e => setRating(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-highlight)', borderRadius: 'var(--radius-sm)', outline: 'none' }}>
                            <option value="">No Rating</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Stars</option>)}
                        </select>
                        <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}>Save</button>
                        <button onClick={() => setIsEditing(false)} className="btn-outline" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}>Cancel</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span style={{ 
                            background: statusColors[entry.status]?.bg || 'var(--bg-tertiary)', 
                            color: statusColors[entry.status]?.text || 'var(--text-secondary)', 
                            border: `1px solid ${statusColors[entry.status]?.border || 'transparent'}`,
                            padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.5px' 
                        }}>
                            {entry.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {entry.rating && <span style={{ color: '#fbbf24', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> {entry.rating}/10</span>}
                    </div>
                )}
                
                {entry.review && !isEditing && (
                    <div style={{ marginTop: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
                        "{entry.review}"
                    </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                    Added on {new Date(entry.added_at).toLocaleDateString()}
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: 'auto' }}>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn-outline" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}>Edit</button>
                )}
                <button onClick={handleRemove} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>Remove</button>
            </div>
        </div>
    );
}
