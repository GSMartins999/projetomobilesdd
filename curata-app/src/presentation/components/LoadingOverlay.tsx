import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export function LoadingOverlay({ visible, message = 'Carregando...' }: LoadingOverlayProps) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#E8752A" />
                    <Text style={styles.text}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 30,
        paddingVertical: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        minWidth: 200,
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
        textAlign: 'center',
    },
});
