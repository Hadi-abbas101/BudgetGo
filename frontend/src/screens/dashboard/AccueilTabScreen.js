import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDonnees, cleMoisDe } from '../../context/DonneesContext';
import ModalTransaction from '../../components/ModalTransaction';
import IconeCategorie from '../../components/IconeCategorie';

export default function AccueilTabScreen({ navigation }) {
  const { utilisateur } = useAuth();
  const { C } = useTheme();
  const s = creerStyles(C);
  const {
    transactions, solde, budgetsParMois, chargement,
    chargerTransactions, chargerCategories, chargerBudget
  } = useDonnees();

  const [modalVisible, setModalVisible] = useState(false);
  const [typeAjout, setTypeAjout] = useState('depense');

  const cleMois = cleMoisDe(new Date());

  useFocusEffect(useCallback(() => {
    chargerTransactions();
    chargerCategories();
    chargerBudget(cleMois);
  }, [cleMois]));

  const budgetDuMois = budgetsParMois[cleMois]?.global || 0;
  const depensesDuMois = transactions
    .filter(t => t.type === 'depense' && (t.date_iso || '').slice(0, 7) === cleMois)
    .reduce((acc, t) => acc + t.montant, 0);
  const pourcentage = budgetDuMois > 0 ? Math.min((depensesDuMois / budgetDuMois) * 100, 100) : 0;
  const depassement = budgetDuMois > 0 && depensesDuMois > budgetDuMois;

  const recentes = transactions.slice(0, 5);
  const initiales = utilisateur?.nom_utilisateur?.substring(0, 2).toUpperCase() || 'BG';

  const ouvrirAjout = (type) => { setTypeAjout(type); setModalVisible(true); };

  if (chargement && transactions.length === 0) {
    return <SafeAreaView style={s.page}><View style={s.centre}><ActivityIndicator size="large" color={C.purple} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <View>
            <Text style={s.headerSub}>Bonjour,</Text>
            <Text style={s.headerTitre}>{utilisateur?.nom_utilisateur || 'Utilisateur'} 👋</Text>
          </View>
          <TouchableOpacity style={s.avatar} onPress={() => navigation.navigate('Parametres')}>
            <Text style={s.avatarTexte}>{initiales}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.soldeCard}>
          <View style={s.soldeGlow} />
          <Text style={s.soldeLbl}>Solde actuel</Text>
          <Text style={s.soldeVal}>{solde.toFixed(2)} $</Text>
          <Text style={s.soldeSub}>Mis à jour à l'instant</Text>
        </View>

        <View style={s.actionsRow}>
          <TouchableOpacity style={s.btnDepense} onPress={() => ouvrirAjout('depense')}>
            <Text style={s.btnDepenseTexte}>− Dépense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnRevenu} onPress={() => ouvrirAjout('revenu')}>
            <Text style={s.btnRevenuTexte}>+ Revenu</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.carte} activeOpacity={0.8} onPress={() => navigation.navigate('Plan')}>
          <View style={s.carteRow}>
            <Text style={s.carteTitre}>Budget du mois</Text>
            <Text style={s.carteLien}>Gérer ›</Text>
          </View>
          {budgetDuMois > 0 ? (
            <>
              <View style={s.budgetMontants}>
                <Text style={s.budgetDepense}>{depensesDuMois.toFixed(2)} $ dépensés</Text>
                <Text style={s.budgetTotal}>sur {budgetDuMois.toFixed(2)} $</Text>
              </View>
              <View style={s.barreFond}>
                <View style={[s.barreRempli, { width: `${pourcentage}%`, backgroundColor: depassement ? C.rouge : pourcentage > 80 ? C.or : C.purple }]} />
              </View>
            </>
          ) : (
            <Text style={s.vide}>Aucun budget défini. Touche pour en créer un.</Text>
          )}
        </TouchableOpacity>

        <View style={s.carte}>
          <View style={s.carteRow}>
            <Text style={s.carteTitre}>Dernières transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Depenses')}>
              <Text style={s.carteLien}>Voir tout ›</Text>
            </TouchableOpacity>
          </View>
          {recentes.length === 0 ? (
            <Text style={s.vide}>Aucune transaction pour l'instant.</Text>
          ) : (
            recentes.map((t, i) => (
              <View key={t.id} style={[s.txRow, i === recentes.length - 1 && { borderBottomWidth: 0 }]}>
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
                <Text style={[s.txMontant, { color: t.type === 'depense' ? C.rouge : C.vert }]}>
                  {t.type === 'depense' ? '−' : '+'} {t.montant.toFixed(2)} $
                </Text>
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
    centre: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
    headerSub: { fontSize: 13, color: C.muted, marginBottom: 2 },
    headerTitre: { fontSize: 22, fontWeight: '900', color: C.texte, letterSpacing: -0.5 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.purple, justifyContent: 'center', alignItems: 'center' },
    avatarTexte: { color: '#FFF', fontWeight: '800', fontSize: 15 },
    soldeCard: { backgroundColor: C.purple, borderRadius: 22, padding: 22, marginBottom: 14, overflow: 'hidden', position: 'relative' },
    soldeGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)', top: -35, right: -25 },
    soldeLbl: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: 4 },
    soldeVal: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
    soldeSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 },
    actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    btnDepense: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.bordure2, borderRadius: 16, padding: 15, alignItems: 'center' },
    btnDepenseTexte: { fontSize: 14, fontWeight: '700', color: C.rouge },
    btnRevenu: { flex: 1, backgroundColor: C.vert + '1A', borderWidth: 1, borderColor: C.vert + '33', borderRadius: 16, padding: 15, alignItems: 'center' },
    btnRevenuTexte: { fontSize: 14, fontWeight: '700', color: C.vert },
    carte: { backgroundColor: C.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.bordure, marginBottom: 14 },
    carteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    carteTitre: { fontSize: 15, fontWeight: '700', color: C.texte },
    carteLien: { fontSize: 13, color: C.purpleL, fontWeight: '700' },
    budgetMontants: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
    budgetDepense: { fontSize: 16, fontWeight: '800', color: C.texte },
    budgetTotal: { fontSize: 13, color: C.muted },
    barreFond: { height: 8, backgroundColor: C.surface2, borderRadius: 5, overflow: 'hidden' },
    barreRempli: { height: '100%', borderRadius: 5 },
    vide: { color: C.dim, fontStyle: 'italic', fontSize: 13, paddingVertical: 6 },
    txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.bordure },
    txGauche: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    txIco: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    txNom: { fontSize: 14, fontWeight: '700', color: C.texte },
    txDate: { fontSize: 11, color: C.dim, marginTop: 2 },
    txMontant: { fontSize: 14, fontWeight: '800' },
  });
}
