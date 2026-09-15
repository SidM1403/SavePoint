import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Lists() {
    const { user, token } = useContext(AuthContext);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    
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
            const res = await axios.get('/lists/my-lists');
            setLists(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateList = async () => {
        if (!newName.trim()) return;
        
        try {
            const res = await axios.post('/lists', {
                name: newName,
                description: newDesc,
                is_private: isPrivate
            });
            setLists([res.data, ...lists]);
            setIsCreating(false);
            setNewName('');
            setNewDesc('');
            setIsPrivate(false);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to create list');
        }
    };

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.title}>Custom Lists</Text>
                <Text style={styles.subtitle}>Log in to create and manage your custom game lists.</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.primaryButtonText}>Log In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>My Lists</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setIsCreating(!isCreating)}>
                    <Text style={styles.primaryButtonText}>{isCreating ? 'Cancel' : '+ New List'}</Text>
                </TouchableOpacity>
            </View>

            {isCreating && (
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Create a New List</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="List Name (e.g. My Favorite RPGs)"
                        placeholderTextColor="#64748b"
                        value={newName}
                        onChangeText={setNewName}
                    />
                    <TextInput 
                        style={[styles.input, styles.textArea]}
                        placeholder="Description (optional)"
                        placeholderTextColor="#64748b"
                        value={newDesc}
                        onChangeText={setNewDesc}
                        multiline
                    />
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Make this list private</Text>
                        <Switch 
                            value={isPrivate} 
                            onValueChange={setIsPrivate} 
                            trackColor={{ false: '#334155', true: '#7c3aed' }}
                            thumbColor="#fff"
                        />
                    </View>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleCreateList}>
                        <Text style={styles.primaryButtonText}>Save List</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.listItem} 
            onPress={() => navigation.navigate('ListDetail', { id: item.id })}
        >
            <View style={styles.listInfo}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listDesc} numberOfLines={2}>{item.description || 'No description provided.'}</Text>
            </View>
            <View style={styles.listMeta}>
                <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <Text style={[styles.metaText, item.is_private && styles.privateText]}>
                    {item.is_private ? 'Private' : 'Public'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#7c3aed" />
                    <Text style={styles.loadingText}>Loading lists...</Text>
                </View>
            ) : (
                <FlatList
                    data={lists}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>You haven't created any lists yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0f172a' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },
    primaryButton: { backgroundColor: '#7c3aed', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    loadingText: { marginTop: 16, color: '#64748b' },
    headerContainer: { marginBottom: 24 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    formContainer: { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 20, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
    formTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    input: { backgroundColor: 'rgba(0,0,0,0.2)', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16, marginBottom: 16 },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    switchLabel: { color: '#94a3b8', fontSize: 16 },
    listContent: { padding: 16, paddingBottom: 40 },
    emptyContainer: { alignItems: 'center', padding: 40, borderWidth: 2, borderColor: '#334155', borderStyle: 'dashed', borderRadius: 8 },
    emptyText: { fontSize: 16, color: '#94a3b8', textAlign: 'center' },
    listItem: { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 20, borderRadius: 12, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    listInfo: { flex: 1, marginRight: 16 },
    listName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    listDesc: { fontSize: 14, color: '#94a3b8' },
    listMeta: { alignItems: 'flex-end', justifyContent: 'center' },
    metaText: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    privateText: { color: '#7c3aed', fontWeight: 'bold' }
});
