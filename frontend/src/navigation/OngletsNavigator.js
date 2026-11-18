import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import AccueilTabScreen from '../screens/dashboard/AccueilTabScreen';
import PlanScreen from '../screens/dashboard/PlanScreen';
import DepensesScreen from '../screens/dashboard/DepensesScreen';
import ComptesScreen from '../screens/dashboard/ComptesScreen';
import RapportScreen from '../screens/dashboard/RapportScreen';

const Tab = createBottomTabNavigator();

// icone = nom Ionicons (version "-outline" inactive, version pleine active)
const ONGLETS = [
  { name: 'Accueil', composant: AccueilTabScreen, icone: 'home', label: 'Accueil' },
  { name: 'Plan', composant: PlanScreen, icone: 'wallet', label: 'Plan' },
  { name: 'Depenses', composant: DepensesScreen, icone: 'cash', label: 'Dépenses' },
  { name: 'Comptes', composant: ComptesScreen, icone: 'business', label: 'Comptes' },
  { name: 'Analyse', composant: RapportScreen, icone: 'pie-chart', label: 'Analyse' },
];

export default function OngletsNavigator() {
  const { C } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.purpleL,
        tabBarInactiveTintColor: C.dim,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.bordure,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      {ONGLETS.map(o => (
        <Tab.Screen
          key={o.name}
          name={o.name}
          component={o.composant}
          options={{
            tabBarLabel: o.label,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? o.icone : `${o.icone}-outline`} size={size ?? 24} color={color} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
