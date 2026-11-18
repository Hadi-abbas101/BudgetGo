import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Modal, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDonnees } from '../context/DonneesContext';
import IconeCategorie from './IconeCategorie';

export default function ModalTransaction({ visible, onClose, type }) {
  const { C } = useTheme();
  const s = creerStyles(C);
  const { categories, comptes, chargerComptes, ajouterTransaction } = useDonnees();

  const [titre, setTitre] = useState('');
  const [montant, setMontant] = useState('');
  const [categorieId, setCategorieId] = useState(null);
  const [compteId, setCompteId] = useState(null);
  const [chargement, setChargement] = useState(false);

  // Réinitialise les champs à chaque ouverture (et charge les comptes au besoin)
  useEffect(() => {
    if (visible) {
      setTitre(''); setMontant(''); setCategorieId(null); setCompteId(null);
      if (comptes.length === 0) chargerComptes();
    }
  }, [visible]);

  const iconeCompte = (type) => ({
    cheque: 'card', epargne: 'trending-up', comptant: 'cash', credit: 'card-outline', autre: 'wallet'
  }[type] || 'wallet');

  const valider = async () => {
    if (!titre || !montant) { Alert.alert('Erreur', 'Veuillez remplir tous les champs.'); return; }
    setChargement(true);
    try {
      const data = await ajouterTransaction({
        titre,
        montant: parseFloat(montant.replace(',', '.')),
        type,
        categorie_id: categorieId,
        compte_id: compteId
      });
      if (data.succes) onClose();
      else Alert.alert('Erreur', data.message || "Échec de l'ajout.");
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'ajouter la transaction.");
    } finally {
      setChargement(false);
    }
  };

  const couleur = type === 'depense' ? C.rouge : C.vert;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.fond}>
        <View style={s.carte}>
          <Text style={s.titre}>Ajouter {type === 'depense' ? 'une dépense' : 'un revenu'}</Text>

          <View style={s.champ}>
            <TextInput
              style={s.input}
              placeholder="Ex: Épicerie, Salaire..."
              placeholderTextColor={C.dim}
              value={titre}
              onChangeText={setTitre}
            />
          </View>
          <View style={s.champ}>
            <TextInput
              style={s.input}
              placeholder="Montant (ex: 45.50)"
              placeholderTextColor={C.dim}
              value={montant}
              onChangeText={setMontant}
              keyboardType="numeric"
            />
          </View>

          <Text style={s.catLabel}>Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={s.catScroll} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
            {categories.filter(c => c.type === type).map(c => {
              const actif = categorieId === c.id;
              return (
                <TouchableOpacity key={c.id}
                  style={[s.chip, actif && s.chipActif]}
                  onPress={() => setCategorieId(actif ? null : c.id)}>
                  <IconeCategorie nom={c.icone} size={15} color={actif ? '#FFFFFF' : C.muted} />
                  <Text style={[s.chipTexte, actif && s.chipTexteActif]}>{c.nom}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {comptes.length > 0 && (
            <>
              <Text style={s.catLabel}>Compte</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={s.catScroll} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                {comptes.map(co => {
                  const actif = compteId === co.id;
                  return (
                    <TouchableOpacity key={co.id}
                      style={[s.chip, actif && s.chipActif]}
                      onPress={() => setCompteId(actif ? null : co.id)}>
                      <Ionicons name={iconeCompte(co.type_compte)} size={15} color={actif ? '#FFFFFF' : C.muted} />
                      <Text style={[s.chipTexte, actif && s.chipTexteActif]}>{co.nom}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <View style={s.btns}>
            <TouchableOpacity style={s.btnAnnuler} onPress={onClose}>
              <Text style={s.btnAnnulerTexte}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btnValider, { backgroundColor: couleur }]}
              onPress={valider} disabled={chargement}>
              <Text style={s.btnValiderTexte}>{chargement ? '...' : 'Valider'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function creerStyles(C) {
  return StyleSheet.create({
    fond: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    carte: { backgroundColor: C.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    titre: { fontSize: 18, fontWeight: '800', color: C.texte, marginBottom: 18 },
    champ: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.bordure2, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12 },
    input: { paddingVertical: 13, fontSize: 15, color: C.texte },
    catLabel: { fontSize: 12, fontWeight: '700', color: C.muted, marginBottom: 8, marginTop: 2 },
    catScroll: { marginBottom: 16, maxHeight: 42 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.bordure2 },
    chipActif: { backgroundColor: C.purple, borderColor: C.purple },
    chipTexte: { fontSize: 13, fontWeight: '600', color: C.muted },
    chipTexteActif: { color: '#FFFFFF' },
    btns: { flexDirection: 'row', gap: 10, marginTop: 6 },
    btnAnnuler: { flex: 1, backgroundColor: C.surface2, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.bordure2 },
    btnAnnulerTexte: { color: C.muted, fontWeight: '700', fontSize: 15 },
    btnValider: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
    btnValiderTexte: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  });
}
