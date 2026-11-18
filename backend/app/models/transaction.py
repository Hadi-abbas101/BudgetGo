from datetime import datetime
from app import db

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(100), nullable=False)
    montant = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(20), nullable=False) 
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Les 3 clés étrangères pointant vers tes autres tables :
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    compte_id = db.Column(db.Integer, db.ForeignKey('comptes.id'), nullable=True)
    
    # 🎯 LE NOUVEL AJOUT : La clé étrangère vers la catégorie
    categorie_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'titre': self.titre,
            'montant': self.montant,
            'type': self.type,
            'date': self.date_creation.strftime("%d %b %Y"),
            'date_iso': self.date_creation.isoformat(),
            'categorie_id': self.categorie_id,
            'categorie': self.categorie.nom if self.categorie else None,
            'categorie_icone': self.categorie.icone if self.categorie else None,
            'compte_id': self.compte_id,
            'compte': self.compte.nom if self.compte else None
        }