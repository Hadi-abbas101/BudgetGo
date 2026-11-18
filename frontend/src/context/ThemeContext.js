import React, { createContext, useState, useContext } from 'react';

// Thème BLEU (les clés gardent les noms "purple"/"purpleL" = couleur d'accent)
const SOMBRE = {
  fond: '#0D1117',      
  surface: '#161C28',
  surface2: '#1C2433',
  surface3: '#273141',
  bordure: 'rgba(255,255,255,0.08)',
  bordure2: 'rgba(255,255,255,0.14)',
  texte: '#FFFFFF',
  muted: '#9CA3AF',
  dim: '#6B7280',
  purple: '#2a54c5',    
  purpleL: '#5b96df',  
  or: '#F59E0B',
  vert: '#10b93d',
  rouge: '#e52222',
};

const CLAIR = {
  fond: '#F0F5FF',     
  surface: '#FFFFFF',
  surface2: '#EAF1FF',
  surface3: '#DBE8FF',
  bordure: 'rgba(0,0,0,0.07)',
  bordure2: 'rgba(0,0,0,0.12)',
  texte: '#1F2937',
  muted: '#6B7280',
  dim: '#9CA3AF',
  purple: '#4388dd',    
  purpleL: '#2a54c5',   
  or: '#D97706',
  vert: '#10b93d',
  rouge: '#e52222',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [estSombre, setEstSombre] = useState(true);

  const toggleTheme = () => setEstSombre(prev => !prev);
  const C = estSombre ? SOMBRE : CLAIR;

  return (
    <ThemeContext.Provider value={{ C, estSombre, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
