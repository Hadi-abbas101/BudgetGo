from app import create_app, db
from app.models.categorie import Categorie, CATEGORIES_PAR_DEFAUT
from app.models.utilisateur import Utilisateur

app = create_app()

with app.app_context():
    # On récupère le premier utilisateur (ton compte de test)
    utilisateur = Utilisateur.query.first()

    if not utilisateur:
        print("❌ Aucun utilisateur trouvé. Crée un compte sur l'application d'abord !")
        exit()

    ajoutees = 0
    corrigees = 0
    for nom, type_cat, icone in CATEGORIES_PAR_DEFAUT:
        existe = Categorie.query.filter_by(nom=nom, id_utilisateur=utilisateur.id).first()
        if not existe:
            # On ajoute la catégorie manquante
            db.session.add(Categorie(
                nom=nom, type=type_cat, icone=icone, id_utilisateur=utilisateur.id
            ))
            ajoutees += 1
        elif existe.type != type_cat or existe.icone != icone:
            # On corrige le type / l'icône d'une catégorie déjà présente
            existe.type = type_cat
            existe.icone = icone
            corrigees += 1

    db.session.commit()
    print(f"✅ Terminé ! {ajoutees} ajoutée(s), {corrigees} corrigée(s) pour : {utilisateur.courriel}")
