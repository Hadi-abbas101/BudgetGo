# BudgetGo

BudgetGo est une application mobile de gestion budgétaire destinée aux étudiants. Elle permet de consigner ses revenus et ses dépenses, de fixer un budget mensuel et de voir quelles catégories occupent la plus grande part de ses dépenses.

## Fonctionnalités

| Fonction | Utilisation |
| --- | --- |
| Tableau de bord | Consulter le solde calculé à partir des revenus et des dépenses, ainsi que les transactions récentes. |
| Comptes et transactions | Enregistrer une opération et l’associer à un compte et à une catégorie. |
| Planification | Définir un budget global pour un mois ou attribuer un montant à une catégorie précise. |
| Rapport mensuel | Parcourir les mois et visualiser la répartition des dépenses par catégorie dans un graphique en anneau. |
| Espace utilisateur | Créer un compte, confirmer son adresse courriel et ouvrir une session. |

## Architecture

L’interface mobile, développée avec **React Native et Expo**, communique avec une **API Flask** au moyen d’Axios. Après la connexion, le client joint un jeton JWT aux requêtes authentifiées. L’API utilise **SQLAlchemy** pour accéder aux données et **SQLite** comme base locale par défaut.

| Répertoire | Rôle |
| --- | --- |
| [frontend/src/screens](frontend/src/screens) | Écrans d’authentification, tableau de bord, comptes, planification et rapports. |
| [frontend/src/context](frontend/src/context) | Gestion de la session, des données budgétaires et du thème. |
| [frontend/src/api](frontend/src/api) | Configuration du client HTTP et transmission du jeton. |
| [backend/app/routes](backend/app/routes) | Points d’entrée de l’API pour les utilisateurs, les comptes, les transactions et les budgets. |
| [backend/app/models](backend/app/models) | Modèle relationnel des données budgétaires. |
| [backend/migrations](backend/migrations) | Historique des migrations du schéma de données. |

## Démarrage local

Installer Python avec le module `venv`, ainsi que Node.js et npm. Les commandes suivantes s’exécutent depuis la racine du projet dans deux terminaux distincts.

### 1. Préparer l’API

Dans le premier terminal, sous Windows (PowerShell) :

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pip install Flask-JWT-Extended
```

Sous macOS ou Linux, créer l’environnement avec `python3 -m venv .venv` et l’activer avec `source .venv/bin/activate`. L’installation séparée de `Flask-JWT-Extended` complète la liste actuelle des dépendances.

Créer ou adapter le fichier local `backend/.env`. Pour travailler avec une base de démonstration vierge, utiliser un nouveau nom de fichier SQLite. Remplacer les valeurs entre chevrons par les paramètres de son service SMTP, qui sert à envoyer le courriel d’activation.

```dotenv
SECRET_KEY=<cle-aleatoire-locale>
DATABASE_URL=sqlite:///budgetgo_demo.db
MAIL_SERVER=<serveur-smtp>
MAIL_PORT=587
MAIL_USERNAME=<identifiant-smtp>
MAIL_PASSWORD=<mot-de-passe-smtp>
MAIL_DEFAULT_SENDER=<adresse-expediteur>
```

Une clé peut être générée avec `python -c "import secrets; print(secrets.token_hex(32))"`. Conserver le fichier `.env` et les bases locales hors du dépôt public.

Démarrer ensuite le serveur depuis `backend/` :

```shell
python run.py
```

Le serveur de développement crée les tables manquantes et écoute sur le port 5000.

### 2. Connecter l’application

Dans [frontend/src/api/client.js](frontend/src/api/client.js), régler la constante `HOTE` selon l’appareil utilisé.

| Environnement | Valeur de `HOTE` |
| --- | --- |
| Navigateur sur l’ordinateur qui exécute Flask | `localhost` |
| Émulateur Android Studio standard | `10.0.2.2` |
| Téléphone sur le même réseau Wi-Fi | Adresse IPv4 locale de l’ordinateur qui exécute Flask |

Dans le second terminal :

```shell
cd frontend
npm ci
npm start
```

Ouvrir l’application avec une version d’Expo Go compatible avec le SDK 54 du projet, ou appuyer sur `w` dans le terminal Expo pour ouvrir la version Web.

### 3. Essayer le suivi budgétaire

1. Créer un utilisateur avec une adresse courriel accessible. Ouvrir le lien d’activation **sur l’ordinateur qui exécute Flask** : le lien généré utilise `localhost:5000`.
2. Se connecter et définir, par exemple, un budget mensuel de 250 $ pour l’alimentation.
3. Ajouter une dépense de 40 $ dans cette catégorie, puis ouvrir le rapport du mois pour consulter sa répartition.

Si le courriel d’activation tarde à arriver, consulter le terminal Flask. L’inscription peut créer le compte même si l’envoi SMTP échoue, et la connexion exige un compte activé.
