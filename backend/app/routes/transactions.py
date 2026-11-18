from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.categorie import Categorie

# On spécifie le chemin exact vers le fichier du modèle
from app.models.transaction import Transaction  
# On récupère db depuis l'initialisation de l'application
from app import db  

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['POST'])
@jwt_required() # Protection : il faut être connecté !
def ajouter_transaction():
    # Identifie l'utilisateur grâce à son jeton
    utilisateur_actuel_id = get_jwt_identity()
    donnees = request.get_json()

    titre = donnees.get('titre')
    montant = donnees.get('montant')
    type_transaction = donnees.get('type')
    categorie_id = donnees.get('categorie_id')  # optionnel
    compte_id = donnees.get('compte_id')          # optionnel

    if not titre or not montant or not type_transaction:
        return jsonify({"message": "Données incomplètes"}), 400

    nouvelle_transaction = Transaction(
        titre=titre,
        montant=float(montant),
        type=type_transaction,
        categorie_id=categorie_id,
        compte_id=compte_id,
        utilisateur_id=utilisateur_actuel_id
    )

    db.session.add(nouvelle_transaction)
    db.session.commit()

    return jsonify({
        "succes": True, 
        "message": "Transaction ajoutée", 
        "transaction": nouvelle_transaction.to_dict()
    }), 201


@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def obtenir_donnees_tableau_bord():
    utilisateur_actuel_id = get_jwt_identity()

    # 1. Récupérer uniquement les transactions de cet utilisateur, de la plus récente à la plus ancienne
    transactions = Transaction.query.filter_by(utilisateur_id=utilisateur_actuel_id)\
                                    .order_by(Transaction.date_creation.desc()).all()

    # 2. Calculer le solde total
    solde = 0.0
    for t in transactions:
        if t.type == 'revenu':
            solde += t.montant
        elif t.type == 'depense':
            solde -= t.montant

    # 3. Transformer les objets Python en dictionnaires pour le JSON
    liste_transactions = [t.to_dict() for t in transactions]

    return jsonify({
        "succes": True,
        "solde": solde,
        "transactions": liste_transactions
    }), 200

@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def supprimer_transaction(transaction_id):
    utilisateur_actuel_id = get_jwt_identity()
    
    # 1. On cherche la transaction dans la base de données
    transaction = Transaction.query.get(transaction_id)

    # 2. Vérifications de sécurité
    if not transaction:
        return jsonify({"succes": False, "message": "Transaction introuvable"}), 404
        
    # str() par sécurité, car le JWT renvoie parfois l'ID sous forme de texte
    if str(transaction.utilisateur_id) != str(utilisateur_actuel_id):
        return jsonify({"succes": False, "message": "Non autorisé"}), 403

    # 3. Suppression officielle
    db.session.delete(transaction)
    db.session.commit()

    return jsonify({"succes": True, "message": "Transaction supprimée"}), 200

@transactions_bp.route('/categories', methods=['GET'])
@jwt_required()
def obtenir_categories():
    utilisateur_actuel_id = get_jwt_identity()
    # On ne renvoie que les catégories de l'utilisateur connecté
    categories = Categorie.query.filter_by(id_utilisateur=utilisateur_actuel_id).all()

    liste_categories = [c.to_dict() for c in categories]

    return jsonify({
        "succes": True,
        "categories": liste_categories
    }), 200


@transactions_bp.route('/rapport', methods=['GET'])
@jwt_required()
def rapport_mensuel():
    utilisateur_id = get_jwt_identity()
    mois = request.args.get('mois')  # "YYYY-MM"

    transactions = Transaction.query.filter_by(utilisateur_id=utilisateur_id).all()

    # On ne garde que les transactions du mois demandé
    if mois:
        annee, num_mois = mois.split('-')
        transactions = [
            t for t in transactions
            if t.date_creation.year == int(annee) and t.date_creation.month == int(num_mois)
        ]

    total_depenses = 0.0
    total_revenus = 0.0
    regroupement = {}  # nom_categorie -> {montant, icone}

    for t in transactions:
        if t.type == 'revenu':
            total_revenus += t.montant
            continue
        # dépense
        total_depenses += t.montant
        nom = t.categorie.nom if t.categorie else 'Sans catégorie'
        icone = t.categorie.icone if t.categorie else '❔'
        if nom not in regroupement:
            regroupement[nom] = {'montant': 0.0, 'icone': icone}
        regroupement[nom]['montant'] += t.montant

    # Construction de la liste triée par montant décroissant, avec pourcentages
    par_categorie = []
    for nom, info in regroupement.items():
        pourcentage = (info['montant'] / total_depenses * 100) if total_depenses > 0 else 0
        par_categorie.append({
            'categorie': nom,
            'icone': info['icone'],
            'montant': round(info['montant'], 2),
            'pourcentage': round(pourcentage, 1)
        })
    par_categorie.sort(key=lambda x: x['montant'], reverse=True)

    return jsonify({
        "succes": True,
        "mois": mois,
        "total_depenses": round(total_depenses, 2),
        "total_revenus": round(total_revenus, 2),
        "solde_mois": round(total_revenus - total_depenses, 2),
        "par_categorie": par_categorie
    }), 200