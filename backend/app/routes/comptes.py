from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.compte import Compte
from app.models.transaction import Transaction

comptes_bp = Blueprint('comptes', __name__)


@comptes_bp.route('/', methods=['GET'])
@jwt_required()
def lister_comptes():
    uid = get_jwt_identity()
    comptes = Compte.query.filter_by(id_utilisateur=uid).order_by(Compte.date_creation.asc()).all()

    liste = []
    total = 0.0
    for c in comptes:
        # Solde actuel = solde initial + mouvements des transactions reliées à ce compte
        txs = Transaction.query.filter_by(compte_id=c.id).all()
        mouvement = sum(t.montant if t.type == 'revenu' else -t.montant for t in txs)
        actuel = round(float(c.solde) + mouvement, 2)
        total += actuel

        d = c.to_dict()
        d['solde_initial'] = float(c.solde)
        d['solde'] = actuel  # le solde affiché tient compte des transactions
        liste.append(d)

    return jsonify({
        "succes": True,
        "comptes": liste,
        "total": round(total, 2)
    }), 200


@comptes_bp.route('/', methods=['POST'])
@jwt_required()
def creer_compte():
    uid = get_jwt_identity()
    donnees = request.get_json()
    nom = (donnees.get('nom') or '').strip()
    type_compte = donnees.get('type_compte') or 'cheque'
    solde = donnees.get('solde', 0)

    if not nom:
        return jsonify({"succes": False, "message": "Le nom du compte est requis"}), 400

    compte = Compte(
        nom=nom,
        type_compte=type_compte,
        solde=float(solde or 0),
        id_utilisateur=uid
    )
    db.session.add(compte)
    db.session.commit()
    return jsonify({"succes": True, "message": "Compte créé", "compte": compte.to_dict()}), 201


@comptes_bp.route('/<int:compte_id>', methods=['DELETE'])
@jwt_required()
def supprimer_compte(compte_id):
    uid = get_jwt_identity()
    compte = Compte.query.get(compte_id)
    if not compte:
        return jsonify({"succes": False, "message": "Compte introuvable"}), 404
    if str(compte.id_utilisateur) != str(uid):
        return jsonify({"succes": False, "message": "Non autorisé"}), 403

    db.session.delete(compte)
    db.session.commit()
    return jsonify({"succes": True, "message": "Compte supprimé"}), 200
