from datetime import datetime, timedelta
import secrets
from werkzeug.security import generate_password_hash, check_password_hash
from .. import db

class Utilisateur(db.Model):
    __tablename__ = 'utilisateurs'

    id = db.Column(db.Integer, primary_key=True)
    courriel = db.Column(db.String(120), unique=True, nullable=False)
    nom_utilisateur = db.Column(db.String(30), unique=True, nullable=False)
    mot_de_passe_hash = db.Column(db.String(256), nullable=False)
    statut = db.Column(db.String(20), default='en_attente')  # en_attente, actif
    token_validation = db.Column(db.String(100), unique=True)
    token_expiration = db.Column(db.DateTime)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations
    comptes = db.relationship('Compte', backref='utilisateur', lazy=True)
    transactions = db.relationship('Transaction', backref='utilisateur', lazy=True)
    categories = db.relationship('Categorie', backref='utilisateur', lazy=True)

    def set_mot_de_passe(self, mot_de_passe):
        self.mot_de_passe_hash = generate_password_hash(mot_de_passe)

    def verifier_mot_de_passe(self, mot_de_passe):
        return check_password_hash(self.mot_de_passe_hash, mot_de_passe)

    def generer_token_validation(self):
        self.token_validation = secrets.token_urlsafe(32)
        self.token_expiration = datetime.utcnow() + timedelta(hours=24)
        return self.token_validation

    def token_valide(self):
        return (self.token_expiration is not None and
                self.token_expiration > datetime.utcnow())

    def to_dict(self):
        return {
            'id': self.id,
            'courriel': self.courriel,
            'nom_utilisateur': self.nom_utilisateur,
            'statut': self.statut,
            'date_creation': self.date_creation.isoformat()
        }
    
    