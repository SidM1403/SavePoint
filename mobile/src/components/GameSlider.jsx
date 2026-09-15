import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function GameSlider({ title, games, numbered = false }) {
    const navigation = useNavigation();

    if (!games || games.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerAccent}>■</Text>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingLeft: numbered ? 40 : 16 }]}
                snapToInterval={240} // approximate width + margin
                decelerationRate="fast"
            >
                {games.map((game, index) => {
                    const rotation = index % 2 === 0 ? '-2deg' : '2deg';
                    
                    return (
                        <TouchableOpacity 
                            key={game.id.toString()}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('GameDetail', { id: game.id })}
                            style={styles.cardWrapper}
                        >
                            {numbered && (
                                <Text style={styles.numberOverlay}>
                                    {index + 1}
                                </Text>
                            )}
                            
                            <View style={[styles.polaroidCard, { transform: [{ rotate: rotation }] }]}>
                                <Image 
                                    source={{ uri: game.cover_url || 'https://via.placeholder.com/220x300' }} 
                                    style={styles.image} 
                                />
                                <View style={styles.overlay}>
                                    <Text style={styles.title} numberOfLines={1}>{game.title}</Text>
                                    <Text style={styles.year}>
                                        {game.release_date && game.release_date !== 'N/A' ? new Date(game.release_date).getFullYear() : 'TBA'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 15,
        gap: 8,
    },
    headerAccent: {
        color: '#7c3aed', // primary accent color
        fontSize: 18,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContent: {
        paddingRight: 16,
    },
    cardWrapper: {
        width: 220,
        marginRight: 20,
        paddingBottom: 20,
    },
    numberOverlay: {
        position: 'absolute',
        left: -30,
        bottom: 0,
        fontSize: 100,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.1)',
        zIndex: -1,
    },
    polaroidCard: {
        height: 300,
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
        paddingTop: 30,
        paddingBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    year: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    }
});
