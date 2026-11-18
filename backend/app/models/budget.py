from datetime import datetime
from .. import db

class Budget(db.Model):
    __tablename__ = 'budgets'

    id = db.Column(db.Integer, primary_key=True)
    id_utilisateur = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    # categorie_id NULL = budget global du mois ; sinon budget d'une catégorie précise
    categorie_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    mois = db.Column(db.String(7), nullable=False)  # format "YYYY-MM"
    montant = db.Column(db.Float, nullable=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'categorie_id': self.categorie_id,
            'mois': self.mois,
            'montant': self.montant
        }
