<?php
// api/db.php - Connexion Base de Données SQLite et initialisation automatique pour MAXI PLUS SARL

$dbDir = __DIR__ . '/../data';
if (!file_exists($dbDir)) {
    mkdir($dbDir, 0777, true);
}

// Configurer le répertoire de session local pour éviter les restrictions de C:\xampp\tmp
$sessionDir = $dbDir . '/sessions';
if (!file_exists($sessionDir)) {
    mkdir($sessionDir, 0777, true);
}
if (session_status() === PHP_SESSION_NONE) {
    @session_save_path($sessionDir);
}

$dbPath = $dbDir . '/database.sqlite';
$isFirstRun = !file_exists($dbPath);

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // Activer les clés étrangères
    $pdo->exec('PRAGMA foreign_keys = ON;');
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion base de données: ' . $e->getMessage()]);
    exit;
}

// Initialisation des tables si nécessaire
$pdo->exec("
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ref TEXT UNIQUE NOT NULL,
    category_id INTEGER,
    brand TEXT,
    price INTEGER NOT NULL, -- en FCFA
    stock INTEGER DEFAULT 10,
    description TEXT,
    image TEXT,
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    price_day INTEGER NOT NULL,   -- en FCFA par jour
    price_month INTEGER NOT NULL, -- en FCFA par mois
    specs TEXT,                   -- JSON ou texte descriptif (puissance, godet...)
    status TEXT DEFAULT 'Disponible', -- 'Disponible', 'En location', 'En maintenance'
    image TEXT,
    featured INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_ref TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_city TEXT DEFAULT 'Abidjan',
    type TEXT DEFAULT 'Vente', -- 'Vente Pièces', 'Location Engin', 'Mixte'
    items_json TEXT NOT NULL,  -- Liste détaillée des pièces ou engins loués
    total_amount INTEGER NOT NULL, -- en FCFA
    status TEXT DEFAULT 'En attente', -- 'En attente', 'Confirmée', 'En cours de livraison / En location', 'Terminée', 'Annulée'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
    key_name TEXT PRIMARY KEY,
    value_text TEXT,
    image_url TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
");

// Vérifier si des données initiales existent, sinon insérer
$checkCount = $pdo->query("SELECT COUNT(*) as count FROM users")->fetch();
if ($checkCount['count'] == 0) {
    // 1. Utilisateur Admin par défaut
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Administrateur MAXI PLUS', 'admin@maxiplus.ci', $adminPassword, 'admin']);

    // 2. Catégories de pièces issues du Plan d'Affaires
    $categories = [
        ['Filtration', 'filtration', 'Filtres à huile, à air, carburant et hydrauliques pour engins', 'Filter'],
        ['Pièces d\'usure godet & chenille', 'usure-chenille', 'Dents de godet, adaptateurs, patins de chenille, boulons', 'ShieldAlert'],
        ['Hydraulique', 'hydraulique', 'Flexibles haute pression, joints, raccords et joints spi', 'Activity'],
        ['Freinage & Transmission', 'freinage-transmission', 'Plaquettes, disques, courroies et embrayages', 'Disc'],
        ['Chariots Élévateurs', 'chariots-elevateurs', 'Fourches, chaînes de mât, galets, batteries et roues', 'Forklift'],
        ['Électrique & Capteurs', 'electrique', 'Capteurs, relais, faisceaux et phares LED de chantier', 'Zap'],
        ['Moteurs & Composants Lourds', 'composants-lourds', 'Moteurs complets, ponts, boîtes de transmission', 'Cpu']
    ];

    $catStmt = $pdo->prepare("INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)");
    foreach ($categories as $cat) {
        $catStmt->execute($cat);
    }

    // 3. Pièces de rechange réalistes en FCFA
    $initialProducts = [
        [
            'Filtre à Huile Moteur SDLG / Weichai WD615',
            'FIL-SDLG-01',
            1,
            'SDLG / Weichai',
            25000,
            45,
            'Filtre à huile haute filtration pour chargeuses SDLG LG956L et moteurs Weichai. Protège contre l\'abrasion et garantit une lubrification optimale.',
            'assets/images/part_filter_oil.svg',
            1
        ],
        [
            'Filtre à Carburant Décanteur XCMG ZL50GN',
            'FIL-XCMG-02',
            1,
            'XCMG',
            32000,
            30,
            'Séparateur d\'eau et filtre carburant pour chargeuse XCMG. Essentiel pour la qualité du gasoil en Côte d\'Ivoire.',
            'assets/images/part_filter_fuel.svg',
            1
        ],
        [
            'Dents de Godet Pelle 20T SDLG / Cat avec clavettes',
            'DEN-SDLG-20T',
            2,
            'SDLG / LiuGong',
            18500,
            120,
            'Dents renforcées en acier forgé haute résistance à l\'abrasion pour godet de pelle mécanique 20-22 tonnes.',
            'assets/images/part_bucket_teeth.svg',
            1
        ],
        [
            'Flexible Hydraulique 4 Nappes 5000 PSI 1 pouce',
            'FLEX-HYD-5000',
            3,
            'Multimarques',
            45000,
            60,
            'Flexible hydraulique ultra-haute pression certifié pour circuits hydrauliques de pelles et chargeuses.',
            'assets/images/part_hydraulic_hose.svg',
            1
        ],
        [
            'Kit Joints Vérin de Bras LiuGong CLG922E',
            'JNT-LIU-922',
            3,
            'LiuGong',
            75000,
            18,
            'Kit complet de joints d\'étanchéité Parker haute température pour vérins de levage.',
            'assets/images/part_seal_kit.svg',
            0
        ],
        [
            'Plaquettes de Frein Essieu Chargeuse XCMG',
            'FRN-XCMG-30',
            4,
            'XCMG',
            38000,
            25,
            'Jeu de plaquettes de frein avant/arrière pour chargeuses série ZL50 et LW500.',
            'assets/images/part_brake_pads.svg',
            0
        ],
        [
            'Fourches Forgées Chariot Élévateur Heli 3T (Paire)',
            'FRC-HELI-3T',
            5,
            'Heli / Hangcha',
            240000,
            8,
            'Paire de fourches en acier allié certifiées ISO 2330 pour chariots élévateurs 2.5T à 3.5T.',
            'assets/images/part_forks.svg',
            1
        ],
        [
            'Phare de Travail LED Chantier 48W 24V Étanche',
            'ELEC-LED-48W',
            6,
            'Universel',
            18000,
            85,
            'Projecteur LED étanche IP68 antichoc pour travaux de nuit sur pelles et bulldozers.',
            'assets/images/part_light_led.svg',
            1
        ],
        [
            'Pompe Hydraulique Principale SDLG 956L (Sur Commande)',
            'POMP-SDLG-956',
            7,
            'SDLG',
            1250000,
            3,
            'Pompe hydraulique d\'origine à engrenages haute performance pour chargeuse sur pneus.',
            'assets/images/part_hydraulic_pump.svg',
            1
        ]
    ];

    $prodStmt = $pdo->prepare("INSERT INTO products (name, ref, category_id, brand, price, stock, description, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($initialProducts as $p) {
        $prodStmt->execute($p);
    }

    // 4. Engins et Poids Lourds en Location avec statuts
    $initialMachines = [
        [
            'Pelle Hydraulique SDLG E6210F (21 Tonnes)',
            'Pelle Mécanique',
            'SDLG',
            'E6210F',
            220000,   // 220 000 FCFA / jour
            4800000,  // 4 800 000 FCFA / mois
            'Poids: 21.2 T | Godet: 1.0 m³ | Moteur: DDE Deutz 123 kW | Climatisation | Chenilles renforcées',
            'Disponible',
            'assets/images/machine_excavator.svg',
            1
        ],
        [
            'Chargeuse sur Pneus XCMG ZL50GN (5 Tonnes)',
            'Chargeuse',
            'XCMG',
            'ZL50GN',
            180000,   // 180 000 FCFA / jour
            3900000,  // 3 900 000 FCFA / mois
            'Capacité godet: 3.0 m³ | Charge utile: 5000 kg | Moteur Weichai 162 kW | Confort cabine ROPS/FOPS',
            'Disponible',
            'assets/images/machine_loader.svg',
            1
        ],
        [
            'Bulldozer Bouteur Shantui SD16 (17 Tonnes)',
            'Bulldozer',
            'Shantui',
            'SD16',
            260000,   // 260 000 FCFA / jour
            5500000,  // 5 500 000 FCFA / mois
            'Lame droite orientable 4.5 m³ | Ripper arrière 3 dents | Moteur Shangchai 120 kW',
            'En location',
            'assets/images/machine_bulldozer.svg',
            1
        ],
        [
            'Camion Benne 6x4 Sinotruk HOWO 371HP (20 m³)',
            'Poids Lourd',
            'Sinotruk',
            'HOWO 371',
            150000,   // 150 000 FCFA / jour
            3200000,  // 3 200 000 FCFA / mois
            'Charge max: 30T | Benne renforcée roche 20m³ | Ponts doubles réducteurs | Idéal carrière & terrassement',
            'Disponible',
            'assets/images/machine_dump_truck.svg',
            1
        ],
        [
            'Tracteur Routier 6x4 Shacman F3000 avec Porte-Engin',
            'Tracteur Poids Lourd',
            'Shacman',
            'F3000',
            290000,   // 290 000 FCFA / jour
            6200000,  // 6 200 000 FCFA / mois
            'Puissance 420 ch | Remorque surbaissée 60T 3 essieux | Transfert de pelles et bulldozers sur chantiers',
            'Disponible',
            'assets/images/machine_tractor_truck.svg',
            1
        ],
        [
            'Chariot Élévateur Diesel Heli CPCD35 (3.5 Tonnes)',
            'Manutention',
            'Heli',
            'CPCD35',
            65000,    // 65 000 FCFA / jour
            1400000,  // 1 400 000 FCFA / mois
            'Capacité: 3500 kg | Hauteur mât triplex: 4.8m | Déplacement latéral des fourches | Pneus pleins souples',
            'En maintenance',
            'assets/images/machine_forklift.svg',
            1
        ]
    ];

    $machStmt = $pdo->prepare("INSERT INTO machines (name, type, brand, model, price_day, price_month, specs, status, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($initialMachines as $m) {
        $machStmt->execute($m);
    }

    // 5. Exemples de commandes initiales pour tester le dashboard
    $sampleOrders = [
        [
            'CMD-2026-001',
            'Entreprise Ivoirienne de Terrassement (EIT)',
            '+225 07 45 88 12 34',
            'contact@eit-ci.com',
            'Abidjan - Yopougon Zone Industrielle',
            'Vente Pièces',
            json_encode([
                ['name' => 'Filtre à Huile Moteur SDLG / Weichai WD615', 'quantity' => 4, 'price' => 25000],
                ['name' => 'Dents de Godet Pelle 20T SDLG', 'quantity' => 10, 'price' => 18500],
                ['name' => 'Flexible Hydraulique 4 Nappes', 'quantity' => 2, 'price' => 45000]
            ], JSON_UNESCAPED_UNICODE),
            375000,
            'Confirmée',
            'Livraison urgente sur chantier 4ème Pont Yopougon.'
        ],
        [
            'CMD-2026-002',
            'BTP Génie Civil Kouassi & Frères',
            '+225 05 12 33 44 55',
            'kouassi.btp@gmail.com',
            'San-Pedro',
            'Location Engin',
            json_encode([
                ['name' => 'Pelle Hydraulique SDLG E6210F (21 Tonnes)', 'duration' => '15 jours', 'rate_day' => 220000]
            ], JSON_UNESCAPED_UNICODE),
            3300000,
            'En cours de livraison / En location',
            'Location avec chauffeur opérateur qualifié pour aménagement portuaire.'
        ],
        [
            'CMD-2026-003',
            'Société de Carrière du Grand Abidjan (SCGA)',
            '+225 01 99 22 11 00',
            'scga.abidjan@aviso.ci',
            'Abidjan - Angré',
            'Vente Pièces',
            json_encode([
                ['name' => 'Filtre à Carburant Décanteur XCMG ZL50GN', 'quantity' => 6, 'price' => 32000],
                ['name' => 'Phare de Travail LED Chantier 48W', 'quantity' => 4, 'price' => 18000]
            ], JSON_UNESCAPED_UNICODE),
            264000,
            'En attente',
            'Demande de confirmation de facture proforma.'
        ]
    ];

    $orderStmt = $pdo->prepare("INSERT INTO orders (order_ref, customer_name, customer_phone, customer_email, customer_city, type, items_json, total_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($sampleOrders as $ord) {
        $orderStmt->execute($ord);
    }

    // 6. Paramètres du site et Images personnalisables (Hero, Bannière, Mockup...)
    $siteSettings = [
        ['hero_title', 'L\'EXPERTISE BTP & PIÈCES D\'ENGINS', '', 'Titre principal Hero'],
        ['hero_subtitle', 'Importation directe, distribution de pièces certifiées et location de matériel lourd en Côte d\'Ivoire.', '', 'Sous-titre Hero'],
        ['hero_badge', 'LEADER PIÈCES CHINOISES & TOUTES MARQUES (SDLG, XCMG, LIUGONG, CAT)', '', 'Badge d\'accroche Hero'],
        ['hero_image', 'assets/images/hero_excavator.svg', 'assets/images/hero_excavator.svg', 'Grande image d\'engin section Hero'],
        ['hero_video_thumb', 'assets/images/hero_thumb.svg', 'assets/images/hero_thumb.svg', 'Image miniature aperçu chantier dans le Hero'],
        ['logo_image', 'assets/images/logo.jpg', 'assets/images/logo.jpg', 'Logo officiel MAXI PLUS SARL'],
        ['service_parts_image', 'assets/images/service_parts.svg', 'assets/images/service_parts.svg', 'Image illustrant la vente de pièces détachées'],
        ['service_rental_image', 'assets/images/service_rental.svg', 'assets/images/service_rental.svg', 'Image illustrant la location d\'engins lourds'],
        ['mobile_app_image', 'assets/images/mobile_mockup.svg', 'assets/images/mobile_mockup.svg', 'Image mockup smartphone commande WhatsApp'],
        ['cta_banner_image', 'assets/images/cta_banner.svg', 'assets/images/cta_banner.svg', 'Image de fond bannière devis d\'urgence']
    ];

    $settStmt = $pdo->prepare("INSERT OR REPLACE INTO site_settings (key_name, value_text, image_url, description) VALUES (?, ?, ?, ?)");
    foreach ($siteSettings as $s) {
        $settStmt->execute($s);
    }
}
