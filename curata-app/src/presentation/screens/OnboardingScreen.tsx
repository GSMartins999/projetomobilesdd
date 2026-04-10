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
import { MaterialIcons } from '@expo/vector-icons';
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
    icon: keyof typeof MaterialIcons.glyphMap;
    actionLabel: string;
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
            title: 'Fotografe obras de arte',
            description: 'Precisamos de acesso à câmera para documentar obras em campo',
            type: 'camera',
            icon: 'photo-camera',
            actionLabel: 'Permitir câmera',
        },
        {
            id: '2',
            title: 'Localize obras com precisão',
            description: 'O GPS nos ajuda a mapear obras e detectar duplicatas automaticamente',
            type: 'location',
            icon: 'location-on',
            actionLabel: 'Permitir localização',
        },
        {
            id: '3',
            title: 'Tudo pronto!',
            description: 'Você já pode começar a catalogar e descobrir novas obras de arte ao seu redor.',
            type: 'finish',
            icon: 'check-circle',
            actionLabel: 'Começar',
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

    const handleSkip = async () => {
        await requestNotificationPermission();
        await finishOnboarding();
    };

    const renderSlide = ({ item }: { item: Slide }) => {
        return (
            <View style={styles.slide}>
                {/* Icon area */}
                <View style={styles.iconArea}>
                    <View style={styles.iconCircle}>
                        <MaterialIcons name={item.icon} size={40} color="#E8752A" />
                    </View>
                </View>

                {/* Text */}
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideDescription}>{item.description}</Text>

                {/* Permission button */}
                {item.type === 'camera' && (
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestCameraPermission}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.permissionButtonText}>{item.actionLabel}</Text>
                    </TouchableOpacity>
                )}

                {item.type === 'location' && (
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestLocationPermission}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="location-on" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.permissionButtonText}>{item.actionLabel}</Text>
                    </TouchableOpacity>
                )}

                {item.type === 'finish' && (
                    <TouchableOpacity
                        style={styles.finishButton}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.finishButtonText}>Começar</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Skip button */}
            {currentSlideIndex < slides.length - 1 && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Pular</Text>
                </TouchableOpacity>
            )}

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
                scrollEnabled={false}
            />

            {/* Dot indicators */}
            <View style={styles.indicatorContainer}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            currentSlideIndex === index && styles.activeIndicator,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F0',
    },
    skipButton: {
        position: 'absolute',
        top: 55,
        right: 24,
        zIndex: 10,
    },
    skipText: {
        color: '#E8752A',
        fontSize: 16,
        fontWeight: '600',
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 80,
    },
    iconArea: {
        width: 180,
        height: 180,
        borderRadius: 24,
        backgroundColor: '#FDF0E6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8F5F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: 12,
    },
    slideDescription: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    permissionButton: {
        flexDirection: 'row',
        backgroundColor: '#E8752A',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    finishButton: {
        flexDirection: 'row',
        backgroundColor: '#E8752A',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 50,
    },
    indicator: {
        height: 8,
        width: 8,
        backgroundColor: '#D4C8BC',
        marginHorizontal: 4,
        borderRadius: 4,
    },
    activeIndicator: {
        backgroundColor: '#E8752A',
        width: 24,
    },
});
