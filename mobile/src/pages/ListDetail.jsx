import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import GameCard from '../components/GameCard';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ListDetail() {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params || {};
    const { user } = useContext(AuthContext);
    
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchList();
        } else {
            setError('No list ID provided');
            setLoading(false);
        }
    }, [id]);

    const fetchList = async () => {
        try {
            const res = await axios.get(`/lists/${id}`);
            setList(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load list. It might be private or deleted.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveGame = (gameId) => {
        Alert.alert('Remove Game', 'Are you sure you want to remove this game from the list?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Remove', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`/lists/${id}/games/${gameId}`);
                        setList({
                            ...list,
                            games: list.games.filter(g => g.id !== gameId)
                        });
                    } catch (err) {
                        console.error(err);
                        Alert.alert('Error', 'Failed to remove game');
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text style={styles.loadingText}>Loading list...</Text>
            </View>
        );
    }

    if (error || !list) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.primaryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isOwner = user && user.id === list.user_id;

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.title}>{list.name}</Text>
            <Text style={styles.description}>{list.description || 'No description.'}</Text>
            
            <View style={styles.metaContainer}>
                <Text style={styles.metaText}>Created: {new Date(list.created_at).toLocaleDateString()}</Text>
                <Text style={styles.metaText}>{list.is_private ? '🔒 Private List' : '🌍 Public List'}</Text>
                <Text style={styles.metaText}>{list.games.length} Games</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={list.games}
                keyExtractor={(item) => item.entry_id?.toString() || item.id.toString()}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>This list is empty.</Text>
                        {isOwner && (
                            <TouchableOpacity style={[styles.primaryButton, { marginTop: 16 }]} onPress={() => navigation.navigate('Search')}>
                                <Text style={styles.primaryButtonText}>Go Find Games</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <GameCard game={item} />
                        {isOwner && (
                            <TouchableOpacity 
                                style={styles.removeButton}
                                onPress={() => handleRemoveGame(item.id)}
                            >
                                <Text style={styles.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0f172a' },
    loadingText: { marginTop: 16, color: '#64748b' },
    errorText: { color: '#ef4444', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    primaryButton: { backgroundColor: '#7c3aed', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center' },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    headerContainer: { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 24, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
    description: { fontSize: 16, color: '#94a3b8', marginBottom: 20, lineHeight: 24 },
    metaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    metaText: { color: '#64748b', fontSize: 14 },
    listContent: { padding: 16, paddingBottom: 40 },
    columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
    emptyContainer: { alignItems: 'center', padding: 40, borderWidth: 2, borderColor: '#334155', borderStyle: 'dashed', borderRadius: 8, marginTop: 20 },
    emptyText: { fontSize: 16, color: '#94a3b8', textAlign: 'center' },
    cardWrapper: { position: 'relative', width: '48%' }, // Adjust width for 2 columns with space between
    removeButton: { position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
    removeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: -2 }
});
