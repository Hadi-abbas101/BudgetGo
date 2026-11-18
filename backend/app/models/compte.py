from datetime import datetime
from .. import db

class Compte(db.Model):
    __tablename__ = 'comptes'

    id = db.Column(db.Integer, primary_key=True)
    id_utilisateur = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    nom = db.Column(db.String(100), nullable=False)
    type_compte = db.Column(db.String(50), default='courant') # ex: courant, epargne
    solde = db.Column(db.Numeric(10, 2), default=0.00)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    # Relation avec les transactions
    transactions = db.relationship('Transaction', backref='compte', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'id_utilisateur': self.id_utilisateur,
            'nom': self.nom,
            'type_compte': self.type_compte,
            'solde': float(self.solde)
        }