import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../infrastructure/auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export function RegisterScreen() {
    const { t } = useTranslation();
    const { register } = useAuth();
    const navigation = useNavigation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError(t('auth.error_required', 'Todos os campos são obrigatórios'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('auth.password_mismatch', 'As senhas não coincidem'));
            return;
        }
        if (password.length < 6) {
            setError(t('auth.password_too_short', 'A senha deve ter no mínimo 6 caracteres'));
            return;
        }
        try {
            setError(null);
            setIsLoading(true);
            await register(email, password, name);
        } catch (err: any) {
            setError(err.message || t('auth.register_error', 'Erro ao criar conta'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoIcon}>
                        <MaterialIcons name="palette" size={32} color="#E8752A" />
                    </View>
                    <Text style={styles.title}>{t('auth.register_title', 'Criar Conta')}</Text>
                    <Text style={styles.subtitle}>Cadastre-se para começar a conservar</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.label}>{t('auth.name', 'Nome')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Seu nome completo"
                        placeholderTextColor="#B0A898"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>{t('auth.email', 'E-mail')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="seu@email.com"
                        placeholderTextColor="#B0A898"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>{t('auth.password', 'Senha')}</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Mínimo 6 caracteres"
                            placeholderTextColor="#B0A898"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            testID="password-visibility-toggle"
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <MaterialIcons
                                name={showPassword ? 'visibility-off' : 'visibility'}
                                size={22}
                                color="#B0A898"
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>{t('auth.confirm_password', 'Confirmar Senha')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Repita a senha"
                        placeholderTextColor="#B0A898"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        testID="register-button"
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{t('auth.register', 'Cadastrar')}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.loginText}>
                            {t('auth.already_have_account', 'Já tem uma conta?')}{' '}
                            <Text style={styles.loginBold}>{t('auth.login', 'Entrar')}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F0',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoIcon: {
        width: 70,
        height: 70,
        borderRadius: 18,
        backgroundColor: '#F5EDE3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 8,
        marginTop: 14,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E0D8',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1A1A2E',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E0D8',
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#1A1A2E',
    },
    eyeButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    errorText: {
        color: '#E63946',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 12,
    },
    button: {
        backgroundColor: '#D4883A',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 17,
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: {
        color: '#888',
        fontSize: 14,
    },
    loginBold: {
        color: '#E8752A',
        fontWeight: 'bold',
    },
});
