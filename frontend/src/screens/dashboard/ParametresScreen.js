import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Toggle = ({ valeur, onToggle, C }) => (
  <TouchableOpacity
    onPress={onToggle}
    style={[
      staticStyles.togglePiste,
      { backgroundColor: valeur ? C.purple : C.surface3, borderColor: valeur ? C.purple : C.bordure2 }
    ]}
    accessibilityRole="switch"
    accessibilityState={{ checked: valeur }}
  >
    <View style={[staticStyles.togglePouce, { marginLeft: valeur ? 20 : 2 }]} />
  </TouchableOpacity>
);

const LigneParam = ({ icone, titre, sousTitre, droite, onPress, C, danger }) => (
  <TouchableOpacity
    style={[staticStyles.ligne, { borderBottomColor: C.bordure }]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.65 : 1}
  >
    <View style={staticStyles.ligneGauche}>
      <View style={[staticStyles.ligneIco, { backgroundColor: icone.fond }]}>
        <Ionicons name={icone.nom} size={17} color={icone.couleur} />
      </View>
      <View>
        <Text style={[staticStyles.ligneTitre, { color: danger ? C.rouge : C.texte }]}>{titre}</Text>
        {sousTitre ? <Text style={[staticStyles.ligneSousTitre, { color: C.muted }]}>{sousTitre}</Text> : null}
      </View>
    </View>
    {droite}
  </TouchableOpacity>
);

