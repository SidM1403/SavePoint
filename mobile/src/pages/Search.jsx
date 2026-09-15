import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import axios from 'axios';
import GameCard from '../components/GameCard';

const AVAILABLE_GENRES = [
    { id: 4, name: 'Fighting' },
    { id: 5, name: 'Shooter' },
    { id: 8, name: 'Platform' },
    { id: 9, name: 'Puzzle' },
    { id: 10, name: 'Racing' },
    { id: 12, name: 'RPG' },
    { id: 13, name: 'Simulator' },
    { id: 14, name: 'Sport' },
    { id: 15, name: 'Strategy' },
    { id: 31, name: 'Adventure' },
    { id: 32, name: 'Indie' },
    { id: 33, name: 'Arcade' }
];

export default function Search() {
    const [query, setQuery] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [sort, setSort] = useState('relevance');
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    // Perform search whenever filters change
    useEffect(() => {
        if (searched) {
            performSearch(query, selectedGenres, sort);
        }
    }, [selectedGenres, sort]);

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
            
            const res = await axios.get(`/games/search?${params.toString()}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
            setError(`Failed to search games: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        performSearch(query, selectedGenres, sort);
    };

    const toggleGenre = (genreId) => {
        if (selectedGenres.includes(genreId)) {
            setSelectedGenres(selectedGenres.filter(id => id !== genreId));
        } else {
            setSelectedGenres([...selectedGenres, genreId]);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.title}>Find your next obsession</Text>
            
            <View style={styles.searchBar}>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search for any game..."
                    placeholderTextColor="#64748b"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Go</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.filterTitle}>Genres</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                {AVAILABLE_GENRES.map(genre => {
                    const isSelected = selectedGenres.includes(genre.id);
                    return (
                        <TouchableOpacity 
                            key={genre.id.toString()}
                            style={[styles.genreChip, isSelected && styles.genreChipSelected]}
                            onPress={() => toggleGenre(genre.id)}
                        >
                            <Text style={[styles.genreChipText, isSelected && styles.genreChipTextSelected]}>
                                {genre.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.sortContainer}>
                <Text style={styles.filterTitle}>Sort By:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                    {['relevance', 'trending', 'rating', 'newest'].map(option => (
                        <TouchableOpacity 
                            key={option}
                            style={[styles.genreChip, sort === option && styles.genreChipSelected]}
                            onPress={() => setSort(option)}
                        >
                            <Text style={[styles.genreChipText, sort === option && styles.genreChipTextSelected]}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            {searched && !loading && results.length === 0 && !error && (
                <Text style={styles.emptyText}>No games found. Try adjusting your filters.</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#7c3aed" />
                </View>
            )}
            <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => <GameCard game={item} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        borderColor: '#334155',
        color: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#7c3aed',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    filterTitle: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    genreScroll: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    genreChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginRight: 8,
    },
    genreChipSelected: {
        backgroundColor: '#7c3aed',
        borderColor: '#7c3aed',
    },
    genreChipText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    genreChipTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    sortContainer: {
        marginTop: 8,
    },
    errorText: {
        color: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    }
});
