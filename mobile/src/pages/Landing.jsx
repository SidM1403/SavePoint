import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

export default function Landing() {
    const navigation = useNavigation();
    const { user, loading } = useContext(AuthContext);

    useEffect(() => {
        if (!loading && user) {
            navigation.replace('Dashboard');
        }
    }, [user, loading, navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <Text style={styles.logo}>SavePoint</Text>
                    <Text style={styles.tagline}>Track, review, and discover your next favorite game.</Text>
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.primaryButtonText}>Get Started</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.secondaryButtonText}>I already have an account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
    },
    logo: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 18,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 28,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#7c3aed',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});
