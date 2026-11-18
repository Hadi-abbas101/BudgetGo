import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useDonnees } from '../../context/DonneesContext';

const TYPES_COMPTE = [
  { valeur: 'cheque', label: 'Compte chèque', icone: 'card' },
  { valeur: 'epargne', label: 'Épargne', icone: 'trending-up' },
  { valeur: 'comptant', label: 'Comptant', icone: 'cash' },
  { valeur: 'credit', label: 'Carte de crédit', icone: 'card-outline' },
  { valeur: 'autre', label: 'Autre', icone: 'wallet' },
];
const infosType = (v) => TYPES_COMPTE.find(t => t.valeur === v) || TYPES_COMPTE[4];

export default function ComptesScreen() {
  const { C } = useTheme();
  const s = creerStyles(C);
  const { comptes, totalComptes, chargerComptes, ajouterCompte, supprimerCompte } = useDonnees();

  const [modalVisible, setModalVisible] = useState(false);
  const [nom, setNom] = useState('');
  const [typeChoisi, setTypeChoisi] = useState('cheque');
  const [soldeInitial, setSoldeInitial] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);

  useFocusEffect(useCallback(() => { chargerComptes(); }, []));

  const ouvrirModal = () => {
    setNom(''); setTypeChoisi('cheque'); setSoldeInitial('');
    setModalVisible(true);
  };

  const creer = async () => {
    if (!nom.trim()) { Alert.alert('Erreur', 'Donne un nom à ton compte.'); return; }
    setEnregistrement(true);
    try {
      const data = await ajouterCompte({
        nom: nom.trim(),
        type_compte: typeChoisi,
        solde: parseFloat((soldeInitial || '0').replace(',', '.')) || 0
      });
      if (data.succes) setModalVisible(false);
      else Alert.alert('Erreur', data.message || 'Échec de la création.');
    } catch (e) {
      Alert.alert('Erreur', "Impossible de créer le compte.");
    } finally {
      setEnregistrement(false);
    }
  };

  const confirmerSuppression = (compte) => {
    Alert.alert('Supprimer le compte', `Supprimer « ${compte.nom} » ? Cette action est irréversible.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => supprimerCompte(compte.id) }
    ]);
  };

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.titre}>Comptes</Text>
        <Text style={s.sousTitre}>Tes comptes et leur solde</Text>

        {/* Patrimoine total */}
        <View style={s.totalCard}>
          <View style={s.totalGlow} />
          <Text style={s.totalLbl}>Patrimoine total</Text>
          <Text style={s.totalVal}>{totalComptes.toFixed(2)} $</Text>
          <Text style={s.totalSub}>{comptes.length} compte{comptes.length > 1 ? 's' : ''}</Text>
        </View>

        <View style={s.sectionRow}>
          <Text style={s.sectionLbl}>MES COMPTES</Text>
          <TouchableOpacity style={s.btnAjout} onPress={ouvrirModal}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={s.btnAjoutTexte}>Nouveau</Text>
          </TouchableOpacity>
        </View>

        {comptes.length === 0 ? (
          <View style={s.carteVide}>
            <Ionicons name="wallet-outline" size={28} color={C.dim} />
            <Text style={s.vide}>Aucun compte pour l'instant.{'\n'}Crée ton premier compte (chèque, épargne, comptant…).</Text>
          </View>
        ) : (
          comptes.map(compte => {
            const info = infosType(compte.type_compte);
            return (
              <View key={compte.id} style={s.compteCard}>
                <View style={s.compteIco}><Ionicons name={info.icone} size={20} color={C.purpleL} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.compteNom}>{compte.nom}</Text>
                  <Text style={s.compteType}>{info.label}</Text>
                </View>
                <View style={s.compteDroite}>
                  <Text style={[s.compteSolde, { color: compte.solde < 0 ? C.rouge : C.texte }]}>
                    {compte.solde.toFixed(2)} $
                  </Text>
                  <TouchableOpacity onPress={() => confirmerSuppression(compte)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={16} color={C.rouge} style={{ opacity: 0.6 }} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalFond}>
          <View style={s.modalCarte}>
            <Text style={s.modalTitre}>Nouveau compte</Text>

            <View style={s.modalChamp}>
              <TextInput style={s.modalInput} placeholder="Nom (ex: Compte Desjardins)" placeholderTextColor={C.dim}
                value={nom} onChangeText={setNom} />
            </View>

            <Text style={s.modalLabel}>Type de compte</Text>
            <View style={s.typesGrille}>
              {TYPES_COMPTE.map(t => {
                const actif = typeChoisi === t.valeur;
                return (
                  <TouchableOpacity key={t.valeur} style={[s.typeChip, actif && s.typeChipActif]} onPress={() => setTypeChoisi(t.valeur)}>
                    <Ionicons name={t.icone} size={15} color={actif ? '#FFFFFF' : C.muted} />
                    <Text style={[s.typeTexte, actif && s.typeTexteActif]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={s.modalChamp}>
              <TextInput style={s.modalInput} placeholder="Solde initial (ex: 1500)" placeholderTextColor={C.dim}
                value={soldeInitial} onChangeText={setSoldeInitial} keyboardType="numeric" />
            </View>

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.btnAnnuler} onPress={() => setModalVisible(false)}>
                <Text style={s.btnAnnulerTexte}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnValider, { backgroundColor: C.purple }]} onPress={creer} disabled={enregistrement}>
                <Text style={s.btnValiderTexte}>{enregistrement ? '...' : 'Créer'}</Text>
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
    totalCard: { backgroundColor: C.purple, borderRadius: 22, padding: 22, marginBottom: 20, overflow: 'hidden', position: 'relative' },
    totalGlow: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)', top: -40, right: -30 },
    totalLbl: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    totalVal: { fontSize: 34, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1, marginTop: 4 },
    totalSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionLbl: { fontSize: 11, fontWeight: '700', color: C.purpleL, letterSpacing: 1.2, marginLeft: 2 },
    btnAjout: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.purple, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20 },
    btnAjoutTexte: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
    carteVide: { backgroundColor: C.surface, borderRadius: 16, padding: 28, borderWidth: 1, borderColor: C.bordure, alignItems: 'center', gap: 10 },
    vide: { color: C.dim, fontStyle: 'italic', textAlign: 'center', lineHeight: 19, fontSize: 13 },
    compteCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.bordure, marginBottom: 10 },
    compteIco: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.purple + '22', justifyContent: 'center', alignItems: 'center' },
    compteNom: { fontSize: 15, fontWeight: '700', color: C.texte },
    compteType: { fontSize: 12, color: C.muted, marginTop: 2 },
    compteDroite: { alignItems: 'flex-end', gap: 6 },
    compteSolde: { fontSize: 16, fontWeight: '800' },
    modalFond: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalCarte: { backgroundColor: C.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    modalTitre: { fontSize: 18, fontWeight: '800', color: C.texte, marginBottom: 18 },
    modalLabel: { fontSize: 12, fontWeight: '700', color: C.muted, marginBottom: 10, marginTop: 2 },
    modalChamp: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.bordure2, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12 },
    modalInput: { paddingVertical: 13, fontSize: 15, color: C.texte },
    typesGrille: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.bordure2 },
    typeChipActif: { backgroundColor: C.purple, borderColor: C.purple },
    typeTexte: { fontSize: 13, fontWeight: '600', color: C.muted },
    typeTexteActif: { color: '#FFFFFF' },
    modalBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
    btnAnnuler: { flex: 1, backgroundColor: C.surface2, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.bordure2 },
    btnAnnulerTexte: { color: C.muted, fontWeight: '700', fontSize: 15 },
    btnValider: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
    btnValiderTexte: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  });
}
