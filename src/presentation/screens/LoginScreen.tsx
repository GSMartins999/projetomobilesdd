import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../infrastructure/auth/AuthContext';
import { useTranslation } from 'react-i18next';

export function LoginScreen() {
    const { t } = useTranslation();
    const { login, isLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError(t('auth.error_required', 'E-mail e senha são obrigatórios'));
            return;
        }

        try {
            setError(null);
            await login(email, password);
        } catch (err: any) {
            setError(err.message || t('auth.invalid_credentials'));
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Curata</Text>

            <TextInput
                style={styles.input}
                placeholder={t('auth.email', 'E-mail')}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder={t('auth.password', 'Senha')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.buttonText}>{t('common.loading', 'Carregando...')}</Text>
                    </View>
                ) : (
                    <Text style={styles.buttonText}>{t('auth.login', 'Entrar')}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        color: '#2A4D69',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#2A4D69',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: '#E63946',
        marginBottom: 10,
        textAlign: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
