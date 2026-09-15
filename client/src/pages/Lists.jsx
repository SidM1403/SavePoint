import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Lists() {
    const { user, token } = useContext(AuthContext);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        if (user && token) {
            fetchLists();
        } else {
            setLoading(false);
        }
    }, [user, token]);

    const fetchLists = async () => {
        try {
            const res = await axios.get('https://savepoint-jd2r.onrender.com/api/lists/my-lists', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLists(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        
        try {
            const res = await axios.post('https://savepoint-jd2r.onrender.com/api/lists', {
                name: newName,
                description: newDesc,
                is_private: isPrivate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLists([res.data, ...lists]);
            setIsCreating(false);
            setNewName('');
            setNewDesc('');
            setIsPrivate(false);
        } catch (err) {
            console.error(err);
            alert('Failed to create list');
        }
    };

    if (!user) {
        return (
            <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>Custom Lists</h1>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'Space Mono' }}>Log in to create and manage your custom game lists.</p>
                <Link to="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>Log In</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 24px', maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '4.5rem', fontFamily: 'Caveat', color: 'var(--text-primary)', margin: 0 }}>My Lists</h1>
                <button onClick={() => setIsCreating(!isCreating)} className="btn-primary">
                    {isCreating ? 'Cancel' : '+ New List'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateList} className="scrapbook-panel" style={{ padding: '30px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2rem', fontFamily: 'Caveat', marginBottom: '20px' }}>Create a New List</h2>
                    <div style={{ marginBottom: '16px' }}>
                        <input 
                            type="text" 
                            placeholder="List Name (e.g. My Favorite RPGs)" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'Space Mono', fontSize: '1rem', borderRadius: '4px', outline: 'none' }}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <textarea 
                            placeholder="Description (optional)" 
                            value={newDesc} 
                            onChange={e => setNewDesc(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'Space Mono', fontSize: '1rem', borderRadius: '4px', outline: 'none', minHeight: '80px' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>
                            <input 
                                type="checkbox" 
                                checked={isPrivate} 
                                onChange={e => setIsPrivate(e.target.checked)}
                                style={{ accentColor: 'var(--accent-primary)' }}
                            />
                            Make this list private
                        </label>
                    </div>
                    <button type="submit" className="btn-primary">Save List</button>
                </form>
            )}

            {loading ? (
                <p style={{ fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>Loading lists...</p>
            ) : lists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed var(--border-subtle)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '1.2rem', fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>You haven't created any lists yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {lists.map(list => (
                        <Link key={list.id} to={`/list/${list.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="scrapbook-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div>
                                    <h3 style={{ fontSize: '1.8rem', margin: '0 0 8px 0', fontFamily: 'Caveat', color: 'var(--text-primary)' }}>{list.name}</h3>
                                    <p style={{ margin: 0, fontFamily: 'Space Mono', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {list.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right', fontFamily: 'Space Mono', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    <div>{new Date(list.created_at).toLocaleDateString()}</div>
                                    <div style={{ marginTop: '4px', color: list.is_private ? 'var(--accent-primary)' : 'inherit' }}>
                                        {list.is_private ? 'Private' : 'Public'}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
