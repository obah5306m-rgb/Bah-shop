# BAH BUSINESS

Application web de gestion pour petites entreprises et commerces.

## Version actuelle

Cette version MVP fonctionne directement dans le navigateur, sans serveur :

- Tableau de bord avec chiffre d'affaires, bénéfice et alertes de stock
- Ajout et modification des produits
- Gestion du stock
- Enregistrement des ventes
- Gestion des clients et crédits
- Enregistrement des dépenses
- Calcul automatique du bénéfice net
- Rapports simples
- Recherche de produits
- Données conservées dans `localStorage`
- Interface responsive téléphone / tablette / ordinateur
- Devise FCFA

## Utilisation dans VS Code

1. Clone ou télécharge le dépôt.
2. Ouvre le dossier dans Visual Studio Code.
3. Ouvre `index.html` avec Live Server, ou ouvre simplement le fichier dans Chrome.
4. Les données de démonstration sont créées automatiquement au premier lancement.

## Structure

- `index.html` : interface principale
- `style.css` : design responsive
- `app.js` : logique métier et stockage local

## Prochaine évolution

La prochaine étape consiste à remplacer `localStorage` par une vraie base de données avec authentification, utilisateurs, sauvegarde cloud et synchronisation multi-appareils.

Branche de développement : `bah-business`.
