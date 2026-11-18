import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import AccueilScreen from '../screens/auth/AccueilScreen';
import ConnexionScreen from '../screens/auth/ConnexionScreen';
import InscriptionScreen from '../screens/auth/InscriptionScreen';
import ParametresScreen from '../screens/dashboard/ParametresScreen';
import OngletsNavigator from './OngletsNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { utilisateur, initialisation } = useAuth();
  const { C } = useTheme();

  // Tant qu'on vérifie la session sauvegardée, on affiche un écran de chargement
  // (évite de faire clignoter la page d'accueil avant de basculer sur les onglets).
  if (initialisation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.fond }}>
        <ActivityIndicator size="large" color={C.purple} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {utilisateur ? (
          <>
            <Stack.Screen name="Onglets" component={OngletsNavigator} />
            <Stack.Screen name="Parametres" component={ParametresScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Accueil" component={AccueilScreen} />
            <Stack.Screen name="Connexion" component={ConnexionScreen} />
            <Stack.Screen name="Inscription" component={InscriptionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
