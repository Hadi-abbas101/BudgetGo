import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width: LARGEUR } = Dimensions.get('window');

/* ----------- Mini-maquettes illustrant chaque fonctionnalité ----------- */

const MaquetteSolde = ({ C, st }) => (
  <View style={[st.mockSolde, { backgroundColor: C.purple }]}>
    <View style={st.mockGlow} />
    <Text style={st.mockSoldeLbl}>Solde actuel</Text>
    <Text style={st.mockSoldeVal}>1 240,50 $</Text>
    <View style={st.mockRow}>
      <View style={[st.mockPill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
        <Ionicons name="arrow-up" size={12} color="#FFF" />
        <Text style={st.mockPillTxt}>Revenus</Text>
      </View>
      <View style={[st.mockPill, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
        <Ionicons name="arrow-down" size={12} color="#FFF" />
        <Text style={st.mockPillTxt}>Dépenses</Text>
      </View>
    </View>
  </View>
);

const LigneTx = ({ C, st, icone, nom, cat, montant, couleur }) => (
  <View style={st.mockTx}>
    <View style={[st.mockTxIco, { backgroundColor: couleur + '22' }]}>
      <Ionicons name={icone} size={16} color={couleur} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={st.mockTxNom}>{nom}</Text>
      <Text style={st.mockTxCat}>{cat}</Text>
    </View>
    <Text style={[st.mockTxMontant, { color: couleur }]}>{montant}</Text>
  </View>
);

const MaquetteCategories = ({ C, st }) => (
  <View style={[st.mockCarte, { backgroundColor: C.surface, borderColor: C.bordure }]}>
    <LigneTx C={C} st={st} icone="cart" nom="Épicerie Metro" cat="🛒 Épicerie" montant="− 54,20 $" couleur={C.rouge} />
    <LigneTx C={C} st={st} icone="bus" nom="Passe STM" cat="🚌 Transport" montant="− 56,50 $" couleur={C.rouge} />
    <LigneTx C={C} st={st} icone="cash" nom="Paie" cat="💰 Salaire" montant="+ 800,00 $" couleur={C.vert} />
  </View>
);

const MaquetteBudget = ({ C, st }) => (
  <View style={[st.mockCarte, { backgroundColor: C.surface, borderColor: C.bordure }]}>
    <View style={st.mockBudgetHead}>
      <Text style={[st.mockBudgetNom, { color: C.texte }]}>Restaurants</Text>
      <View style={[st.mockAlerte, { backgroundColor: C.or + '22' }]}>
        <Ionicons name="warning" size={11} color={C.or} />
        <Text style={[st.mockAlerteTxt, { color: C.or }]}>80 % atteint</Text>
      </View>
    </View>
    <Text style={[st.mockBudgetChiffre, { color: C.texte }]}>160 $ <Text style={{ color: C.muted, fontWeight: '600', fontSize: 13 }}>/ 200 $</Text></Text>
    <View style={[st.mockBarreFond, { backgroundColor: C.surface2 }]}>
      <View style={[st.mockBarreRempli, { width: '80%', backgroundColor: C.or }]} />
    </View>
    <Text style={[st.mockBudgetReste, { color: C.muted }]}>Il te reste 40 $ ce mois-ci</Text>
  </View>
);

const CarteCompte = ({ C, st, icone, nom, type, solde }) => (
  <View style={[st.mockCompte, { backgroundColor: C.surface, borderColor: C.bordure }]}>
    <View style={[st.mockCompteIco, { backgroundColor: C.purple + '22' }]}>
      <Ionicons name={icone} size={16} color={C.purpleL} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[st.mockCompteNom, { color: C.texte }]}>{nom}</Text>
      <Text style={[st.mockCompteType, { color: C.muted }]}>{type}</Text>
    </View>
    <Text style={[st.mockCompteSolde, { color: C.texte }]}>{solde}</Text>
  </View>
);

const MaquetteComptes = ({ C, st }) => (
  <View style={{ gap: 10 }}>
    <CarteCompte C={C} st={st} icone="card" nom="Compte chèque" type="Chèque" solde="1 240 $" />
    <CarteCompte C={C} st={st} icone="trending-up" nom="Épargne voyage" type="Épargne" solde="3 500 $" />
    <CarteCompte C={C} st={st} icone="cash" nom="Argent comptant" type="Comptant" solde="80 $" />
  </View>
);

export default function AccueilScreen({ navigation }) {
  const { C } = useTheme();
  const st = creerStyles(C);
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);

  const DIAPOS = [
    {
      titre: 'Tes finances, enfin claires',
      texte: 'BudgetGo réunit tout ton argent au même endroit. Gratuit, en français, pensé pour les étudiants.',
      visuel: <MaquetteSolde C={C} st={st} />,
    },
    {
      titre: 'Classe chaque dépense',
      texte: 'Catégorise tes transactions et vois exactement où va ton argent, en un coup d’œil.',
      visuel: <MaquetteCategories C={C} st={st} />,
    },
    {
      titre: 'Fixe tes budgets',
      texte: 'Définis une limite par catégorie et reçois une alerte avant de la dépasser.',
      visuel: <MaquetteBudget C={C} st={st} />,
    },
    {
      titre: 'Tous tes comptes réunis',
      texte: 'Chèque, épargne, comptant… suis le solde de chacun, mis à jour automatiquement.',
      visuel: <MaquetteComptes C={C} st={st} />,
    },
  ];

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / LARGEUR);
    if (i !== index) setIndex(i);
  };

  const suivant = () => {
    if (index < DIAPOS.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * LARGEUR, animated: true });
    } else {
      navigation.navigate('Inscription');
    }
  };

  return (
    <SafeAreaView style={st.page}>
      <View style={st.header}>
        <Text style={st.logo}>Budget<Text style={st.logoAccent}>Go</Text></Text>
        <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
          <Text style={st.headerLien}>Se connecter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flexGrow: 0 }}
      >
        {DIAPOS.map((d, i) => (
          <View key={i} style={[st.diapo, { width: LARGEUR }]}>
            <View style={st.visuelZone}>{d.visuel}</View>
            <Text style={st.diapoTitre}>{d.titre}</Text>
            <Text style={st.diapoTexte}>{d.texte}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={st.dots}>
        {DIAPOS.map((_, i) => (
          <View key={i} style={[st.dot, i === index ? st.dotActif : st.dotInactif]} />
        ))}
      </View>

      <View style={st.bas}>
        <TouchableOpacity style={st.btnPrimary} onPress={suivant}>
          <Text style={st.btnPrimaryTexte}>
            {index < DIAPOS.length - 1 ? 'Suivant' : 'Créer un compte gratuitement'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
          <Text style={st.lien}>
            {index < DIAPOS.length - 1 ? 'Passer · ' : ''}
            <Text style={st.lienAccent}>Commencer maintenant</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function creerStyles(C) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: C.fond },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    logo: { fontSize: 20, fontWeight: '900', color: C.texte, letterSpacing: -0.5 },
    logoAccent: { color: C.purpleL },
    headerLien: { color: C.muted, fontSize: 14, fontWeight: '600' },

    diapo: { paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
    visuelZone: { width: '100%', marginBottom: 32, justifyContent: 'center' },
    diapoTitre: { fontSize: 26, fontWeight: '900', color: C.texte, textAlign: 'center', letterSpacing: -0.5, marginBottom: 12, lineHeight: 32 },
    diapoTexte: { fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 6 },

    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 18 },
    dot: { height: 8, borderRadius: 4 },
    dotActif: { width: 22, backgroundColor: C.purple },
    dotInactif: { width: 8, backgroundColor: C.surface3 },

    bas: { paddingHorizontal: 24, paddingBottom: 28, gap: 14 },
    btnPrimary: { backgroundColor: C.purple, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    btnPrimaryTexte: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
    lien: { color: C.muted, fontSize: 14, textAlign: 'center' },
    lienAccent: { color: C.purpleL, fontWeight: '700' },

    /* maquettes */
    mockSolde: { borderRadius: 22, padding: 22, overflow: 'hidden', position: 'relative' },
    mockGlow: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.10)', top: -30, right: -20 },
    mockSoldeLbl: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
    mockSoldeVal: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1, marginTop: 4, marginBottom: 16 },
    mockRow: { flexDirection: 'row', gap: 10 },
    mockPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    mockPillTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

    mockCarte: { borderRadius: 18, padding: 14, borderWidth: 1 },
    mockTx: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
    mockTxIco: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    mockTxNom: { fontSize: 14, fontWeight: '700', color: C.texte },
    mockTxCat: { fontSize: 11, color: C.muted, marginTop: 2 },
    mockTxMontant: { fontSize: 14, fontWeight: '800' },

    mockBudgetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    mockBudgetNom: { fontSize: 15, fontWeight: '700' },
    mockAlerte: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 12 },
    mockAlerteTxt: { fontSize: 11, fontWeight: '700' },
    mockBudgetChiffre: { fontSize: 20, fontWeight: '900', marginBottom: 10 },
    mockBarreFond: { height: 9, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
    mockBarreRempli: { height: '100%', borderRadius: 5 },
    mockBudgetReste: { fontSize: 12, fontWeight: '600' },

    mockCompte: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
    mockCompteIco: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
    mockCompteNom: { fontSize: 14, fontWeight: '700' },
    mockCompteType: { fontSize: 11, marginTop: 2 },
    mockCompteSolde: { fontSize: 15, fontWeight: '800' },
  });
}
