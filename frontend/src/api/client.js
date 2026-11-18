import axios from 'axios';

// ⚙️ SEUL ENDROIT à modifier quand tu changes de réseau Wi-Fi.
// Trouve l'IP de ton Mac avec : ipconfig getifaddr en0
const HOTE = '172.20.10.6';
const BASE_URL = `http://${HOTE}:5000/api`;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Mémorise (ou efface) le jeton JWT pour toutes les requêtes suivantes.
// Appelée par AuthContext lors de la connexion et de la déconnexion.
export function definirJeton(jeton) {
  if (jeton) {
    client.defaults.headers.common['Authorization'] = `Bearer ${jeton}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
}

export default client;
