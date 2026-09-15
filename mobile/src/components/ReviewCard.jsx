import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReviewCard({ review }) {
    if (!review) return null;

    const dateStr = review.updated_at || review.added_at;
    const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString() : 'Unknown Date';

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {review.username ? review.username.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.username}>{review.username || 'Anonymous'}</Text>
                        <Text style={styles.date}>{formattedDate}</Text>
                    </View>
                </View>
                
                {!!review.rating && (
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>★ {review.rating} / 10</Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.reviewText}>
                {review.review || 'No written review provided.'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#7c3aed', // fallback accent
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    username: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 16,
    },
    date: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    ratingBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    ratingText: {
        color: '#fbbf24',
        fontWeight: 'bold',
        fontSize: 12,
    },
    reviewText: {
        color: '#cbd5e1',
        fontSize: 14,
        lineHeight: 22,
    }
});
