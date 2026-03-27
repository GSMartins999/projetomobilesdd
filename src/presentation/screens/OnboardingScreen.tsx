import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Alert
} from 'react-native';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { requestNotificationPermission } from '../../infrastructure/notifications/NotificationService';

const { width, height } = Dimensions.get('window');

interface Slide {
    id: string;
    title: string;
    description: string;
    type: 'welcome' | 'camera' | 'location' | 'finish';
}

interface OnboardingScreenProps {
    onFinish?: () => void;
}

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
    const { t } = useTranslation();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const slides: Slide[] = [
        {
            id: '1',
            title: 'Bem-vindo ao Curata',
            description: 'O seu sistema de gestão de patrimônio artístico público.',
            type: 'welcome',
        },
        {
            id: '2',
            title: 'Câmera',
            description: 'Precisamos da câmera para registrar fotos das obras e inspeções.',
            type: 'camera',
        },
        {
            id: '3',
            title: 'Localização',
            description: 'Usamos o GPS para mapear as obras e georreferenciar as inspeções.',
            type: 'location',
        },
        {
            id: '4',
            title: 'Tudo pronto!',
            description: 'Você já pode começar a curadoria do seu patrimônio.',
            type: 'finish',
        },
    ];

    const handleNext = async () => {
        if (currentSlideIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentSlideIndex + 1 });
            setCurrentSlideIndex(currentSlideIndex + 1);
        } else {
            await requestNotificationPermission();
            await finishOnboarding();
        }
    };

    const finishOnboarding = async () => {
        try {
            await SecureStore.setItemAsync('onboarding_completed', 'true');
            if (onFinish) onFinish();
        } catch (error) {
            console.error('Error saving onboarding state:', error);
        }
    };

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão Negada', 'A câmera é necessária para o funcionamento do app.');
        } else {
            handleNext();
        }
    };

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão Negada', 'A localização é necessária para mapear as obras.');
        } else {
            handleNext();
        }
    };

    const renderSlide = ({ item }: { item: Slide }) => {
        return (
            <View style={styles.slide}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>

                {item.type === 'camera' && (
                    <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
                        <Text style={styles.buttonText}>Conceder Permissão de Câmera</Text>
                    </TouchableOpacity>
                )}

                {item.type === 'location' && (
                    <TouchableOpacity style={styles.permissionButton} onPress={requestLocationPermission}>
                        <Text style={styles.buttonText}>Conceder Permissão de Localização</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentSlideIndex(index);
                }}
                scrollEnabled={false} // Forçar uso dos botões/permissões
            />

            <View style={styles.footer}>
                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentSlideIndex === index && styles.activeIndicator
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext} testID="next-button">
                    <Text style={styles.nextButtonText}>
                        {currentSlideIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    slide: {
        width,
        height: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2A4D69',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        height: height * 0.2,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    indicator: {
        height: 10,
        width: 10,
        backgroundColor: '#ddd',
        marginHorizontal: 5,
        borderRadius: 5,
    },
    activeIndicator: {
        backgroundColor: '#2A4D69',
        width: 25,
    },
    nextButton: {
        backgroundColor: '#2A4D69',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    permissionButton: {
        marginTop: 30,
        backgroundColor: '#4B86B4',
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
