import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ConnexionScreen({ navigation }) {
  const { connecter, chargement } = useAuth();
  const { C } = useTheme();
  const s = creerStyles(C);

  const [courriel, setCourriel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');

  const gererConnexion = async () => {
    setErreur('');
    if (!courriel || !motDePasse) {
      setErreur('Veuillez remplir tous les champs.');
      return;
    }
    const resultat = await connecter(courriel, motDePasse);
    if (!resultat.succes) setErreur(resultat.message);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.entete}>
          <Text style={s.logo}>Budget<Text style={s.logoAccent}>Go</Text></Text>
          <Text style={s.titre}>Content de te revoir !</Text>
          <Text style={s.sousTitre}>Connecte-toi à ton espace</Text>
        </View>

        <View style={s.carte}>
          {erreur ? (
            <View style={s.erreurBox}>
              <Text style={s.erreurTexte}>{erreur}</Text>
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

          <TouchableOpacity style={s.oublieLien}>
            <Text style={s.oublieTexte}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btnSoumettre, chargement && s.btnDesactive]}
            onPress={gererConnexion}
            disabled={chargement}
          >
            <Text style={s.btnTexte}>{chargement ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Inscription')}>
          <Text style={s.lien}>
            Pas encore de compte ?{' '}
            <Text style={s.lienAccent}>S'inscrire gratuitement</Text>
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
    sousTitre: { fontSize: 14, color: C.muted },
    carte: { backgroundColor: C.surface, borderRadius: 22, padding: 22, borderWidth: 1, borderColor: C.bordure, marginBottom: 22 },
    erreurBox: { backgroundColor: C.rouge + '22', borderWidth: 1, borderColor: C.rouge + '44', borderRadius: 12, padding: 12, marginBottom: 14 },
    erreurTexte: { color: C.rouge, fontSize: 13, fontWeight: '600', textAlign: 'center' },
    champRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface2, borderWidth: 1, borderColor: C.bordure2, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12 },
    champIco: { fontSize: 16, marginRight: 10, opacity: 0.6 },
    champ: { flex: 1, paddingVertical: 14, fontSize: 15, color: C.texte },
    oublieLien: { alignSelf: 'flex-end', marginBottom: 16, marginTop: 2 },
    oublieTexte: { color: C.purpleL, fontSize: 13, fontWeight: '600' },
    btnSoumettre: { backgroundColor: C.purple, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
    btnDesactive: { opacity: 0.5 },
    btnTexte: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
    lien: { color: C.muted, fontSize: 14, textAlign: 'center' },
    lienAccent: { color: C.purpleL, fontWeight: '700', textDecorationLine: 'underline' },
  });
}
