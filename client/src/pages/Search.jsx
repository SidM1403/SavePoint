import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import GameCard from '../components/GameCard';

const AVAILABLE_GENRES = [
    { id: 4, name: 'Fighting' },
    { id: 5, name: 'Shooter' },
    { id: 8, name: 'Platform' },
    { id: 9, name: 'Puzzle' },
    { id: 10, name: 'Racing' },
    { id: 12, name: 'Role-playing (RPG)' },
    { id: 13, name: 'Simulator' },
    { id: 14, name: 'Sport' },
    { id: 15, name: 'Strategy' },
    { id: 31, name: 'Adventure' },
    { id: 32, name: 'Indie' },
    { id: 33, name: 'Arcade' }
];

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialGenres = searchParams.get('genres') ? searchParams.get('genres').split(',').map(Number) : [];
    const initialSort = searchParams.get('sort') || 'relevance';
    
    const [query, setQuery] = useState(initialQuery);
    const [selectedGenres, setSelectedGenres] = useState(initialGenres);
    const [sort, setSort] = useState(initialSort);
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (initialQuery || initialGenres.length > 0) {
            performSearch(initialQuery, initialGenres, initialSort);
        }
    }, [initialQuery, searchParams.get('genres'), initialSort]);

    const performSearch = async (searchQuery, genresToSearch, sortToSearch) => {
        if (!searchQuery.trim() && genresToSearch.length === 0) return;
        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append('q', searchQuery.trim());
            if (genresToSearch.length > 0) params.append('genres', genresToSearch.join(','));
            if (sortToSearch && sortToSearch !== 'relevance') params.append('sort', sortToSearch);
            
            const res = await axios.get(`http://localhost:5005/api/games/search?${params.toString()}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
            setError(`Failed to search games: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (newQuery, newGenres, newSort) => {
        const params = {};
        if (newQuery.trim()) params.q = newQuery.trim();
        if (newGenres.length > 0) params.genres = newGenres.join(',');
        if (newSort && newSort !== 'relevance') params.sort = newSort;
        setSearchParams(params);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters(query, selectedGenres, sort);
    };

    const toggleGenre = (genreId) => {
        const newGenres = selectedGenres.includes(genreId)
            ? selectedGenres.filter(id => id !== genreId)
            : [...selectedGenres, genreId];
        setSelectedGenres(newGenres);
        applyFilters(query, newGenres, sort);
    };

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSort(newSort);
        applyFilters(query, selectedGenres, newSort);
    };

    return (
        <div className="container" style={{ padding: '60px 24px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto 60px auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '4.5rem', marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'Caveat' }}>Find your next obsession</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '32px', fontFamily: 'Space Mono' }}>
                    Search through thousands of games to add to your collection.
                </p>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input 
                        type="text" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                        placeholder="Search for any game..."
                        style={{ 
                            flex: 1, 
                            padding: '20px 20px 20px 60px', 
                            background: 'transparent', 
                            border: '3px solid var(--text-primary)', 
                            color: 'var(--text-primary)', 
                            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', 
                            fontSize: '1.4rem',
                            fontFamily: 'Space Mono',
                            outline: 'none',
                            transition: 'var(--transition-fast)'
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = 'var(--accent-primary)';
                            e.target.style.boxShadow = 'var(--shadow-glow)';
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = 'var(--text-primary)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0 40px', fontSize: '1.1rem', borderRadius: 'var(--radius-lg)' }}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '32px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

            {searched && !loading && results.length === 0 && !error && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', padding: '40px' }}>
                    No games found. Try adjusting your filters or search term.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>
                {/* Filters Sidebar */}
                <div>
                    <div className="scrapbook-panel" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '2px dashed var(--border-subtle)', paddingBottom: '12px', fontFamily: 'Caveat' }}>Sort By</h3>
                        <select 
                            value={sort} 
                            onChange={handleSortChange}
                            style={{ width: '100%', padding: '10px', background: 'transparent', border: '2px solid var(--text-primary)', color: 'var(--text-primary)', borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px', outline: 'none', marginBottom: '32px', fontFamily: 'Space Mono', fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            <option value="relevance">Relevance</option>
                            <option value="trending">Trending (Popularity)</option>
                            <option value="rating">Highest Rated</option>
                            <option value="newest">Newest Releases</option>
                        </select>

                        <h3 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '2px dashed var(--border-subtle)', paddingBottom: '12px', fontFamily: 'Caveat' }}>Genres</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {AVAILABLE_GENRES.map(genre => (
                                <label key={genre.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: selectedGenres.includes(genre.id) ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'color 0.2s', fontFamily: 'Space Mono', fontSize: '0.95rem' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedGenres.includes(genre.id)}
                                        onChange={() => toggleGenre(genre.id)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                                    />
                                    {genre.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                        {results.map(game => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
