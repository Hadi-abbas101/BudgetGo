from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.budget import Budget

budgets_bp = Blueprint('budgets', __name__)


@budgets_bp.route('/', methods=['GET'])
@jwt_required()
def obtenir_budgets():
    utilisateur_id = get_jwt_identity()
    mois = request.args.get('mois')  # "YYYY-MM"

    requete = Budget.query.filter_by(id_utilisateur=utilisateur_id)
    if mois:
        requete = requete.filter_by(mois=mois)
    budgets = requete.all()

    global_montant = None
    par_categorie = {}
    for b in budgets:
        if b.categorie_id is None:
            global_montant = b.montant
        else:
            par_categorie[str(b.categorie_id)] = b.montant

    return jsonify({
        "succes": True,
        "mois": mois,
        "global": global_montant,
        "categories": par_categorie
    }), 200


@budgets_bp.route('/', methods=['POST'])
@jwt_required()
def definir_budget():
    utilisateur_id = get_jwt_identity()
    donnees = request.get_json()

    mois = donnees.get('mois')                 # "YYYY-MM" (obligatoire)
    montant = donnees.get('montant')           # nombre (obligatoire)
    categorie_id = donnees.get('categorie_id')  # None = budget global

    if not mois or montant is None:
        return jsonify({"succes": False, "message": "mois et montant sont requis"}), 400

    # Upsert : on met à jour le budget existant pour (utilisateur, mois, catégorie), sinon on le crée
    budget = Budget.query.filter_by(
        id_utilisateur=utilisateur_id, mois=mois, categorie_id=categorie_id
    ).first()

    if budget:
        budget.montant = float(montant)
    else:
        budget = Budget(
            id_utilisateur=utilisateur_id,
            mois=mois,
            montant=float(montant),
            categorie_id=categorie_id
        )
        db.session.add(budget)

    db.session.commit()
    return jsonify({"succes": True, "message": "Budget enregistré", "budget": budget.to_dict()}), 200
