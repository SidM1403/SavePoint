import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Register({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async () => {
        if (!username || !email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/auth/register', { username, email, password });
            await login(res.data.token, res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.glassPanel}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create an Account</Text>
                    <Text style={styles.subtitle}>Start tracking your gaming journey today.</Text>
                </View>
                
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="HeroOfTime" 
                            placeholderTextColor="#888"
                            value={username} 
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="name@example.com" 
                            placeholderTextColor="#888"
                            value={email} 
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="••••••••" 
                            placeholderTextColor="#888"
                            value={password} 
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleSubmit} 
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Sign in</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    glassPanel: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        padding: 30,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        color: '#94a3b8',
        textAlign: 'center',
    },
    errorText: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        textAlign: 'center',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
    },
    input: {
        padding: 14,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        borderColor: '#334155',
        color: '#fff',
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#7c3aed',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: '#94a3b8',
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    }
});
