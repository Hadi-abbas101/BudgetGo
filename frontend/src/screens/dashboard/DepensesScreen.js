import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useDonnees, cleMoisDe } from '../../context/DonneesContext';
import ModalTransaction from '../../components/ModalTransaction';
import IconeCategorie from '../../components/IconeCategorie';

const NOMS_MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export default function DepensesScreen() {
  const { C } = useTheme();
  const s = creerStyles(C);
  const { transactions, chargerTransactions, chargerCategories, supprimerTransaction } = useDonnees();

  const [dateSelectionnee, setDateSelectionnee] = useState(new Date());
  const [filtre, setFiltre] = useState('tout');
  const [modalVisible, setModalVisible] = useState(false);
  const [typeAjout, setTypeAjout] = useState('depense');

  const cleMois = cleMoisDe(dateSelectionnee);

  useFocusEffect(useCallback(() => {
    chargerTransactions();
    chargerCategories();
  }, []));

  const moisPrecedent = () => { const d = new Date(dateSelectionnee); d.setMonth(d.getMonth() - 1); setDateSelectionnee(d); };
  const moisSuivant = () => { const d = new Date(dateSelectionnee); d.setMonth(d.getMonth() + 1); setDateSelectionnee(d); };

  const txMois = transactions.filter(t => (t.date_iso || '').slice(0, 7) === cleMois);
  const txFiltrees = txMois.filter(t => filtre === 'tout' ? true : t.type === filtre);

  const totalDepenses = txMois.filter(t => t.type === 'depense').reduce((a, t) => a + t.montant, 0);
  const totalRevenus = txMois.filter(t => t.type === 'revenu').reduce((a, t) => a + t.montant, 0);

  const ouvrirAjout = (type) => { setTypeAjout(type); setModalVisible(true); };

  const confirmerSuppression = (id) => {
    Alert.alert('Supprimer', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => supprimerTransaction(id) }
    ]);
  };

  const Filtre = ({ valeur, label }) => (
    <TouchableOpacity style={[s.filtreChip, filtre === valeur && s.filtreChipActif]} onPress={() => setFiltre(valeur)}>
      <Text style={[s.filtreTexte, filtre === valeur && s.filtreTexteActif]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.titre}>Dépenses</Text>
        <Text style={s.sousTitre}>Toutes tes transactions</Text>

        <View style={s.moisRow}>
          <TouchableOpacity style={s.moisFleche} onPress={moisPrecedent}><Text style={s.moisFlecheTexte}>‹</Text></TouchableOpacity>
          <Text style={s.moisNom}>{NOMS_MOIS[dateSelectionnee.getMonth()]} {dateSelectionnee.getFullYear()}</Text>
          <TouchableOpacity style={s.moisFleche} onPress={moisSuivant}><Text style={s.moisFlecheTexte}>›</Text></TouchableOpacity>
        </View>

        <View style={s.resumeRow}>
          <View style={s.resumeCol}>
            <Text style={s.resumeLbl}>Revenus</Text>
            <Text style={[s.resumeVal, { color: C.vert }]}>+{totalRevenus.toFixed(2)} $</Text>
          </View>
          <View style={[s.resumeCol, s.resumeBordure]}>
            <Text style={s.resumeLbl}>Dépenses</Text>
            <Text style={[s.resumeVal, { color: C.rouge }]}>−{totalDepenses.toFixed(2)} $</Text>
          </View>
        </View>

        <View style={s.actionsRow}>
          <TouchableOpacity style={s.btnDepense} onPress={() => ouvrirAjout('depense')}>
            <Text style={s.btnDepenseTexte}>− Dépense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnRevenu} onPress={() => ouvrirAjout('revenu')}>
            <Text style={s.btnRevenuTexte}>+ Revenu</Text>
          </TouchableOpacity>
        </View>

        <View style={s.filtres}>
          <Filtre valeur="tout" label="Tout" />
          <Filtre valeur="depense" label="Dépenses" />
          <Filtre valeur="revenu" label="Revenus" />
        </View>

        <View style={s.carte}>
          {txFiltrees.length === 0 ? (
            <Text style={s.vide}>Aucune transaction ce mois-ci.</Text>
          ) : (
            txFiltrees.map((t, i) => (
              <View key={t.id} style={[s.txRow, i === txFiltrees.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={s.txGauche}>
                  <View style={[s.txIco, { backgroundColor: t.type === 'depense' ? C.rouge + '22' : C.vert + '22' }]}>
                    {t.categorie_icone
                      ? <IconeCategorie nom={t.categorie_icone} size={16} color={t.type === 'depense' ? C.rouge : C.vert} />
                      : <Text style={{ fontSize: 14, color: t.type === 'depense' ? C.rouge : C.vert, fontWeight: '700' }}>{t.type === 'depense' ? '↓' : '↑'}</Text>}
                  </View>
                  <View>
                    <Text style={s.txNom}>{t.titre}</Text>
                    <Text style={s.txDate}>{t.categorie ? `${t.categorie} · ` : ''}{t.date}</Text>
                  </View>
                </View>
                <View style={s.txDroite}>
                  <Text style={[s.txMontant, { color: t.type === 'depense' ? C.rouge : C.vert }]}>
                    {t.type === 'depense' ? '−' : '+'} {t.montant.toFixed(2)} $
                  </Text>
                  <TouchableOpacity onPress={() => confirmerSuppression(t.id)}>
                    <Text style={s.txSup}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ModalTransaction visible={modalVisible} onClose={() => setModalVisible(false)} type={typeAjout} />
    </SafeAreaView>
  );
}

function creerStyles(C) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: C.fond },
    scroll: { padding: 16, paddingBottom: 24 },
    titre: { fontSize: 22, fontWeight: '900', color: C.texte, letterSpacing: -0.3, marginTop: 8 },
    sousTitre: { fontSize: 13, color: C.muted, marginTop: 2, marginBottom: 16 },
    moisRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14, gap: 16 },
    moisFleche: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.bordure2, justifyContent: 'center', alignItems: 'center' },
    moisFlecheTexte: { fontSize: 20, color: C.muted, fontWeight: '700', marginTop: -2 },
    moisNom: { fontSize: 15, fontWeight: '800', color: C.texte, minWidth: 150, textAlign: 'center' },
    resumeRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.bordure, paddingVertical: 16, marginBottom: 14 },
    resumeCol: { flex: 1, alignItems: 'center' },
    resumeBordure: { borderLeftWidth: 1, borderLeftColor: C.bordure },
    resumeLbl: { fontSize: 12, color: C.muted, fontWeight: '600', marginBottom: 4 },
    resumeVal: { fontSize: 17, fontWeight: '900' },
    actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    btnDepense: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.bordure2, borderRadius: 16, padding: 14, alignItems: 'center' },
    btnDepenseTexte: { fontSize: 14, fontWeight: '700', color: C.rouge },
    btnRevenu: { flex: 1, backgroundColor: C.vert + '1A', borderWidth: 1, borderColor: C.vert + '33', borderRadius: 16, padding: 14, alignItems: 'center' },
    btnRevenuTexte: { fontSize: 14, fontWeight: '700', color: C.vert },
    filtres: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    filtreChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.bordure2 },
    filtreChipActif: { backgroundColor: C.purple, borderColor: C.purple },
    filtreTexte: { fontSize: 13, fontWeight: '600', color: C.muted },
    filtreTexteActif: { color: '#FFFFFF' },
    carte: { backgroundColor: C.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.bordure },
    vide: { color: C.dim, fontStyle: 'italic', textAlign: 'center', paddingVertical: 14, fontSize: 13 },
    txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.bordure },
    txGauche: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    txIco: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    txNom: { fontSize: 14, fontWeight: '700', color: C.texte },
    txDate: { fontSize: 11, color: C.dim, marginTop: 2 },
    txDroite: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    txMontant: { fontSize: 14, fontWeight: '800' },
    txSup: { color: C.rouge, fontSize: 16, opacity: 0.5 },
  });
}
