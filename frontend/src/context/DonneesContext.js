import React, { createContext, useState, useContext, useCallback } from 'react';
import client from '../api/client';

const DonneesContext = createContext();

// Clé "YYYY-MM" à partir d'une date
export const cleMoisDe = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export function DonneesProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [solde, setSolde] = useState(0);
  const [budgetsParMois, setBudgetsParMois] = useState({}); // { "YYYY-MM": { global, categories } }
  const [comptes, setComptes] = useState([]);
  const [totalComptes, setTotalComptes] = useState(0);
  const [chargement, setChargement] = useState(true);

  const chargerTransactions = useCallback(async () => {
    try {
      const { data } = await client.get('/transactions/');
      if (data.succes) {
        setSolde(data.solde);
        setTransactions(data.transactions);
      }
    } catch (e) {
      console.error('chargerTransactions', e?.message);
    } finally {
      setChargement(false);
    }
  }, []);

  const chargerCategories = useCallback(async () => {
    try {
      const { data } = await client.get('/transactions/categories');
      if (data.succes) setCategories(data.categories);
    } catch (e) {
      console.error('chargerCategories', e?.message);
    }
  }, []);

  const chargerBudget = useCallback(async (mois) => {
    try {
      const { data } = await client.get(`/budgets/?mois=${mois}`);
      if (data.succes) {
        setBudgetsParMois(prev => ({
          ...prev,
          [mois]: { global: data.global || 0, categories: data.categories || {} }
        }));
      }
    } catch (e) {
      console.error('chargerBudget', e?.message);
    }
  }, []);

  const ajouterTransaction = useCallback(async ({ titre, montant, type, categorie_id }) => {
    const { data } = await client.post('/transactions/', { titre, montant, type, categorie_id });
    if (data.succes) await chargerTransactions();
    return data;
  }, [chargerTransactions]);

  const supprimerTransaction = useCallback(async (id) => {
    const { data } = await client.delete(`/transactions/${id}`);
    if (data.succes) await chargerTransactions();
    return data;
  }, [chargerTransactions]);

  const enregistrerBudget = useCallback(async (mois, montant, categorie_id = null) => {
    const { data } = await client.post('/budgets/', { mois, montant, categorie_id });
    if (data.succes) await chargerBudget(mois);
    return data;
  }, [chargerBudget]);

  const chargerRapport = useCallback(async (mois) => {
    const { data } = await client.get(`/transactions/rapport?mois=${mois}`);
    return data;
  }, []);

  const chargerComptes = useCallback(async () => {
    try {
      const { data } = await client.get('/comptes/');
      if (data.succes) {
        setComptes(data.comptes);
        setTotalComptes(data.total);
      }
    } catch (e) {
      console.error('chargerComptes', e?.message);
    }
  }, []);

  const ajouterCompte = useCallback(async ({ nom, type_compte, solde }) => {
    const { data } = await client.post('/comptes/', { nom, type_compte, solde });
    if (data.succes) await chargerComptes();
    return data;
  }, [chargerComptes]);

  const supprimerCompte = useCallback(async (id) => {
    const { data } = await client.delete(`/comptes/${id}`);
    if (data.succes) await chargerComptes();
    return data;
  }, [chargerComptes]);

  return (
    <DonneesContext.Provider value={{
      transactions, categories, solde, budgetsParMois, comptes, totalComptes, chargement,
      chargerTransactions, chargerCategories, chargerBudget,
      ajouterTransaction, supprimerTransaction, enregistrerBudget, chargerRapport,
      chargerComptes, ajouterCompte, supprimerCompte
    }}>
      {children}
    </DonneesContext.Provider>
  );
}

export const useDonnees = () => useContext(DonneesContext);
