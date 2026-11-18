import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { DonneesProvider } from './src/context/DonneesContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DonneesProvider>
          <AppNavigator />
        </DonneesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
