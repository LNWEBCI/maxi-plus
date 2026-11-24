# MAXI PLUS SARL — Plateforme Web BTP & Pièces Détachées

Site web professionnel complet pour l'entreprise **MAXI PLUS SARL** (Abidjan, Côte d'Ivoire), spécialisée dans l'importation & distribution de pièces détachées pour engins de chantier (marques chinoises et internationales : SDLG, XCMG, LiuGong, Shantui, SANY, Caterpillar) et la location d'engins lourds et de tracteurs.

---

## 🎨 Charte Graphique & Design
- **Palette de couleurs officielle** :
  - `#03300D` (Vert forêt profond / couleur principale logo)
  - `#81B39D` (Vert sauge & menthe / accents modernes)
  - `#FFFFFF` (Blanc pur pour la clarté et le contraste)
  - `#F59E0B` & `#D97706` (Jaune & ambre industriel BTP)
- **Design Signature** : Conteneur Hero à courbure prononcée, badges flottants translucides en glassmorphism, cadres de photos géométriques biseautés inspirés de la maquette de référence, et adaptabilité responsive mobile / tablette / bureau.
- **Devise** : **Franc CFA (FCFA / XOF)** sur l'intégralité du site et du tableau de bord.

---

## 🚀 Fonctionnalités Développées

### 1. Landing Page (Partie Publique — `index.php`)
- **En-tête & Barre de navigation** :
  - Intégration du logo officiel de MAXI PLUS SARL.
  - Liens rapides : Accueil, Nos Services, Location Engins & Poids Lourds, Pièces & Produits, Contact & Devis.
  - Panier interactif en temps réel avec calcul automatique en Francs CFA.
  - Accès direct au Dashboard Administrateur.
  - Bouton direct WhatsApp Express.
- **Hero Section Courbée** :
  - Slogan : *« LA DISPONIBILITÉ DE VOS ENGINS EST NOTRE PRIORITÉ ABSOLUE »*.
  - Badges d'autorité : « +500 Pièces en stock immédiat à Abidjan », « Tarifs d'usine en Francs CFA ».
  - Vignette miniature d'aperçu chantier / vidéo avec lecteur interactif.
  - Grande illustration haute définition d'engin de chantier.
- **Domaines d'Expertise (« Services We Provide »)** :
  - Importation & vente de pièces d'usure à forte rotation (filtration, hydraulique, chenilles, godets).
  - Location d'engins de chantier & poids lourds (pelles, chargeuses, niveleuses, bulldozers, bennes).
  - Maintenance & dépannage mécanique/hydraulique sur chantiers ivoiriens.
- **Section Location d'Engins & Véhicules Poids Lourds** :
  - Tracteurs routiers, camions bennes 20m³, pelles mécaniques 21T, bulldozers 17T, chargeuses 5T, chariots élévateurs.
  - Statuts en temps réel avec badges colorés : **Disponible** (vert), **En location** (orange), **En maintenance** (gris).
  - Tarifs journaliers et mensuels en **FCFA**.
  - Modal de réservation directe avec calcul d'estimation selon la durée choisie (jours ou mois).
- **Catalogue des Pièces Détachées (Onglet Produits)** :
  - Filtres par catégories : Filtration, Usure godet & chenille, Hydraulique, Freinage & transmission, Chariots élévateurs, Électrique, Composants lourds.
  - Barre de recherche instantanée par nom, marque (SDLG, XCMG, LiuGong...) ou référence SKU.
  - Ajout au panier en 1 clic et validation de commande avec livraison sur site.
- **Showcase Commande Mobile & WhatsApp** :
  - Maquette smartphone avec aperçu de chat WhatsApp commercial pour commander par simple envoi de photo de la pièce ou plaque d'engin.
- **Témoignages Clients & Partenaires BTP** :
  - Retours d'expérience authentiques d'entreprises de travaux publics à Abidjan (Yopougon, Angré), San-Pedro et Bouaké.
