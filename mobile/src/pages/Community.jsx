import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Image, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Community() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigation = useNavigation();
    
    const [feed, setFeed] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFeed();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchFeed = async () => {
        try {
            const res = await axios.get('/users/feed/activity');
            setFeed(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await axios.get(`/users/search/all?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFollow = async (userId) => {
        try {
            await axios.post(`/users/${userId}/follow`);
            Alert.alert('Success', 'Followed user!');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to follow user.');
        }
    };

    if (authLoading || loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.authTitle}>Community</Text>
                <Text style={styles.authSubtitle}>Log in to see your friends' activity and discover new users.</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginBtnText}>Log In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.pageTitle}>Community</Text>

            {/* Find Users Section */}
            <View style={styles.searchPanel}>
                <Text style={styles.sectionTitle}>Find Users</Text>
                <View style={styles.searchRow}>
                    <TextInput 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by username..."
                        placeholderTextColor="#64748b"
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                        <Text style={styles.searchBtnText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {searchResults.length > 0 && (
                    <View style={styles.searchResults}>
                        {searchResults.map(u => (
                            <View key={u.id.toString()} style={styles.userRow}>
                                <View style={styles.userInfo}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{u.username.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles.username}>{u.username}</Text>
                                </View>
                                {u.id !== user.id && (
                                    <TouchableOpacity style={styles.followBtn} onPress={() => handleFollow(u.id)}>
                                        <Text style={styles.followBtnText}>Follow</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Friends Activity</Text>
            
            {feed.length === 0 && (
                <View style={styles.emptyFeed}>
                    <Text style={styles.emptyFeedText}>Your feed is empty. Search for users to follow above!</Text>
                </View>
            )}
        </View>
    );

    return (
        <FlatList
            style={styles.container}
            contentContainerStyle={styles.content}
            data={feed}
            keyExtractor={(item, index) => index.toString()}
            ListHeaderComponent={renderHeader}
            renderItem={({ item: act }) => (
                <View style={styles.activityCard}>
                    <TouchableOpacity onPress={() => navigation.navigate('GameDetail', { id: act.game_id })}>
                        <Image source={{ uri: act.game_cover || 'https://via.placeholder.com/80x110' }} style={styles.gameCover} />
                    </TouchableOpacity>
                    
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>
                            <Text style={styles.activityUser}>{act.username}</Text>
                            {act.rating ? ` rated ` : act.status === 'playing' ? ` is playing ` : ` added `}
                            <Text 
                                style={styles.activityGame} 
                                onPress={() => navigation.navigate('GameDetail', { id: act.game_id })}
                            >
                                {act.game_title}
                            </Text>
                            {!!act.rating && <Text style={styles.ratingText}> ★ {act.rating}/10</Text>}
                        </Text>
                        
                        {!!act.review && (
                            <View style={styles.reviewQuote}>
                                <Text style={styles.reviewQuoteText}>"{act.review}"</Text>
                            </View>
                        )}
                        
                        <Text style={styles.dateText}>{new Date(act.updated_at).toLocaleDateString()}</Text>
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        padding: 24,
    },
    authTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    authSubtitle: {
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
    },
    loginBtn: {
        backgroundColor: '#7c3aed',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    loginBtnText: {
        color: '#fff',
        fontWeight: 'bold',
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
    headerContainer: {
        marginBottom: 8,
    },
    pageTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 24,
    },
    searchPanel: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        borderColor: '#334155',
        color: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchBtn: {
        backgroundColor: '#7c3aed',
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    searchBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    searchResults: {
        gap: 12,
    },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#7c3aed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    username: {
        color: '#fff',
        fontWeight: 'bold',
    },
    followBtn: {
        borderWidth: 1,
        borderColor: '#7c3aed',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    followBtnText: {
        color: '#7c3aed',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyFeed: {
        padding: 40,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyFeedText: {
        color: '#64748b',
        textAlign: 'center',
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    gameCover: {
        width: 80,
        height: 110,
        borderRadius: 6,
        marginRight: 16,
    },
    activityContent: {
        flex: 1,
        justifyContent: 'center',
    },
    activityText: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    activityUser: {
        color: '#7c3aed',
        fontWeight: 'bold',
    },
    activityGame: {
        color: '#fff',
        fontWeight: 'bold',
    },
    ratingText: {
        color: '#fbbf24',
        fontWeight: 'bold',
    },
    reviewQuote: {
        borderLeftWidth: 3,
        borderLeftColor: '#7c3aed',
        paddingLeft: 12,
        marginBottom: 8,
    },
    reviewQuoteText: {
        color: '#cbd5e1',
        fontStyle: 'italic',
        fontSize: 14,
    },
    dateText: {
        color: '#64748b',
        fontSize: 12,
    }
});
