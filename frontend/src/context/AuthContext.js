import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { definirJeton } from '../api/client';

const AuthContext = createContext();
const CLE_SESSION = 'budgetgo_utilisateur';

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [initialisation, setInitialisation] = useState(true); // true tant qu'on vérifie la session sauvegardée

  // Au démarrage : on tente de restaurer la session sauvegardée sur l'appareil
  useEffect(() => {
    (async () => {
      try {
        const sauvegarde = await AsyncStorage.getItem(CLE_SESSION);
        if (sauvegarde) {
          const u = JSON.parse(sauvegarde);
          if (u?.token) {
            definirJeton(u.token);      // ré-authentifie le client API
            setUtilisateur(u);
          }
        }
      } catch (e) {
        console.log('Restauration session échouée', e?.message);
      } finally {
        setInitialisation(false);
      }
    })();
  }, []);

const connecter = async (courriel, motDePasse) => {
    setChargement(true);
    try {
      const reponse = await client.post('/auth/connexion', {
        courriel,
        mot_de_passe: motDePasse
      });
      
      // 🎯 LA MAGIE EST ICI :
      // On utilise "...reponse.data.utilisateur" pour garder toutes les infos du profil
      // ET on y ajoute une nouvelle propriété "token" qui contient la clé de sécurité.
      // On enregistre le jeton dans le client API : toutes les requêtes suivantes
      // (tableau de bord, transactions...) seront authentifiées automatiquement.
      definirJeton(reponse.data.access_token);

      const u = {
        ...reponse.data.utilisateur,
        token: reponse.data.access_token
      };
      setUtilisateur(u);
      // On sauvegarde la session pour rester connecté au prochain démarrage
      await AsyncStorage.setItem(CLE_SESSION, JSON.stringify(u));

      return { succes: true };
    } catch (erreur) {
      return { 
        succes: false, 
        message: erreur.response?.data?.erreur || 'Erreur de connexion' 
      };
    } finally {
      setChargement(false);
    }
  };

  const inscrire = async (courriel, nomUtilisateur, motDePasse, confirmation) => {
    setChargement(true);
    try {
      await client.post('/auth/inscription', {
        courriel,
        nom_utilisateur: nomUtilisateur,
        mot_de_passe: motDePasse,
        confirmation_mot_de_passe: confirmation
      });
      return { succes: true };
    } catch (erreur) {
      return { 
        succes: false, 
        message: erreur.response?.data?.erreur || 'Erreur d\'inscription' 
      };
    } finally {
      setChargement(false);
    }
  };

  const deconnecter = async () => {
    // Appel à l'API pour détruire la session côté backend
    try {
      await client.post('/auth/deconnexion');
    } catch (e) {
      console.log('Erreur lors de la déconnexion API', e);
    }
    definirJeton(null); // on retire le jeton du client API
    setUtilisateur(null);
    await AsyncStorage.removeItem(CLE_SESSION); // on efface la session sauvegardée
  };

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, initialisation, connecter, inscrire, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);