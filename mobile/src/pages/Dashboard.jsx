import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';

export default function Dashboard({ navigation }) {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('/dashboard');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    if (authLoading || loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Failed to load dashboard</Text>
            </View>
        );
    }

    const { stats, topGenres, recentGames } = data;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Welcome Header */}
            <View style={styles.headerCard}>
                <Text style={styles.welcomeText}>
                    Welcome back, <Text style={styles.username}>{user.username}</Text>!
                </Text>
                <Text style={styles.subtitleText}>Here is an overview of your gaming library.</Text>
            </View>

            {/* Stat Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
                <StatCard title="Total Tracked" value={stats.totalTracked} color="#a1a1aa" />
                <StatCard title="Completed" value={stats.completed} color="#10b981" />
                <StatCard title="Playing" value={stats.playing} color="#3b82f6" />
                <StatCard title="Avg Rating" value={stats.avgRating || '-'} color="#f59e0b" />
            </ScrollView>

            {/* Main Content Columns (Stacked on mobile) */}
            <View style={styles.sectionContainer}>
                {/* Top Genres */}
                <View style={styles.glassPanel}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionAccent, { color: '#7c3aed' }]}>■</Text>
                        <Text style={styles.sectionTitle}>Top Genres</Text>
                    </View>
                    
                    {topGenres.length === 0 ? (
                        <Text style={styles.emptyText}>Not enough data.</Text>
                    ) : (
                        <View style={styles.genreList}>
                            {topGenres.map((g, i) => (
                                <View key={i.toString()} style={styles.genreItem}>
                                    <Text style={styles.genreName}>{g.genre}</Text>
                                    <View style={styles.genreCountBadge}>
                                        <Text style={styles.genreCountText}>{g.count} games</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Quick Links */}
                <View style={styles.glassPanel}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionAccent, { color: '#3b82f6' }]}>■</Text>
                        <Text style={styles.sectionTitle}>Quick Links</Text>
                    </View>
                    
                    <View style={styles.linksList}>
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonPrimary]} 
                            onPress={() => navigation.navigate('SearchTab')}
                        >
                            <Text style={styles.buttonPrimaryText}>Find a Game</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonOutline, { borderColor: '#7c3aed' }]} 
                            onPress={() => navigation.navigate('Recommend')}
                        >
                            <Text style={styles.buttonOutlineText}>Get AI Recommendations</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonOutline]} 
                            onPress={() => navigation.navigate('LibraryTab')}
                        >
                            <Text style={styles.buttonOutlineText}>View Full Library</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Recently Added */}
            <View style={styles.glassPanel}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionAccent, { color: '#10b981' }]}>■</Text>
                    <Text style={styles.sectionTitle}>Recently Added</Text>
                </View>
                
                {recentGames.length === 0 ? (
                    <Text style={styles.emptyText}>Your library is empty.</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {recentGames.map(game => (
                            <TouchableOpacity 
                                key={game.tracking_id.toString()}
                                style={styles.recentCard}
                                onPress={() => navigation.navigate('GameDetail', { id: game.rawg_id })}
                            >
                                <Image 
                                    source={{ uri: game.cover_url || 'https://via.placeholder.com/180x240' }} 
                                    style={styles.recentImage}
                                />
                                <View style={styles.recentInfo}>
                                    <Text style={styles.recentTitle} numberOfLines={1}>{game.title}</Text>
                                    <Text style={styles.recentStatus}>{game.status.replace('_', ' ')}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    headerCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    username: {
        color: '#7c3aed',
    },
    subtitleText: {
        fontSize: 14,
        color: '#94a3b8',
    },
    statsContainer: {
        marginBottom: 24,
        flexDirection: 'row',
    },
    sectionContainer: {
        gap: 24,
        marginBottom: 24,
    },
    glassPanel: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    sectionAccent: {
        fontSize: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    emptyText: {
        color: '#64748b',
    },
    genreList: {
        gap: 12,
    },
    genreItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    genreName: {
        color: '#fff',
        fontWeight: '500',
    },
    genreCountBadge: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    genreCountText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    linksList: {
        gap: 12,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#7c3aed',
    },
    buttonPrimaryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonOutline: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    buttonOutlineText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 16,
    },
    recentCard: {
        width: 140,
        marginRight: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    recentImage: {
        width: '100%',
        height: 180,
    },
    recentInfo: {
        padding: 12,
    },
    recentTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    recentStatus: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 4,
        textTransform: 'capitalize',
    }
});
