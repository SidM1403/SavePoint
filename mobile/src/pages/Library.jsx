import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LibraryRow from '../components/LibraryRow';

const TABS = ['all', 'playing', 'completed', 'want_to_play', 'dropped'];

export default function Library() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [library, setLibrary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) return;
        const fetchLibrary = async () => {
            try {
                const res = await axios.get('/library');
                setLibrary(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, [user]);

    const handleUpdate = (updatedEntry) => {
        setLibrary(library.map(entry => 
            entry.tracking_id === updatedEntry.id 
                ? { ...entry, status: updatedEntry.status, rating: updatedEntry.rating } 
                : entry
        ));
    };

    const handleRemove = (trackingId) => {
        setLibrary(library.filter(entry => entry.tracking_id !== trackingId));
    };

    if (authLoading || loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    const filteredLibrary = filter === 'all' 
        ? library 
        : library.filter(entry => entry.status === filter);

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.title}>My Library</Text>
            <Text style={styles.subtitle}>Manage your gaming collection and track your progress.</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
                {TABS.map(tab => (
                    <TouchableOpacity 
                        key={tab}
                        style={[styles.tabButton, filter === tab && styles.tabButtonActive]}
                        onPress={() => setFilter(tab)}
                    >
                        <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
                            {tab.replace('_', ' ').toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {filteredLibrary.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No games found in this category.</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredLibrary}
                keyExtractor={item => item.tracking_id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <LibraryRow 
                        entry={item} 
                        onUpdate={handleUpdate}
                        onRemove={handleRemove}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    headerContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 24,
    },
    tabScroll: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginRight: 10,
    },
    tabButtonActive: {
        backgroundColor: '#7c3aed',
        borderColor: '#8b5cf6',
        elevation: 4,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    tabText: {
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: 12,
    },
    tabTextActive: {
        color: '#fff',
    },
    emptyContainer: {
        padding: 40,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        color: '#64748b',
        fontSize: 16,
    }
});
