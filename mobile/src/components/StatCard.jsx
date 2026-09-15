import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ title, value, color }) {
    return (
        <View style={[styles.card, { borderTopColor: color }]}>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={[styles.value, { color: color }]}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 24,
        flex: 1,
        minWidth: 150,
        margin: 8,
        borderRadius: 8,
        borderTopWidth: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    content: {
        zIndex: 1,
    },
    title: {
        fontSize: 12,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    value: {
        fontSize: 32,
        fontWeight: '900',
    }
});