export default function ParametresScreen({ navigation }) {
  const { deconnecter, utilisateur } = useAuth();
  const { C, estSombre, toggleTheme } = useTheme();
  const s = creerStyles(C);

  const [notifBudget, setNotifBudget] = useState(true);
  const [notifRappel, setNotifRappel] = useState(false);
  const [biometrie, setBiometrie] = useState(false);

  const chevron = <Ionicons name="chevron-forward" size={18} color={C.dim} />;

  const gererDeconnexion = () => {
    Alert.alert(
      'Se déconnecter',
      "Tu seras redirigé vers l'écran d'accueil.",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: deconnecter }
      ]
    );
  };

  const initiales = utilisateur?.nom_utilisateur?.substring(0, 2).toUpperCase() || 'BG';

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity style={s.btnRetour} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={C.muted} />
          </TouchableOpacity>
          <View>
            <Text style={s.titre}>Paramètres</Text>
            <Text style={s.sousTitre}>Personnalise ton expérience</Text>
          </View>
        </View>

        <View style={[s.profilCard, { backgroundColor: C.surface, borderColor: C.bordure }]}>
          <View style={[s.avatar, { backgroundColor: C.purple }]}>
            <Text style={s.avatarTexte}>{initiales}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.profilNom, { color: C.texte }]}>{utilisateur?.nom_utilisateur || 'Utilisateur'}</Text>
            <Text style={[s.profilEmail, { color: C.muted }]}>{utilisateur?.courriel || ''}</Text>
          </View>
          {chevron}
        </View>

        <Text style={[s.secLbl, { color: C.purple }]}>APPARENCE</Text>
        <View style={[s.section, { backgroundColor: C.surface, borderColor: C.bordure }]}>
          <LigneParam
            icone={{ fond: C.purple + '25', nom: estSombre ? 'moon' : 'sunny', couleur: C.purple }}
            titre="Thème sombre"
            sousTitre={estSombre ? 'Activé' : 'Désactivé'}
            onPress={toggleTheme}
            droite={<Toggle valeur={estSombre} onToggle={toggleTheme} C={C} />}
            C={C}
          />
          <LigneParam
            icone={{ fond: C.purple + '25', nom: 'text', couleur: C.purple }}
            titre="Taille du texte"
            sousTitre="Normale"
            onPress={() => {}}
            droite={chevron}
            C={C}
          />
        </View>

        <Text style={[s.secLbl, { color: C.purple }]}>NOTIFICATIONS</Text>
        <View style={[s.section, { backgroundColor: C.surface, borderColor: C.bordure }]}>
          <LigneParam
            icone={{ fond: '#F59E0B25', nom: 'notifications', couleur: '#F59E0B' }}
            titre="Alertes de budget"
            sousTitre="À 60% et 80% atteints"
            onPress={() => setNotifBudget(v => !v)}
            droite={<Toggle valeur={notifBudget} onToggle={() => setNotifBudget(v => !v)} C={C} />}
            C={C}
          />
          <LigneParam
            icone={{ fond: '#F59E0B25', nom: 'calendar', couleur: '#F59E0B' }}
            titre="Rappels mensuels"
            sousTitre="Le 1er de chaque mois"
            onPress={() => setNotifRappel(v => !v)}
            droite={<Toggle valeur={notifRappel} onToggle={() => setNotifRappel(v => !v)} C={C} />}
            C={C}
          />
        </View>

        <Text style={[s.secLbl, { color: C.purple }]}>SÉCURITÉ</Text>
        <View style={[s.section, { backgroundColor: C.surface, borderColor: C.bordure }]}>
          <LigneParam
            icone={{ fond: '#10B98125', nom: 'finger-print', couleur: '#10B981' }}
            titre="Face ID / Touch ID"
            sousTitre="Déverrouillage biométrique"
            onPress={() => setBiometrie(v => !v)}
            droite={<Toggle valeur={biometrie} onToggle={() => setBiometrie(v => !v)} C={C} />}
            C={C}
          />
          <LigneParam
            icone={{ fond: '#10B98125', nom: 'keypad', couleur: '#10B981' }}
            titre="Code PIN"
            sousTitre="Non configuré"
            onPress={() => {}}
            droite={chevron}
            C={C}
          />
        </View>

        <Text style={[s.secLbl, { color: C.purple }]}>PRÉFÉRENCES</Text>
        <View style={[s.section, { backgroundColor: C.surface, borderColor: C.bordure }]}>
          <LigneParam icone={{ fond: '#3B82F625', nom: 'cash', couleur: '#3B82F6' }} titre="Devise" sousTitre="Dollar canadien (CAD)" onPress={() => {}} droite={chevron} C={C} />
          <LigneParam icone={{ fond: '#3B82F625', nom: 'globe', couleur: '#3B82F6' }} titre="Langue" sousTitre="Français" onPress={() => {}} droite={chevron} C={C} />
          <LigneParam icone={{ fond: '#3B82F625', nom: 'calendar-number', couleur: '#3B82F6' }} titre="Début du mois" sousTitre="1er du mois" onPress={() => {}} droite={chevron} C={C} />
        </View>

        <Text style={[s.secLbl, { color: C.purple }]}>DONNÉES</Text>
        <View style={[s.section, { backgroundColor: C.surface, borderColor: C.bordure }]}>
          <LigneParam
            icone={{ fond: C.surface3, nom: 'download-outline', couleur: C.muted }}
            titre="Exporter les transactions"
            sousTitre="Format CSV ou PDF"
            onPress={() => {}}
            droite={chevron}
            C={C}
          />
          <LigneParam
            icone={{ fond: C.rouge + '22', nom: 'trash', couleur: C.rouge }}
            titre="Effacer l'historique"
            sousTitre="Supprimer toutes les données"
            onPress={() => Alert.alert(
              "Effacer l'historique",
              'Cette action est irréversible.',
              [{ text: 'Annuler', style: 'cancel' }, { text: 'Effacer', style: 'destructive' }]
            )}
            droite={chevron}
            C={C}
          />
        </View>

        <Text style={[s.secLbl, { color: C.purple }]}>À PROPOS</Text>
        <View style={[s.section, { backgroundColor: C.surface, borderColor: C.bordure }]}>
          <LigneParam
            icone={{ fond: C.surface3, nom: 'information-circle', couleur: C.muted }}
            titre="Version"
            droite={<Text style={{ color: C.dim, fontSize: 13 }}>1.0.0</Text>}
            C={C}
          />
          <LigneParam
            icone={{ fond: C.surface3, nom: 'shield-checkmark', couleur: C.muted }}
            titre="Politique de confidentialité"
            onPress={() => {}}
            droite={chevron}
            C={C}
          />
        </View>

        <View style={[s.section, { backgroundColor: C.surface, borderColor: C.bordure, marginBottom: 0 }]}>
          <LigneParam
            icone={{ fond: C.rouge + '22', nom: 'log-out', couleur: C.rouge }}
            titre="Se déconnecter"
            onPress={gererDeconnexion}
            droite={null}
            C={C}
            danger
          />
        </View>

        <Text style={[s.versionTexte, { color: C.dim }]}>
          BudgetGo · v1.0.0 · Fait avec ♥ pour les étudiants
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const staticStyles = StyleSheet.create({
  togglePiste: { width: 44, height: 26, borderRadius: 13, borderWidth: 1, justifyContent: 'center' },
  togglePouce: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: 1 },
  ligneGauche: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  ligneIco: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  ligneIcoTexte: { fontSize: 15 },
  ligneTitre: { fontSize: 14, fontWeight: '600' },
  ligneSousTitre: { fontSize: 11, marginTop: 2 },
  chevron: { fontSize: 20, fontWeight: '300' },
});

function creerStyles(C) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: C.fond },
    scroll: { padding: 16, paddingBottom: 32 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, marginTop: 8 },
    btnRetour: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.bordure2, justifyContent: 'center', alignItems: 'center' },
    btnRetourTexte: { fontSize: 24, fontWeight: '300', marginTop: -2 },
    titre: { fontSize: 22, fontWeight: '900', color: C.texte, letterSpacing: -0.3 },
    sousTitre: { fontSize: 13, color: C.muted, marginTop: 2 },
    profilCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 6 },
    avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
    avatarTexte: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    profilNom: { fontSize: 15, fontWeight: '700' },
    profilEmail: { fontSize: 12, marginTop: 2 },
    secLbl: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6, marginTop: 18, marginLeft: 2 },
    section: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 2 },
    versionTexte: { textAlign: 'center', fontSize: 11, marginTop: 22, marginBottom: 8 },
  });
}
