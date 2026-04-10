import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
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
import { RegisterScreen } from '../../presentation/screens/RegisterScreen';
import { ArtworkDetailScreen } from '../../presentation/screens/ArtworkDetailScreen';
import { NotificationsScreen } from '../../presentation/screens/NotificationsScreen';
import { ReportGeneratorScreen } from '../../presentation/screens/ReportGeneratorScreen';
import { PdfPreviewScreen } from '../../presentation/screens/PdfPreviewScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof MaterialIcons.glyphMap = 'location-on';
                    if (route.name === 'Mapa') iconName = 'map';
                    else if (route.name === 'Busca') iconName = 'search';
                    else if (route.name === 'Dashboard') iconName = 'dashboard';
                    else if (route.name === 'Perfil') iconName = 'person';
                    return <MaterialIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#E8752A',
                tabBarInactiveTintColor: '#B0A898',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#F0E8E0',
                    borderTopWidth: 1,
                    paddingBottom: 6,
                    paddingTop: 6,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
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
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabNavigator} />
                        <Stack.Screen name="ArtworkForm" component={ArtworkFormScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="InspectionForm" component={InspectionFormScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="InspectionHistory" component={InspectionHistoryScreen} />
                        <Stack.Screen name="InspectionDetail" component={InspectionDetailScreen} />
                        <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="ReportGenerator" component={ReportGeneratorScreen} />
                        <Stack.Screen name="PdfPreview" component={PdfPreviewScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
