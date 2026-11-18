from datetime import datetime
from .. import db

class Categorie(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    id_utilisateur = db.Column(db.Integer, db.ForeignKey('utilisateurs.id'), nullable=False)
    nom = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(10), nullable=False) # 'depense' ou 'revenu'
    icone = db.Column(db.String(50)) # Optionnel, utile pour ton interface mobile
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    # Relation avec les transactions
    transactions = db.relationship('Transaction', backref='categorie', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'type': self.type,
            'icone': self.icone
        }


# Catégories créées automatiquement pour chaque nouvel utilisateur.
# L'icône est un nom d'icône Ionicons (rendu monochrome côté mobile).
CATEGORIES_PAR_DEFAUT = [
    ('Épicerie', 'depense', 'cart'),
    ('Loyer', 'depense', 'home'),
    ('Transport', 'depense', 'bus'),
    ('Loisirs', 'depense', 'game-controller'),
    ('Restaurants', 'depense', 'restaurant'),
    ('Factures', 'depense', 'flash'),
    ('Études', 'depense', 'book'),
    ('Autre dépense', 'depense', 'cube'),
    ('Salaire', 'revenu', 'cash'),
    ('Bourse', 'revenu', 'school'),
    ('Autre revenu', 'revenu', 'add-circle'),
]


def creer_categories_par_defaut(id_utilisateur):
    """Crée les catégories de base pour un utilisateur (sans commit)."""
    for nom, type_cat, icone in CATEGORIES_PAR_DEFAUT:
        db.session.add(Categorie(
            nom=nom, type=type_cat, icone=icone, id_utilisateur=id_utilisateur
        ))