import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useDonnees, cleMoisDe } from '../../context/DonneesContext';
import IconeCategorie from '../../components/IconeCategorie';

const NOMS_MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const COULEURS = ['#196cd2','#F59E0B','#10B981','#EF4444','#3B82F6','#EC4899','#14B8A6','#A78BFA','#F97316','#64748B'];

export default function RapportScreen() {
  const { C } = useTheme();
  const s = creerStyles(C);
  const { budgetsParMois, chargerBudget, chargerRapport } = useDonnees();

  const [dateSelectionnee, setDateSelectionnee] = useState(new Date());
  const [rapport, setRapport] = useState(null);
  const [chargement, setChargement] = useState(true);

  const cleMois = cleMoisDe(dateSelectionnee);
  const budget = budgetsParMois[cleMois]?.global || 0;

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const data = await chargerRapport(cleMois);
      if (data.succes) setRapport(data);
      chargerBudget(cleMois);
    } catch (e) {
      console.error(e);
    } finally {
      setChargement(false);
    }
  }, [cleMois]);

  useFocusEffect(useCallback(() => { charger(); }, [charger]));

  const moisPrecedent = () => { const d = new Date(dateSelectionnee); d.setMonth(d.getMonth() - 1); setDateSelectionnee(d); };
  const moisSuivant = () => { const d = new Date(dateSelectionnee); d.setMonth(d.getMonth() + 1); setDateSelectionnee(d); };

  const categories = rapport?.par_categorie || [];
  const totalDepenses = rapport?.total_depenses || 0;

  const taille = 200, rayon = 80, largeurTrait = 26;
  const circonference = 2 * Math.PI * rayon;
  let offsetCumule = 0;

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.titre}>Analyse</Text>
        <Text style={s.sousTitre}>Répartition de tes dépenses</Text>

        <View style={s.moisRow}>
          <TouchableOpacity style={s.moisFleche} onPress={moisPrecedent}><Text style={s.moisFlecheTexte}>‹</Text></TouchableOpacity>
          <Text style={s.moisNom}>{NOMS_MOIS[dateSelectionnee.getMonth()]} {dateSelectionnee.getFullYear()}</Text>
          <TouchableOpacity style={s.moisFleche} onPress={moisSuivant}><Text style={s.moisFlecheTexte}>›</Text></TouchableOpacity>
        </View>

        {chargement ? (
          <View style={s.centre}><ActivityIndicator size="large" color={C.main} /></View>
        ) : categories.length === 0 ? (
          <View style={s.carte}>
            <Text style={s.vide}>Aucune dépense ce mois-ci.{'\n'}Ajoute des transactions pour voir ton analyse.</Text>
          </View>
        ) : (
          <>
            <View style={s.carte}>
              <View style={s.donutZone}>
                <Svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`}>
                  <G rotation="-90" origin={`${taille / 2}, ${taille / 2}`}>
                    <Circle cx={taille / 2} cy={taille / 2} r={rayon} stroke={C.surface2} strokeWidth={largeurTrait} fill="none" />
                    {categories.map((cat, i) => {
                      const longueur = (cat.pourcentage / 100) * circonference;
                      const seg = (
                        <Circle key={cat.categorie} cx={taille / 2} cy={taille / 2} r={rayon}
                          stroke={COULEURS[i % COULEURS.length]} strokeWidth={largeurTrait} fill="none"
                          strokeDasharray={`${longueur} ${circonference - longueur}`} strokeDashoffset={-offsetCumule} strokeLinecap="butt" />
                      );
                      offsetCumule += longueur;
                      return seg;
                    })}
                  </G>
                </Svg>
                <View style={s.donutCentre}>
                  <Text style={s.donutLbl}>Dépenses</Text>
                  <Text style={s.donutVal}>{totalDepenses.toFixed(0)} $</Text>
                </View>
              </View>
            </View>

            {budget > 0 && (
              <View style={s.carte}>
                <Text style={s.carteTitre}>Budget vs réel</Text>
                <View style={s.bvrRow}>
                  <Text style={s.bvrLabel}>Dépensé</Text>
                  <Text style={[s.bvrVal, { color: totalDepenses > budget ? C.rouge : C.texte }]}>
                    {totalDepenses.toFixed(2)} $ / {budget.toFixed(2)} $
                  </Text>
                </View>
                <View style={s.barreFond}>
                  <View style={[s.barreRempli, { width: `${Math.min((totalDepenses / budget) * 100, 100)}%`, backgroundColor: totalDepenses > budget ? C.rouge : C.main }]} />
                </View>
                <Text style={[s.bvrStatut, totalDepenses > budget && { color: C.rouge }]}>
                  {totalDepenses > budget ? `Dépassement de ${(totalDepenses - budget).toFixed(2)} $` : `Il te reste ${(budget - totalDepenses).toFixed(2)} $`}
                </Text>
              </View>
            )}

            <View style={s.carte}>
              <Text style={s.carteTitre}>Détail par catégorie</Text>
              {categories.map((cat, i) => (
                <View key={cat.categorie} style={s.ligne}>
                  <View style={s.ligneGauche}>
                    <View style={[s.pastille, { backgroundColor: COULEURS[i % COULEURS.length] }]} />
                    <IconeCategorie nom={cat.icone} size={15} color={C.muted} />
                    <Text style={s.ligneNom}>{cat.categorie}</Text>
                  </View>
                  <View style={s.ligneDroite}>
                    <Text style={s.ligneMontant}>{cat.montant.toFixed(2)} $</Text>
                    <Text style={s.lignePct}>{cat.pourcentage}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function creerStyles(C) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: C.fond },
    scroll: { padding: 16, paddingBottom: 24 },
    titre: { fontSize: 22, fontWeight: '900', color: C.texte, letterSpacing: -0.3, marginTop: 8 },
    sousTitre: { fontSize: 13, color: C.muted, marginTop: 2, marginBottom: 16 },
    moisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 16 },
    moisFleche: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.bordure2, justifyContent: 'center', alignItems: 'center' },
    moisFlecheTexte: { fontSize: 20, color: C.muted, fontWeight: '700', marginTop: -2 },
    moisNom: { fontSize: 15, fontWeight: '800', color: C.texte, minWidth: 150, textAlign: 'center' },
    centre: { paddingVertical: 60, alignItems: 'center' },
    carte: { backgroundColor: C.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.bordure, marginBottom: 14 },
    carteTitre: { fontSize: 15, fontWeight: '700', color: C.texte, marginBottom: 14 },
    vide: { color: C.dim, fontStyle: 'italic', textAlign: 'center', lineHeight: 20, fontSize: 13, paddingVertical: 10 },
    donutZone: { alignItems: 'center', justifyContent: 'center', position: 'relative', paddingVertical: 6 },
    donutCentre: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    donutLbl: { fontSize: 12, color: C.muted, fontWeight: '600' },
    donutVal: { fontSize: 28, fontWeight: '900', color: C.texte, letterSpacing: -0.5 },
    bvrRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    bvrLabel: { fontSize: 13, color: C.muted },
    bvrVal: { fontSize: 14, fontWeight: '800' },
    barreFond: { height: 8, backgroundColor: C.surface2, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
    barreRempli: { height: '100%', borderRadius: 5 },
    bvrStatut: { fontSize: 12, color: C.muted, fontWeight: '600' },
    ligne: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.bordure },
    ligneGauche: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    pastille: { width: 12, height: 12, borderRadius: 3 },
    ligneNom: { fontSize: 14, fontWeight: '600', color: C.texte },
    ligneDroite: { alignItems: 'flex-end' },
    ligneMontant: { fontSize: 14, fontWeight: '800', color: C.texte },
    lignePct: { fontSize: 11, color: C.muted, marginTop: 1 },
  });
}
