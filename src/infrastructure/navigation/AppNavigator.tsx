import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../../infrastructure/auth/AuthContext';

// Screens
import { LoginScreen } from '../../presentation/screens/LoginScreen';
import { MapScreen } from '../../presentation/screens/MapScreen';
import { SearchScreen } from '../../presentation/screens/SearchScreen';
import { DashboardScreen } from '../../presentation/screens/DashboardScreen';
import { ProfileScreen } from '../../presentation/screens/ProfileScreen';
import { ArtworkFormScreen } from '../../presentation/screens/ArtworkFormScreen';
import { InspectionFormScreen } from '../../presentation/screens/InspectionFormScreen';
import { InspectionHistoryScreen } from '../../presentation/screens/InspectionHistoryScreen';
import { InspectionDetailScreen } from '../../presentation/screens/InspectionDetailScreen';
import { OnboardingScreen } from '../../presentation/screens/OnboardingScreen';
import { CameraScreen } from '../../presentation/screens/CameraScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let icon = '📍';
                    if (route.name === 'Mapa') icon = '🗺️';
                    else if (route.name === 'Busca') icon = '🔍';
                    else if (route.name === 'Dashboard') icon = '📊';
                    else if (route.name === 'Perfil') icon = '👤';
                    return <Text style={{ fontSize: size }}>{icon}</Text>;
                },
                tabBarActiveTintColor: '#2A4D69',
                tabBarInactiveTintColor: '#999',
            })}
        >
            <Tab.Screen name="Mapa" component={MapScreen} />
            <Tab.Screen name="Busca" component={SearchScreen} />
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null; // Splash screen would go here
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabNavigator} />
                        <Stack.Screen name="ArtworkForm" component={ArtworkFormScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="InspectionForm" component={InspectionFormScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="InspectionHistory" component={InspectionHistoryScreen} />
                        <Stack.Screen name="InspectionDetail" component={InspectionDetailScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
