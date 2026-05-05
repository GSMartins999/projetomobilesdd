import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export function ReportGeneratorScreen() {
    const navigation = useNavigation();
    const [reportTitle, setReportTitle] = useState('Relatório Mensal - Abril 2026');
    const [selectedFormat, setSelectedFormat] = useState('PDF');

    const sections = [
        { id: '1', title: 'Resumo Executivo', selected: true },
        { id: '2', title: 'Status de Conservação', selected: true },
        { id: '3', title: 'Fotos das Inspeções', selected: true },
        { id: '4', title: 'Geolocalização', selected: false },
        { id: '5', title: 'Histórico de Intervenções', selected: false },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#1A1A2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Gerar Relatório</Text>
                <TouchableOpacity>
                    <MaterialIcons name="help-outline" size={24} color="#1A1A2E" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>TÍTULO DO RELATÓRIO</Text>
                    <TextInput
                        style={styles.input}
                        value={reportTitle}
                        onChangeText={setReportTitle}
                        placeholder="Ex: Relatório Trimestral"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PERÍODO</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.datePicker}>
                            <MaterialIcons name="calendar-today" size={18} color="#E8752A" />
                            <Text style={styles.dateText}>01/04/2026</Text>
                        </TouchableOpacity>
                        <MaterialIcons name="arrow-forward" size={18} color="#B0A898" />
                        <TouchableOpacity style={styles.datePicker}>
                            <MaterialIcons name="calendar-today" size={18} color="#E8752A" />
                            <Text style={styles.dateText}>30/04/2026</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SEÇÕES INCLUÍDAS</Text>
                    {sections.map(section => (
                        <TouchableOpacity key={section.id} style={styles.checkboxRow}>
                            <View style={[styles.checkbox, section.selected && styles.checkboxActive]}>
                                {section.selected && <MaterialIcons name="check" size={16} color="#FFF" />}
                            </View>
                            <Text style={styles.checkboxText}>{section.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>FORMATO DE EXPORTAÇÃO</Text>
                    <View style={styles.formatRow}>
                        {['PDF', 'Excel', 'CSV'].map(format => (
                            <TouchableOpacity
                                key={format}
                                style={[styles.formatPill, selectedFormat === format && styles.formatPillActive]}
                                onPress={() => setSelectedFormat(format)}
                            >
                                <Text style={[styles.formatPillText, selectedFormat === format && styles.formatPillTextActive]}>
                                    {format}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => alert('Relatório sendo gerado...')}
                >
                    <MaterialIcons name="picture-as-pdf" size={20} color="#FFF" />
                    <Text style={styles.generateButtonText}>Exportar {selectedFormat}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0E8E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B0A898',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#F0E8E0',
        color: '#1A1A2E',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    datePicker: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#F0E8E0',
        gap: 10,
    },
    dateText: {
        fontSize: 14,
        color: '#1A1A2E',
        fontWeight: '500',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#E8E0D8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#E8752A',
        borderColor: '#E8752A',
    },
    checkboxText: {
        fontSize: 15,
        color: '#1A1A2E',
        fontWeight: '500',
    },
    formatRow: {
        flexDirection: 'row',
        gap: 10,
    },
    formatPill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E8E0D8',
        backgroundColor: '#FFF',
    },
    formatPillActive: {
        backgroundColor: '#E8752A',
        borderColor: '#E8752A',
    },
    formatPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    formatPillTextActive: {
        color: '#FFF',
    },
    footer: {
        padding: 20,
        paddingBottom: 32,
        backgroundColor: 'rgba(248, 245, 240, 0.8)',
        borderTopWidth: 1,
        borderTopColor: '#F0E8E0',
    },
    generateButton: {
        backgroundColor: '#E8752A',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#E8752A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    generateButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});
