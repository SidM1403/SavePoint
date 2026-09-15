import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

export default function ReviewForm({ trackingId, initialRating, initialReview, onSaved }) {
    const [rating, setRating] = useState(initialRating ? initialRating.toString() : '');
    const [review, setReview] = useState(initialReview || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.put(`/library/${trackingId}`, {
                rating: rating ? parseInt(rating) : null,
                review
            });
            if (onSaved) onSaved(res.data);
        } catch (err) {
            console.error('Failed to save review', err);
            Alert.alert('Error', 'Failed to save review. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Review</Text>
            
            <View style={styles.formGroup}>
                <Text style={styles.label}>Rating (1-10)</Text>
                <TextInput 
                    style={styles.inputRating}
                    value={rating}
                    onChangeText={setRating}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="No Rating"
                    placeholderTextColor="#64748b"
                />
            </View>
            
            <View style={styles.formGroup}>
                <Text style={styles.label}>Review Text</Text>
                <TextInput 
                    style={styles.inputReview}
                    value={review}
                    onChangeText={setReview}
                    multiline
                    numberOfLines={4}
                    placeholder="Write your thoughts about the game here..."
                    placeholderTextColor="#64748b"
                    textAlignVertical="top"
                />
            </View>
            
            <TouchableOpacity 
                style={[styles.button, saving && styles.buttonDisabled]} 
                onPress={handleSave} 
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Save Review</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
        marginBottom: 8,
    },
    inputRating: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        color: '#fff',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 8,
        padding: 12,
        width: 120,
    },
    inputReview: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        color: '#fff',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 8,
        padding: 14,
        minHeight: 120,
    },
    button: {
        backgroundColor: '#7c3aed',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
