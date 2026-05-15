import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useDI } from '../../infrastructure/di/DIContext';
import { GenerateReportUseCase } from '../../domain/usecases/GenerateReportUseCase';

export function ReportGeneratorScreen({ route }: any) {
    const { artworkId } = route?.params || {};
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const { artworkRepository, inspectionRepository, photoRepository } = useDI();
    
    const [reportTitle, setReportTitle] = useState(t('report.subtitle_default', { defaultValue: 'Relatório Técnico' }));
    const [selectedFormat, setSelectedFormat] = useState('PDF');
    const [isGenerating, setIsGenerating] = useState(false);

    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const onStartChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) setEndDate(selectedDate);
    };

    const [sections, setSections] = useState([
        { id: '1', key: 'summary', title: t('report.section_summary'), selected: true },
        { id: '2', key: 'status', title: t('report.section_status'), selected: true },
        { id: '3', key: 'photos', title: t('report.section_photos'), selected: true },
        { id: '4', key: 'geo', title: t('report.section_geo'), selected: false },
        { id: '5', key: 'history', title: t('report.section_history'), selected: false },
    ]);

    const handleGenerate = async () => {
        if (!artworkId) {
            Alert.alert(t('common.error'), 'Selecione uma obra primeiro');
            return;
        }

        setIsGenerating(true);
        try {
            const artwork = await artworkRepository.findById(artworkId);
            if (!artwork) throw new Error('Obra não encontrada');

            const inspections = await inspectionRepository.findByArtworkId(artworkId);
            
            const useCase = new GenerateReportUseCase(photoRepository);
            await useCase.execute(artwork, inspections);
            
            Alert.alert('Sucesso', 'Relatório gerado com sucesso!');
        } catch (error: any) {
            console.error(error);
            Alert.alert(t('common.error'), error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleSection = (id: string) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#1A1A2E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('report.title')}</Text>
                <TouchableOpacity>
                    <MaterialIcons name="help-outline" size={24} color="#1A1A2E" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('report.subtitle')}</Text>
                    <TextInput
                        style={styles.input}
                        value={reportTitle}
                        onChangeText={setReportTitle}
                        placeholder={t('report.subtitle_placeholder', { defaultValue: 'Ex: Relatório Trimestral' })}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('report.period')}</Text>
                    <View style={styles.dateRow}>
                        <TouchableOpacity style={styles.datePicker} onPress={() => setShowStartPicker(true)}>
                            <MaterialIcons name="calendar-today" size={18} color="#E8752A" />
                            <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <MaterialIcons name="arrow-forward" size={18} color="#B0A898" />
                        <TouchableOpacity style={styles.datePicker} onPress={() => setShowEndPicker(true)}>
                            <MaterialIcons name="calendar-today" size={18} color="#E8752A" />
                            <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={onStartChange}
                        />
                    )}
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={onEndChange}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('report.sections')}</Text>
                    {sections.map(section => (
                        <TouchableOpacity 
                            key={section.id} 
                            style={styles.checkboxRow}
                            onPress={() => toggleSection(section.id)}
                        >
                            <View style={[styles.checkbox, section.selected && styles.checkboxActive]}>
                                {section.selected && <MaterialIcons name="check" size={16} color="#FFF" />}
                            </View>
                            <Text style={styles.checkboxText}>{section.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('report.format')}</Text>
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
                    style={[styles.generateButton, isGenerating && { opacity: 0.7 }]}
                    onPress={handleGenerate}
                    disabled={isGenerating}
                >
                    <MaterialIcons name="picture-as-pdf" size={20} color="#FFF" />
                    <Text style={styles.generateButtonText}>
                        {isGenerating ? t('common.loading') : t('report.export', { format: selectedFormat })}
                    </Text>
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
