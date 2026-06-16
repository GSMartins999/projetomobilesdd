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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../infrastructure/auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { AuthErrorHelper } from '../../infrastructure/auth/AuthErrorHelper';

export function LoginScreen() {
    const { t } = useTranslation();
    const { login, isLoading, isSupabaseReady } = useAuth();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            setError(AuthErrorHelper.translate(err, t('auth.invalid_credentials')));
        }
    };

    return (
        <View style={styles.container}>
            <LoadingOverlay visible={isLoading} message="Entrando..." />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom + 20, 40) }
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo Area */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIcon}>
                            <MaterialIcons name="palette" size={36} color="#E8752A" />
                        </View>
                        <Text style={styles.title}>Curata</Text>
                        <Text style={styles.subtitle}>Acesso ao sistema de conservação</Text>
                    </View>

                    {/* Warning: Supabase not configured */}
                    {!isSupabaseReady && (
                        <View style={styles.warningBanner}>
                            <MaterialIcons name="warning" size={20} color="#856404" />
                            <Text style={styles.warningText}>
                                Supabase não configurado. Crie o arquivo .env com as credenciais do projeto.
                            </Text>
                        </View>
                    )}

                    {/* Form */}
                    <View style={styles.form}>
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
                                placeholder="Sua senha"
                                placeholderTextColor="#B0A898"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                                testID="password-toggle"
                            >
                                <MaterialIcons
                                    name={showPassword ? 'visibility-off' : 'visibility'}
                                    size={22}
                                    color="#B0A898"
                                />
                            </TouchableOpacity>
                        </View>

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <TouchableOpacity
                            testID="login-button"
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>{t('auth.login', 'Entrar')}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotButton}>
                            <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.registerLink}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.registerText}>
                                {t('auth.no_account', 'Não tem uma conta?')}{' '}
                                <Text style={styles.registerBold}>{t('auth.register', 'Cadastrar')}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>CURATA • CONSERVAÇÃO DE ARTE</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
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
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: '#F5EDE3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
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
        marginTop: 16,
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
    forgotButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    forgotText: {
        color: '#E8752A',
        fontSize: 14,
        fontWeight: '500',
    },
    registerLink: {
        alignItems: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#888',
        fontSize: 14,
    },
    registerBold: {
        color: '#E8752A',
        fontWeight: 'bold',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        borderWidth: 1,
        borderColor: '#FFEEBA',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        gap: 10,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#856404',
        lineHeight: 18,
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
    },
    footerText: {
        fontSize: 12,
        color: '#B0A898',
        letterSpacing: 2,
    },
});
