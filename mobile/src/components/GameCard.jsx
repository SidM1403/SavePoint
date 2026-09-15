import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function GameCard({ game }) {
    const navigation = useNavigation();
    
    // Generate a slight random rotation between -2deg and 2deg
    const randomRotation = useMemo(() => Math.random() * 4 - 2, []);

    return (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('GameDetail', { id: game.id })}
            style={[styles.container, { transform: [{ rotate: `${randomRotation}deg` }] }]}
        >
            <View style={styles.card}>
                <Image 
                    source={{ uri: game.cover_url || 'https://via.placeholder.com/300x400?text=No+Image' }} 
                    style={styles.image} 
                />
                
                <View style={styles.overlay}>
                    <Text style={styles.title} numberOfLines={1}>
                        {game.title}
                    </Text>
                    
                    <View style={styles.metaRow}>
                        <Text style={styles.year}>
                            {game.release_date && game.release_date !== 'N/A' ? new Date(game.release_date).getFullYear() : 'TBA'}
                        </Text>
                        {!!game.rawg_rating && (
                            <Text style={styles.rating}>
                                ★ {game.rawg_rating}
                            </Text>
                        )}
                    </View>

                    {game.genres && game.genres.length > 0 && (
                        <View style={styles.genresRow}>
                            {game.genres.slice(0, 2).map((genre, index) => (
                                <View key={index.toString()} style={styles.genreBadge}>
                                    <Text style={styles.genreText}>
                                        {genre.name || genre} 
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 160,
        height: 220,
        margin: 8,
    },
    card: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 40,
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.8)', // approximate gradient
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    year: {
        color: '#94a3b8',
        fontSize: 12,
    },
    rating: {
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: 'bold',
    },
    genresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
        gap: 4,
    },
    genreBadge: {
        backgroundColor: '#334155',
        borderWidth: 1,
        borderColor: '#475569',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    genreText: {
        color: '#cbd5e1',
        fontSize: 10,
    }
});
