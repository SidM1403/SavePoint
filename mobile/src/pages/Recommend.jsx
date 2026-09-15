import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Recommend() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [mood, setMood] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const navigation = useNavigation();

    const handleSubmit = async () => {
        if (!mood.trim()) return;

        setLoading(true);
        setError('');
        setSubmitted(true);
        setRecommendations([]);

        try {
            const res = await axios.post('/ai/recommend', { mood });
            setRecommendations(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to get recommendations. Claude API might be unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSubmitted(false);
        setMood('');
    };

    if (authLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.title}>AI Game Matchmaker</Text>
                <Text style={styles.subtitle}>Please log in to get personalized game recommendations based on your library.</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.primaryButtonText}>Log In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.sparkle}>✨</Text>
                <Text style={styles.title}>AI Game Matchmaker</Text>
                <Text style={styles.subtitle}>
                    Tell the AI what you're in the mood for. It will look at your personal library 
                    to ensure it doesn't recommend games you've already played.
                </Text>
            </View>

            {!submitted || error ? (
                <View style={styles.formPanel}>
                    <TextInput 
                        style={styles.textArea}
                        value={mood}
                        onChangeText={setMood}
                        placeholder="e.g. 'I want a dark, story-heavy RPG with turn-based combat' or 'Something relaxing after a long day of work...'"
                        placeholderTextColor="#64748b"
                        multiline
                        textAlignVertical="top"
                    />
                    <TouchableOpacity 
                        style={[styles.primaryButton, loading && styles.disabledButton]} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.primaryButtonText}>
                            {loading ? 'Consulting the Oracle...' : 'Get Recommendations'}
                        </Text>
                    </TouchableOpacity>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
            ) : (
                <View style={styles.resultsContainer}>
                    {loading ? (
                        <View style={styles.loadingPanel}>
                            <ActivityIndicator size="large" color="#7c3aed" style={{ marginBottom: 16 }} />
                            <Text style={styles.loadingTitle}>AI is analyzing your mood...</Text>
                            <Text style={styles.loadingSubtitle}>Scanning thousands of games and comparing with your library.</Text>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.resultsHeader}>
                                <Text style={styles.resultsTitle}>Your Curated Picks</Text>
                                <TouchableOpacity style={styles.outlineButton} onPress={resetForm}>
                                    <Text style={styles.outlineButtonText}>Try Another Mood</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {recommendations.map((rec, i) => (
                                <View key={i} style={styles.recCard}>
                                    <View style={styles.recHeader}>
                                        <Text style={styles.recTitle}>{rec.title}</Text>
                                        <TouchableOpacity 
                                            style={styles.smallOutlineButton}
                                            onPress={() => navigation.navigate('Search', { q: rec.title })}
                                        >
                                            <Text style={styles.outlineButtonText}>Search</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {rec.genres && (
                                        <View style={styles.genreTags}>
                                            {rec.genres.map(g => (
                                                <View key={g} style={styles.genreTag}>
                                                    <Text style={styles.genreTagText}>{g}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                    
                                    <View style={styles.reasonBox}>
                                        <Text style={styles.reasonLabel}>Why this fits: </Text>
                                        <Text style={styles.reasonText}>{rec.reason}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    contentContainer: { padding: 24, paddingBottom: 60 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0f172a' },
    header: { alignItems: 'center', marginBottom: 32 },
    sparkle: { fontSize: 48, marginBottom: 12 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24 },
    formPanel: { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
    textArea: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 16, color: '#fff', fontSize: 16, minHeight: 140, marginBottom: 20 },
    primaryButton: { backgroundColor: '#7c3aed', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
    disabledButton: { opacity: 0.7 },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 8, marginTop: 16, textAlign: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
    resultsContainer: { marginTop: 10 },
    loadingPanel: { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 40, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#7c3aed', borderStyle: 'dashed' },
    loadingTitle: { color: '#7c3aed', fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
    loadingSubtitle: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    resultsTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    outlineButton: { borderWidth: 1, borderColor: '#7c3aed', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
    smallOutlineButton: { borderWidth: 1, borderColor: '#7c3aed', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    outlineButtonText: { color: '#7c3aed', fontWeight: 'bold', fontSize: 14 },
    recCard: { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: 20, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#7c3aed' },
    recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    recTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, marginRight: 12 },
    genreTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    genreTag: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 16 },
    genreTagText: { color: '#7c3aed', fontSize: 12 },
    reasonBox: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8 },
    reasonLabel: { color: '#fff', fontWeight: 'bold', marginBottom: 4 },
    reasonText: { color: '#94a3b8', fontSize: 14, lineHeight: 22 }
});
