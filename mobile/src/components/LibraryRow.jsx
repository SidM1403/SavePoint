import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const STATUS_COLORS = {
    'playing': { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', border: '#3b82f6' },
    'completed': { bg: 'rgba(16, 185, 129, 0.2)', text: '#86efac', border: '#10b981' },
    'dropped': { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: '#ef4444' },
    'want_to_play': { bg: 'rgba(245, 158, 11, 0.2)', text: '#fcd34d', border: '#f59e0b' }
};

export default function LibraryRow({ entry, onUpdate, onRemove }) {
    const navigation = useNavigation();
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState(entry.status);
    const [rating, setRating] = useState(entry.rating ? entry.rating.toString() : '');
    
    const handleSave = async () => {
        try {
            const res = await axios.put(`/library/${entry.tracking_id}`, {
                status, 
                rating: rating ? parseInt(rating) : null
            });
            onUpdate(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update', err);
            Alert.alert('Error', 'Failed to update library entry.');
        }
    };

    const handleRemove = () => {
        Alert.alert(
            "Remove Game",
            "Are you sure you want to remove this game from your library?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Remove", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`/library/${entry.tracking_id}`);
                            onRemove(entry.tracking_id);
                        } catch (err) {
                            console.error('Failed to remove', err);
                            Alert.alert('Error', 'Failed to remove game.');
                        }
                    }
                }
            ]
        );
    };

    const currentColors = STATUS_COLORS[entry.status] || { bg: '#334155', text: '#94a3b8', border: 'transparent' };

    return (
        <View style={[styles.card, { borderLeftColor: currentColors.border }]}>
            <TouchableOpacity onPress={() => navigation.navigate('GameDetail', { id: entry.rawg_id })}>
                <Image 
                    source={{ uri: entry.cover_url || 'https://via.placeholder.com/90x120' }} 
                    style={styles.image}
                />
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('GameDetail', { id: entry.rawg_id })}>
                    <Text style={styles.title} numberOfLines={2}>{entry.title}</Text>
                </TouchableOpacity>

                {isEditing ? (
                    <View style={styles.editContainer}>
                        {/* Status Pills */}
                        <View style={styles.pillsContainer}>
                            {['playing', 'completed', 'dropped', 'want_to_play'].map(s => (
                                <TouchableOpacity 
                                    key={s} 
                                    onPress={() => setStatus(s)}
                                    style={[
                                        styles.statusPill, 
                                        status === s ? { backgroundColor: STATUS_COLORS[s].border } : {}
                                    ]}
                                >
                                    <Text style={{ color: status === s ? '#fff' : '#cbd5e1', fontSize: 10 }}>
                                        {s.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        {/* Rating Input */}
                        <View style={styles.ratingEditContainer}>
                            <Text style={styles.label}>Rating (1-10):</Text>
                            <TextInput 
                                style={styles.ratingInput}
                                value={rating}
                                onChangeText={setRating}
                                keyboardType="number-pad"
                                maxLength={2}
                            />
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.btnTextPrimary}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={styles.metaRow}>
                            <View style={[styles.statusBadge, { backgroundColor: currentColors.bg, borderColor: currentColors.border }]}>
                                <Text style={[styles.statusText, { color: currentColors.text }]}>
                                    {entry.status.replace('_', ' ').toUpperCase()}
                                </Text>
                            </View>
                            
                            {!!entry.rating && (
                                <Text style={styles.ratingText}>★ {entry.rating}/10</Text>
                            )}
                        </View>

                        {!!entry.review && (
                            <Text style={styles.reviewText} numberOfLines={2}>"{entry.review}"</Text>
                        )}
                        
                        <Text style={styles.dateText}>
                            Added on {new Date(entry.added_at).toLocaleDateString()}
                        </Text>
                    </>
                )}
            </View>

            <View style={styles.buttonContainer}>
                {!isEditing && (
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setIsEditing(true)}>
                        <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
                    <Text style={styles.removeBtnText}>X</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    image: {
        width: 80,
        height: 110,
        borderRadius: 8,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    ratingText: {
        color: '#fbbf24',
        fontWeight: 'bold',
        fontSize: 12,
    },
    reviewText: {
        color: '#94a3b8',
        fontStyle: 'italic',
        fontSize: 12,
        marginBottom: 8,
    },
    dateText: {
        color: '#64748b',
        fontSize: 10,
    },
    buttonContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginLeft: 12,
    },
    iconBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#475569',
    },
    btnText: {
        color: '#cbd5e1',
        fontSize: 12,
    },
    removeBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    removeBtnText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: 'bold',
    },
    editContainer: {
        marginTop: 8,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    statusPill: {
        backgroundColor: '#334155',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
    },
    ratingEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    label: {
        color: '#94a3b8',
        fontSize: 12,
    },
    ratingInput: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        borderColor: '#475569',
        color: '#fff',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        width: 60,
        textAlign: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    saveBtn: {
        backgroundColor: '#7c3aed',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    btnTextPrimary: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cancelBtn: {
        borderWidth: 1,
        borderColor: '#475569',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    }
});
