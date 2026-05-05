import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export function PdfPreviewScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="close" size={24} color="#1A1A2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Prévia do PDF</Text>
                <TouchableOpacity>
                    <MaterialIcons name="share" size={24} color="#E8752A" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.pdfPlaceholder}>
                    <View style={styles.pdfPage}>
                        <View style={styles.pdfHeader} />
                        <View style={styles.pdfLineShort} />
                        <View style={styles.pdfLineLong} />
                        <View style={styles.pdfLineLong} />
                        <View style={styles.pdfImagePlaceholder} />
                        <View style={styles.pdfLineLong} />
                        <View style={styles.pdfLineLong} />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => alert('Download iniciado...')}
                >
                    <MaterialIcons name="file-download" size={20} color="#FFF" />
                    <Text style={styles.downloadButtonText}>Baixar PDF</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#525659', // Classic PDF viewer background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8F5F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    pdfPlaceholder: {
        width: '100%',
        alignItems: 'center',
    },
    pdfPage: {
        width: '90%',
        aspectRatio: 1 / 1.4, // A4 ratio approx
        backgroundColor: '#FFF',
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    pdfHeader: {
        height: 40,
        backgroundColor: '#F8F5F0',
        marginBottom: 30,
        borderRadius: 4,
    },
    pdfLineShort: {
        height: 10,
        backgroundColor: '#E8E0D8',
        width: '40%',
        marginBottom: 10,
        borderRadius: 2,
    },
    pdfLineLong: {
        height: 10,
        backgroundColor: '#F5EDE3',
        width: '100%',
        marginBottom: 10,
        borderRadius: 2,
    },
    pdfImagePlaceholder: {
        height: 120,
        backgroundColor: '#F5EDE3',
        marginVertical: 20,
        borderRadius: 8,
    },
    footer: {
        padding: 20,
        paddingBottom: 32,
        backgroundColor: '#F8F5F0',
        borderTopWidth: 1,
        borderTopColor: '#F0E8E0',
    },
    downloadButton: {
        backgroundColor: '#E8752A',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    downloadButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});
