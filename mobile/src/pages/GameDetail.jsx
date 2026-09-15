import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert, Linking, Dimensions } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import GameSlider from '../components/GameSlider';

const { width } = Dimensions.get('window');

export default function GameDetail({ route, navigation }) {
    const { id } = route.params;
    const { user } = useContext(AuthContext);
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Library state
    const [libraryEntry, setLibraryEntry] = useState(null);
    const [adding, setAdding] = useState(false);
    
    // Community Reviews state
    const [communityReviews, setCommunityReviews] = useState([]);

    useEffect(() => {
        const fetchGameAndLibrary = async () => {
            try {
                const gameRes = await axios.get(`/games/${id}`);
                setGame(gameRes.data);
                
                const reviewsRes = await axios.get(`/games/${id}/reviews`);
                setCommunityReviews(reviewsRes.data);

                if (user) {
                    const libRes = await axios.get('/library');
                    const entry = libRes.data.find(e => e.rawg_id.toString() === id.toString());
                    if (entry) setLibraryEntry(entry);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load game details');
            } finally {
                setLoading(false);
            }
        };
        fetchGameAndLibrary();
    }, [id, user]);

    const handleAddToLibrary = async (status) => {
        setAdding(true);
        try {
            const res = await axios.post('/library', { rawg_id: parseInt(id), status });
            setLibraryEntry({ tracking_id: res.data.id, status: res.data.status, rating: null, review: null });
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to add to library');
        } finally {
            setAdding(false);
        }
    };

    const handleReviewSaved = (updatedData) => {
        setLibraryEntry(prev => ({ ...prev, rating: updatedData.rating, review: updatedData.review }));
    };

    const openTrailer = () => {
        if (game?.trailer) {
            Linking.openURL(`https://www.youtube.com/watch?v=${game.trailer}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }
    if (error || !game) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error || 'Game not found'}</Text>
            </View>
        );
    }

    const myReview = communityReviews.find(r => r.username === user?.username);
    const otherReviews = communityReviews.filter(r => r.username !== user?.username);

    const heroBgUrl = game.background_url || (game.cover_url ? game.cover_url.replace('t_cover_big', 't_1080p') : 'https://via.placeholder.com/1080x720');
    const coverUrl = game.cover_url ? game.cover_url.replace('t_cover_big', 't_720p') : 'https://via.placeholder.com/220x330';

    return (
        <ScrollView style={styles.container}>
            {/* Hero Banner Area */}
            <View style={styles.heroContainer}>
                <Image source={{ uri: heroBgUrl }} style={styles.heroImage} />
                <View style={styles.heroOverlay} />
                
                <View style={styles.heroContent}>
                    <Image source={{ uri: coverUrl }} style={styles.coverImage} />
                    <View style={styles.heroTextContainer}>
                        <Text style={styles.gameTitle}>{game.title}</Text>
                        <Text style={styles.gameSubtitle}>
                            {game.release_date && game.release_date !== 'N/A' ? new Date(game.release_date).getFullYear() : 'TBA'}
                            {' • '}
                            {game.developer || 'Unknown Dev'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.mainContent}>
                {/* Library Status (Right column on web, top on mobile) */}
                <View style={styles.libraryPanel}>
                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>IGDB Rating</Text>
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingValue}>★ {game.rawg_rating || 'N/A'}</Text>
                        </View>
                    </View>

                    <Text style={styles.panelTitle}>Library Status</Text>
                    
                    {!user ? (
                        <Text style={styles.authPrompt}>Log in to track this game in your collection.</Text>
                    ) : libraryEntry ? (
                        <View>
                            <View style={styles.statusActiveBadge}>
                                <Text style={styles.statusActiveText}>
                                    {libraryEntry.status.replace('_', ' ').toUpperCase()}
                                </Text>
                            </View>
                            
                            <View style={styles.statusGrid}>
                                <TouchableOpacity disabled={adding} onPress={() => handleAddToLibrary('playing')} style={styles.statusBtnOutline}><Text style={styles.statusBtnTextOutline}>Playing</Text></TouchableOpacity>
                                <TouchableOpacity disabled={adding} onPress={() => handleAddToLibrary('completed')} style={styles.statusBtnOutline}><Text style={styles.statusBtnTextOutline}>Completed</Text></TouchableOpacity>
                                <TouchableOpacity disabled={adding} onPress={() => handleAddToLibrary('dropped')} style={styles.statusBtnOutline}><Text style={styles.statusBtnTextOutline}>Dropped</Text></TouchableOpacity>
                                <TouchableOpacity disabled={adding} onPress={() => handleAddToLibrary('want_to_play')} style={styles.statusBtnOutline}><Text style={styles.statusBtnTextOutline}>Want to Play</Text></TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.statusGrid}>
                            <TouchableOpacity disabled={adding} onPress={() => handleAddToLibrary('playing')} style={[styles.statusBtn, {backgroundColor: '#2563eb'}]}><Text style={styles.statusBtnText}>Currently Playing</Text></TouchableOpacity>
                            <TouchableOpacity disabled={adding} onPress={() => handleAddToLibrary('completed')} style={[styles.statusBtn, {backgroundColor: '#16a34a'}]}><Text style={styles.statusBtnText}>Completed</Text></TouchableOpacity>
                            <TouchableOpacity disabled={adding} onPress={() => handleAddToLibrary('want_to_play')} style={[styles.statusBtn, {backgroundColor: '#d97706'}]}><Text style={styles.statusBtnText}>Want to Play</Text></TouchableOpacity>
                            <TouchableOpacity disabled={adding} onPress={() => handleAddToLibrary('dropped')} style={[styles.statusBtn, {backgroundColor: '#dc2626'}]}><Text style={styles.statusBtnText}>Dropped</Text></TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* About Section */}
                {!!game.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>{game.description}</Text>
                    </View>
                )}

                {/* Tags */}
                {(game.platforms?.length > 0 || game.themes?.length > 0) && (
                    <View style={styles.section}>
                        {!!game.platforms?.length && (
                            <View style={styles.tagGroup}>
                                <Text style={styles.sectionTitleSmall}>Platforms</Text>
                                <View style={styles.tagsContainer}>
                                    {game.platforms.map(p => (
                                        <View key={p} style={styles.tag}><Text style={styles.tagText}>{p}</Text></View>
                                    ))}
                                </View>
                            </View>
                        )}
                        {!!game.themes?.length && (
                            <View style={styles.tagGroup}>
                                <Text style={styles.sectionTitleSmall}>Themes</Text>
                                <View style={styles.tagsContainer}>
                                    {game.themes.map(t => (
                                        <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Trailer */}
                {!!game.trailer && (
                    <TouchableOpacity style={styles.trailerBtn} onPress={openTrailer}>
                        <Text style={styles.trailerBtnText}>Watch Trailer on YouTube</Text>
                    </TouchableOpacity>
                )}

                {/* Review Form */}
                {user && libraryEntry && (
                    <View style={styles.reviewFormContainer}>
                        <ReviewForm 
                            trackingId={libraryEntry.tracking_id} 
                            initialRating={libraryEntry.rating} 
                            initialReview={libraryEntry.review} 
                            onSaved={handleReviewSaved} 
                        />
                    </View>
                )}

                {/* Community Reviews */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Community Reviews ({communityReviews.length})</Text>
                    
                    {communityReviews.length === 0 ? (
                        <View style={styles.emptyReviews}>
                            <Text style={styles.emptyReviewsText}>Be the first to review this game!</Text>
                        </View>
                    ) : (
                        <View style={styles.reviewsList}>
                            {myReview && <ReviewCard review={myReview} />}
                            {otherReviews.map((r, i) => <ReviewCard key={i.toString()} review={r} />)}
                        </View>
                    )}
                </View>

                {/* Similar Games */}
                {game.similar_games?.length > 0 && (
                    <View style={{ marginTop: 24, marginHorizontal: -16 }}>
                        <GameSlider title="Similar Games" games={game.similar_games} />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
    },
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    heroContainer: {
        height: 350,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    heroContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 16,
    },
    coverImage: {
        width: 100,
        height: 150,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    heroTextContainer: {
        flex: 1,
        paddingBottom: 8,
    },
    gameTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    gameSubtitle: {
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '600',
    },
    mainContent: {
        padding: 16,
        paddingBottom: 40,
    },
    libraryPanel: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    ratingLabel: {
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    ratingBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    ratingValue: {
        color: '#fbbf24',
        fontWeight: 'bold',
        fontSize: 16,
    },
    panelTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    authPrompt: {
        color: '#64748b',
        textAlign: 'center',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
    },
    statusActiveBadge: {
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#7c3aed',
        marginBottom: 16,
        alignItems: 'center',
    },
    statusActiveText: {
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusBtn: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    statusBtnOutline: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    statusBtnTextOutline: {
        color: '#fff',
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    description: {
        color: '#cbd5e1',
        lineHeight: 22,
        fontSize: 14,
    },
    tagGroup: {
        marginBottom: 16,
    },
    sectionTitleSmall: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#334155',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#475569',
    },
    tagText: {
        color: '#cbd5e1',
        fontSize: 12,
    },
    trailerBtn: {
        backgroundColor: '#dc2626',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 24,
    },
    trailerBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    reviewFormContainer: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#7c3aed',
    },
    emptyReviews: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 12,
    },
    emptyReviewsText: {
        color: '#64748b',
    },
    reviewsList: {
        gap: 16,
    }
});
