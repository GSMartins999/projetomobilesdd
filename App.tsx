import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Infrastructure
import './src/infrastructure/i18n';
import { DIProvider } from './src/infrastructure/di/DIContext';
import { AuthProvider } from './src/infrastructure/auth/AuthContext';
import { SyncProvider } from './src/infrastructure/sync/SyncContext';
import { AppNavigator } from './src/infrastructure/navigation/AppNavigator';

// Data layer
import { initializeDatabase, db } from './src/data/db/client';
import { supabase } from './src/data/supabaseClient';
import { ArtworkRepositoryImpl } from './src/data/repositories/ArtworkRepositoryImpl';
import { InspectionRepositoryImpl } from './src/data/repositories/InspectionRepositoryImpl';
import { PhotoRepositoryImpl } from './src/data/repositories/PhotoRepositoryImpl';
import { MockAuthRepositoryImpl } from './src/data/repositories/MockAuthRepositoryImpl';
import { SyncServiceImpl } from './src/data/services/SyncServiceImpl';

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function bootstrap() {
            try {
                await initializeDatabase();
                setIsReady(true);
            } catch (e: any) {
                console.error('[App] Bootstrap error:', e);
                setError(e.message || 'Erro ao inicializar o app');
            }
        }
        bootstrap();
    }, []);

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorTitle}>❌ Erro</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!isReady) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2A4D69" />
                <Text style={styles.loadingText}>Inicializando Curata...</Text>
            </View>
        );
    }

    // Criar instâncias dos repositórios
    const artworkRepository = new ArtworkRepositoryImpl(db);
    const inspectionRepository = new InspectionRepositoryImpl(db);
    const photoRepository = new PhotoRepositoryImpl(db);
    const authRepository = new MockAuthRepositoryImpl();
    const syncService = new SyncServiceImpl(
        artworkRepository,
        inspectionRepository,
        photoRepository,
        supabase
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <DIProvider values={{
                    artworkRepository,
                    inspectionRepository,
                    photoRepository,
                    authRepository,
                    syncService,
                }}>
                    <AuthProvider>
                        <SyncProvider>
                            <AppNavigator />
                        </SyncProvider>
                    </AuthProvider>
                </DIProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 30,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#2A4D69',
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#E63946',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});
