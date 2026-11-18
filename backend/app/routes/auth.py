from flask import Blueprint, request, jsonify, session
from .. import db, mail
from ..models.utilisateur import Utilisateur
from ..models.categorie import creer_categories_par_defaut
from flask_mail import Message
import re

from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

def valider_courriel(courriel):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, courriel) is not None

def valider_mot_de_passe(mdp):
    # Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
    return (len(mdp) >= 8 and
            any(c.isupper() for c in mdp) and
            any(c.islower() for c in mdp) and
            any(c.isdigit() for c in mdp))

@auth_bp.route('/inscription', methods=['POST'])
def inscription():
    data = request.get_json()
    courriel = data.get('courriel', '').strip().lower()
    nom_utilisateur = data.get('nom_utilisateur', '').strip()
    mot_de_passe = data.get('mot_de_passe', '')
    confirmation = data.get('confirmation_mot_de_passe', '')

    # Validations
    if not valider_courriel(courriel):
        return jsonify({'erreur': 'Adresse courriel invalide'}), 400
    if not (3 <= len(nom_utilisateur) <= 30):
        return jsonify({'erreur': 'Nom d\'utilisateur : 3 à 30 caractères'}), 400
    if not valider_mot_de_passe(mot_de_passe):
        return jsonify({'erreur': 'Mot de passe trop faible'}), 400
    if mot_de_passe != confirmation:
        return jsonify({'erreur': 'Les mots de passe ne correspondent pas'}), 400
    if Utilisateur.query.filter_by(courriel=courriel).first():
        return jsonify({'erreur': 'Courriel déjà utilisé'}), 409
    if Utilisateur.query.filter_by(nom_utilisateur=nom_utilisateur).first():
        return jsonify({'erreur': 'Nom d\'utilisateur déjà pris'}), 409

    # Créer l'utilisateur
    utilisateur = Utilisateur(courriel=courriel, nom_utilisateur=nom_utilisateur)
    utilisateur.set_mot_de_passe(mot_de_passe)
    token = utilisateur.generer_token_validation()
    db.session.add(utilisateur)
    db.session.commit()

    # Doter le nouveau compte des catégories de base
    creer_categories_par_defaut(utilisateur.id)
    db.session.commit()

    # Envoyer le courriel de confirmation
    try:
        msg = Message('Confirmer votre compte BudgetEtudiant.ca',
                      recipients=[courriel])
        msg.body = f'Cliquez ici pour confirmer : http://localhost:5000/api/auth/confirmer/{token}'
        mail.send(msg)
    except Exception as e:
        print(f'Erreur envoi courriel: {e}')

    return jsonify({'message': 'Compte créé. Vérifiez votre courriel.'}), 201

@auth_bp.route('/confirmer/<token>', methods=['GET'])
def confirmer_compte(token):
    utilisateur = Utilisateur.query.filter_by(token_validation=token).first()
    if not utilisateur:
        return jsonify({'erreur': 'Token invalide'}), 400
    if not utilisateur.token_valide():
        return jsonify({'erreur': 'Token expiré'}), 400

    utilisateur.statut = 'actif'
    utilisateur.token_validation = None
    db.session.commit()
    return jsonify({'message': 'Compte activé avec succès'}), 200

@auth_bp.route('/connexion', methods=['POST'])
def connexion():
    data = request.get_json()
    courriel = data.get('courriel', '').strip().lower()
    mot_de_passe = data.get('mot_de_passe', '')

    utilisateur = Utilisateur.query.filter_by(courriel=courriel).first()
    if not utilisateur or not utilisateur.verifier_mot_de_passe(mot_de_passe):
        return jsonify({'erreur': 'Courriel ou mot de passe incorrect'}), 401
    
    if utilisateur.statut != 'actif':
        return jsonify({'erreur': 'Compte non confirmé'}), 403

    # 🎯 LE CHANGEMENT EST ICI : On crée le jeton avec l'ID de l'utilisateur
    # On le convertit en string (str) car JWT préfère les textes aux nombres
    jeton_jwt = create_access_token(identity=str(utilisateur.id))

    # On renvoie explicitement le jeton dans la réponse JSON
    return jsonify({
        'message': 'Connexion réussie',
        'access_token': jeton_jwt,  # <-- Le fameux jeton !
        'utilisateur': utilisateur.to_dict()
    }), 200

@auth_bp.route('/deconnexion', methods=['POST'])
def deconnexion():
    # Le JWT est sans état : la déconnexion se fait côté client en effaçant le jeton.
    # Cette route répond simplement OK pour confirmer.
    return jsonify({'message': 'Déconnexion réussie'}), 200