import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useDonnees, cleMoisDe } from '../../context/DonneesContext';
import IconeCategorie from '../../components/IconeCategorie';

const NOMS_MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export default function PlanScreen() {
  const { C } = useTheme();
  const s = creerStyles(C);
  const { transactions, categories, budgetsParMois, chargerTransactions, chargerCategories, chargerBudget, enregistrerBudget } = useDonnees();

  const [dateSelectionnee, setDateSelectionnee] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [cible, setCible] = useState({ type: 'global' });
  const [montantSaisi, setMontantSaisi] = useState('');

  const cleMois = cleMoisDe(dateSelectionnee);

  useFocusEffect(useCallback(() => {
    chargerTransactions();
    chargerCategories();
    chargerBudget(cleMois);
  }, [cleMois]));

  const budgetGlobal = budgetsParMois[cleMois]?.global || 0;
  const budgetsCat = budgetsParMois[cleMois]?.categories || {};

  const txMois = transactions.filter(t => t.type === 'depense' && (t.date_iso || '').slice(0, 7) === cleMois);
  const depensesTotales = txMois.reduce((acc, t) => acc + t.montant, 0);
  const depensesParCat = {};
  txMois.forEach(t => { if (t.categorie_id) depensesParCat[t.categorie_id] = (depensesParCat[t.categorie_id] || 0) + t.montant; });

  const categoriesDepense = categories.filter(c => c.type === 'depense');

  const moisPrecedent = () => { const d = new Date(dateSelectionnee); d.setMonth(d.getMonth() - 1); setDateSelectionnee(d); };
  const moisSuivant = () => { const d = new Date(dateSelectionnee); d.setMonth(d.getMonth() + 1); setDateSelectionnee(d); };

  const ouvrirModal = (cibleVoulue, valeurActuelle) => {
    setCible(cibleVoulue);
    setMontantSaisi(valeurActuelle > 0 ? String(valeurActuelle) : '');
    setModalVisible(true);
  };

  const enregistrer = async () => {
    const valeur = parseFloat(montantSaisi.replace(',', '.'));
    if (isNaN(valeur) || valeur < 0) { Alert.alert('Erreur', 'Entre un montant valide.'); return; }
    try {
      await enregistrerBudget(cleMois, valeur, cible.type === 'categorie' ? cible.id : null);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'enregistrer le budget.");
    }
  };

  const Barre = ({ depense, budget }) => {
    const pct = budget > 0 ? Math.min((depense / budget) * 100, 100) : 0;
    const depasse = budget > 0 && depense > budget;
    return (
      <View style={s.barreFond}>
        <View style={[s.barreRempli, { width: `${pct}%`, backgroundColor: depasse ? C.rouge : pct > 80 ? C.or : C.purpleL }]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.titre}>Plan</Text>
        <Text style={s.sousTitre}>Tes budgets du mois</Text>

        <View style={s.moisRow}>
          <TouchableOpacity style={s.moisFleche} onPress={moisPrecedent}><Text style={s.moisFlecheTexte}>‹</Text></TouchableOpacity>
          <Text style={s.moisNom}>{NOMS_MOIS[dateSelectionnee.getMonth()]} {dateSelectionnee.getFullYear()}</Text>
          <TouchableOpacity style={s.moisFleche} onPress={moisSuivant}><Text style={s.moisFlecheTexte}>›</Text></TouchableOpacity>
        </View>

        {/* Budget global */}
        <View style={s.carteGlobale}>
          <View style={s.carteRow}>
            <Text style={s.carteTitreClair}>Budget global</Text>
            <TouchableOpacity onPress={() => ouvrirModal({ type: 'global' }, budgetGlobal)}>
              <Text style={s.lienClair}>{budgetGlobal > 0 ? 'Modifier' : 'Définir'}</Text>
            </TouchableOpacity>
          </View>
          {budgetGlobal > 0 ? (
            <>
              <Text style={s.globalMontant}>{depensesTotales.toFixed(2)} $ <Text style={s.globalSur}>/ {budgetGlobal.toFixed(2)} $</Text></Text>
              <Barre depense={depensesTotales} budget={budgetGlobal} />
              <Text style={s.globalStatut}>
                {depensesTotales > budgetGlobal
                  ? `Dépassé de ${(depensesTotales - budgetGlobal).toFixed(2)} $`
                  : `Il te reste ${(budgetGlobal - depensesTotales).toFixed(2)} $`}
              </Text>
            </>
          ) : (
            <Text style={s.videClair}>Définis une limite globale pour le mois.</Text>
          )}
        </View>

        {/* Budgets par catégorie */}
        <Text style={s.sectionLbl}>PAR CATÉGORIE</Text>
        {categoriesDepense.map(cat => {
          const budget = budgetsCat[String(cat.id)] || 0;
          const depense = depensesParCat[cat.id] || 0;
          return (
            <TouchableOpacity key={cat.id} style={s.carteCat} activeOpacity={0.8}
              onPress={() => ouvrirModal({ type: 'categorie', id: cat.id, nom: cat.nom }, budget)}>
              <View style={s.carteRow}>
                <View style={s.catNomRow}>
                  <IconeCategorie nom={cat.icone} size={16} color={C.muted} />
                  <Text style={s.catNom}>{cat.nom}</Text>
                </View>
                <Text style={s.catChiffres}>
                  {budget > 0 ? `${depense.toFixed(0)} $ / ${budget.toFixed(0)} $` : <Text style={s.catDefinir}>Définir ›</Text>}
                </Text>
              </View>
              {budget > 0 && <Barre depense={depense} budget={budget} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalFond}>
          <View style={s.modalCarte}>
            <Text style={s.modalTitre}>
              {cible.type === 'global' ? `Budget global — ${NOMS_MOIS[dateSelectionnee.getMonth()]}` : `Budget — ${cible.nom}`}
            </Text>
            <View style={s.modalChamp}>
              <TextInput style={s.modalInput} placeholder="Montant maximal (ex: 300)" placeholderTextColor={C.dim}
                value={montantSaisi} onChangeText={setMontantSaisi} keyboardType="numeric" autoFocus />
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.btnAnnuler} onPress={() => setModalVisible(false)}>
                <Text style={s.btnAnnulerTexte}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnValider, { backgroundColor: C.purple }]} onPress={enregistrer}>
                <Text style={s.btnValiderTexte}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    carteGlobale: { backgroundColor: C.purple, borderRadius: 20, padding: 20, marginBottom: 18 },
    carteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    carteTitreClair: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
    lienClair: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
    globalMontant: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 10 },
    globalSur: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
    globalStatut: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 8 },
    videClair: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' },
    sectionLbl: { fontSize: 11, fontWeight: '700', color: C.purpleL, letterSpacing: 1.2, marginBottom: 10, marginLeft: 2 },
    carteCat: { backgroundColor: C.surface, borderRadius: 14, padding: 15, borderWidth: 1, borderColor: C.bordure, marginBottom: 10 },
    catNomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    catNom: { fontSize: 14, fontWeight: '700', color: C.texte },
    catChiffres: { fontSize: 13, fontWeight: '700', color: C.muted },
    catDefinir: { color: C.purpleL, fontWeight: '700' },
    barreFond: { height: 7, backgroundColor: C.surface2, borderRadius: 4, overflow: 'hidden', marginTop: 4 },
    barreRempli: { height: '100%', borderRadius: 4 },
    modalFond: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalCarte: { backgroundColor: C.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    modalTitre: { fontSize: 18, fontWeight: '800', color: C.texte, marginBottom: 18 },
    modalChamp: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.bordure2, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12 },
    modalInput: { paddingVertical: 13, fontSize: 15, color: C.texte },
    modalBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
    btnAnnuler: { flex: 1, backgroundColor: C.surface2, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.bordure2 },
    btnAnnulerTexte: { color: C.muted, fontWeight: '700', fontSize: 15 },
    btnValider: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
    btnValiderTexte: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  });
}