- **Bannière CTA & Footer Légal** :
  - Informations de l'entreprise : RCCM `CI-ABJ-03-2018-B13-21394`, NCC `1843673A`, localisation `Angré Djorobité, Garage zone industrielle, Abidjan`.

---

### 2. Dashboard Administrateur (`admin/index.php`)
- **Authentification Sécurisée** :
  - Protection de session PHP avec redirection automatique.
  - Identifiants configurés par défaut :
    - **Email** : `admin@maxiplus.ci`
    - **Mot de passe** : `admin123`
- **Tableau de Bord / Statistiques (Vue d'ensemble)** :
  - Chiffre d'Affaires total généré en Francs CFA.
  - Nombre total de commandes reçues et commandes en attente.
  - Nombre d'engins disponibles vs actuellement en location.
  - Nombre de pièces référencées en stock.
  - Table des commandes récentes avec mise à jour rapide.
- **Gestion des Commandes Clients** :
  - Visualisation détaillée de chaque commande (nom du client, contact, ville/chantier, articles commandés ou engin loué, montant en FCFA).
  - Modification instantanée du statut par liste déroulante : *En attente*, *Confirmée*, *En cours de livraison / En location*, *Terminée*, *Annulée*.
  - Bouton WhatsApp direct pour contacter le client en un clic.
  - Génération et impression de **Bon de Commande / Facture Proforma** avec logo et coordonnées complètes.
  - Suppression ou archivage de commande.
- **Gestion des Pièces & Produits (Vente)** :
  - Formulaire modal complet d'ajout de pièce (nom, référence SKU, catégorie, marque, prix en FCFA, stock, description, image).
  - Modification et ajustement des prix ou stocks.
  - Remplacement direct de l'image de la pièce par téléversement local de photo.
  - Suppression de produit.
- **Gestion des Engins en Location (Tracteurs & Matériel Lourd)** :
  - Formulaire d'ajout d'engin (nom, type, marque, modèle, tarif jour en FCFA, tarif mois en FCFA, caractéristiques techniques, statut, photo).
  - **Sélecteur de statut en 1 clic** (Disponible / En location / En maintenance) pour un contrôle visuel immédiat.
  - Modification des tarifs et remplacement de la photo.
- **Remplacement des Images du Site (Site Customizer)** :
  - L'administrateur peut remplacer en temps réel les images clés du site :
    1. Grande image Hero d'accueil
    2. Miniature vidéo Hero
    3. Logo officiel MAXI PLUS SARL
    4. Image de la section Pièces détachées
    5. Image de la section Location engins
    6. Mockup smartphone de commande WhatsApp
  - Téléversement direct depuis l'ordinateur de l'administrateur avec prévisualisation immédiate.

---

## 🛠️ Stack Technique
- **Backend** : PHP 8.5+, REST API (`api/products.php`, `api/machines.php`, `api/orders.php`, `api/site_settings.php`, `api/auth.php`, `api/upload.php`).
- **Base de Données** : SQLite 3 (`data/database.sqlite`) avec initialisation et amorçage automatique (aucun import manuel SQL nécessaire).
- **Frontend** : HTML5, React 18, Tailwind CSS, Lucide Icons, Vanilla CSS responsive.
- **Stockage de Médias** : `assets/images/` et `uploads/`.

---

## 🏃‍♂️ Comment Lancer le Projet ?

### Option 1 (Le plus simple — Double-clic)
Double-cliquez sur le fichier **`launch.bat`** situé à la racine du dossier :
Il démarre automatiquement le serveur PHP et ouvre votre navigateur à l'adresse **http://127.0.0.1:8000/**.

### Option 2 (Via Apache XAMPP)
1. Ouvrez le **Panneau de Contrôle XAMPP** (`C:\xampp\xampp-control.exe`).
2. Cliquez sur le bouton **Start** en face du module **Apache**.
3. Ouvrez votre navigateur et accédez à :
   - **Site public** : `http://localhost/Maxi%20Plus/`
   - **Administration** : `http://localhost/Maxi%20Plus/admin/`
