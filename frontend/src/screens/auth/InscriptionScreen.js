import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const LigneCritere = ({ valide, texte, C }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
    <Ionicons
      name={valide ? 'checkmark-circle' : 'ellipse-outline'}
      size={16}
      color={valide ? C.vert : C.dim}
      style={{ marginRight: 8 }}
    />
    <Text style={{ fontSize: 13, color: valide ? C.vert : C.dim }}>
      {texte}
    </Text>
  </View>
);

export default function InscriptionScreen({ navigation }) {
  const { inscrire, chargement } = useAuth();
  const { C } = useTheme();
  const s = creerStyles(C);

  const [courriel, setCourriel] = useState('');
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const criteres = {
    longueur: motDePasse.length >= 8,
    majuscule: /[A-Z]/.test(motDePasse),
    minuscule: /[a-z]/.test(motDePasse),
    chiffre: /[0-9]/.test(motDePasse),
  };
  const motDePasseValide = Object.values(criteres).every(Boolean);

  const gererInscription = async () => {
    setErreur('');
    setSucces('');
    if (!courriel || !nomUtilisateur || !motDePasse || !confirmation) {
      setErreur('Tous les champs sont obligatoires.');
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }
    const resultat = await inscrire(courriel, nomUtilisateur, motDePasse, confirmation);
    if (resultat.succes) {
      setSucces('Compte créé ! Vérifie ton courriel pour activer ton compte.');
      setCourriel('');
      setNomUtilisateur('');
      setMotDePasse('');
      setConfirmation('');
    } else {
      setErreur(resultat.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.entete}>
          <Text style={s.logo}>Budget<Text style={s.logoAccent}>Go</Text></Text>
          <Text style={s.titre}>Crée ton compte</Text>
          <Text style={s.sousTitre}>Gratuit, ça prend 2 minutes</Text>
        </View>

        <View style={s.carte}>
          {erreur ? (
            <View style={s.erreurBox}>
              <Text style={s.erreurTexte}>{erreur}</Text>
            </View>
          ) : null}
          {succes ? (
            <View style={s.succesBox}>
              <Text style={s.succesTexte}>{succes}</Text>
            </View>
          ) : null}

          <View style={s.champRow}>
            <Ionicons name="mail-outline" size={18} color={C.muted} style={s.champIco} />
            <TextInput
              style={s.champ}
              placeholder="Adresse courriel"
              placeholderTextColor={C.dim}
              value={courriel}
              onChangeText={setCourriel}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.champRow}>
            <Ionicons name="person-outline" size={18} color={C.muted} style={s.champIco} />
            <TextInput
              style={s.champ}
              placeholder="Nom d'utilisateur (3-30 caractères)"
              placeholderTextColor={C.dim}
              value={nomUtilisateur}
              onChangeText={setNomUtilisateur}
              autoCapitalize="none"
            />
          </View>

          <View style={s.champRow}>
            <Ionicons name="lock-closed-outline" size={18} color={C.muted} style={s.champIco} />
            <TextInput
              style={s.champ}
              placeholder="Mot de passe"
              placeholderTextColor={C.dim}
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry
            />
          </View>

          <View style={s.criteresBox}>
            <LigneCritere valide={criteres.longueur} texte="Au moins 8 caractères" C={C} />
            <LigneCritere valide={criteres.minuscule} texte="Au moins 1 lettre minuscule" C={C} />
            <LigneCritere valide={criteres.majuscule} texte="Au moins 1 lettre majuscule" C={C} />
            <LigneCritere valide={criteres.chiffre} texte="Au moins 1 chiffre" C={C} />
          </View>

          <View style={s.champRow}>
            <Ionicons name="lock-closed-outline" size={18} color={C.muted} style={s.champIco} />
            <TextInput
              style={s.champ}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={C.dim}
              value={confirmation}
              onChangeText={setConfirmation}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[s.btnSoumettre, (!motDePasseValide || chargement) && s.btnDesactive]}
            onPress={gererInscription}
            disabled={!motDePasseValide || chargement}
          >
            <Text style={s.btnTexte}>{chargement ? 'Création...' : 'Créer mon compte'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Connexion')}>
          <Text style={s.lien}>
            Déjà un compte ?{' '}
            <Text style={s.lienAccent}>Se connecter</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function creerStyles(C) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: C.fond },
    scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    entete: { alignItems: 'center', marginBottom: 28 },
    logo: { fontSize: 22, fontWeight: '900', color: C.texte, letterSpacing: -0.5, marginBottom: 20 },
    logoAccent: { color: C.purpleL },
    titre: { fontSize: 26, fontWeight: '900', color: C.texte, marginBottom: 6, letterSpacing: -0.3 },
    sousTitre: { fontSize: 14, color: C.muted, textAlign: 'center' },
    carte: { backgroundColor: C.surface, borderRadius: 22, padding: 22, borderWidth: 1, borderColor: C.bordure, marginBottom: 22 },
    erreurBox: { backgroundColor: C.rouge + '22', borderWidth: 1, borderColor: C.rouge + '44', borderRadius: 12, padding: 12, marginBottom: 14 },
    erreurTexte: { color: C.rouge, fontSize: 13, fontWeight: '600', textAlign: 'center' },
    succesBox: { backgroundColor: C.vert + '22', borderWidth: 1, borderColor: C.vert + '44', borderRadius: 12, padding: 12, marginBottom: 14 },
    succesTexte: { color: C.vert, fontSize: 13, fontWeight: '600', textAlign: 'center' },
    champRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface2, borderWidth: 1, borderColor: C.bordure2, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12 },
    champIco: { fontSize: 16, marginRight: 10, opacity: 0.6 },
    champ: { flex: 1, paddingVertical: 14, fontSize: 15, color: C.texte },
    criteresBox: { backgroundColor: C.surface2, borderRadius: 14, padding: 14, marginBottom: 12 },
    btnSoumettre: { backgroundColor: C.purple, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
    btnDesactive: { opacity: 0.4 },
    btnTexte: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    lien: { color: C.muted, fontSize: 14, textAlign: 'center' },
    lienAccent: { color: C.purpleL, fontWeight: '700', textDecorationLine: 'underline' },
  });
}
