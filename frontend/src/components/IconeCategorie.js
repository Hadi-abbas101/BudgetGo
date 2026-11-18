import React from 'react';
import { Ionicons } from '@expo/vector-icons';

// Affiche l'icône d'une catégorie à partir du nom Ionicons stocké en base.
// Si le nom est absent ou inconnu (ancienne donnée emoji, catégorie custom), on retombe sur une icône neutre.
export default function IconeCategorie({ nom, size = 16, color }) {
  const valide = nom && Ionicons.glyphMap && Ionicons.glyphMap[nom];
  return <Ionicons name={valide ? nom : 'pricetag'} size={size} color={color} />;
}
