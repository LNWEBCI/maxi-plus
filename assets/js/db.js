// assets/js/db.js - Moteur de Base de Données Client & Synchronisation LocalStorage pour MAXI PLUS SARL
// Compatible Déploiement Vercel / Hébergement Statique HTML

(function () {
  const STORAGE_KEY = 'MAXI_PLUS_DATABASE_V2';
  const AUTH_KEY = 'MAXI_PLUS_AUTH_SESSION_V2';

  // Données initiales officielles MAXI PLUS SARL (Côte d'Ivoire)
  const INITIAL_DATA = {
    products: [
      {
        id: 1,
        name: "Filtre à Huile Moteur SDLG / Weichai WD615",
        ref: "FIL-SDLG-01",
        category_id: 1,
        brand: "SDLG / Weichai",
        price: 25000,
        stock: 45,
        description: "Filtre à huile haute filtration pour chargeuses SDLG LG956L et moteurs Weichai. Protège contre l'abrasion et garantit une lubrification optimale.",
        image: "assets/images/part_filter_oil.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 2,
        name: "Filtre à Carburant Décanteur XCMG ZL50GN",
        ref: "FIL-XCMG-02",
        category_id: 1,
        brand: "XCMG",
        price: 32000,
        stock: 30,
        description: "Séparateur d'eau et filtre carburant pour chargeuse XCMG. Essentiel pour la qualité du gasoil en Côte d'Ivoire.",
        image: "assets/images/part_filter_fuel.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 3,
        name: "Dents de Godet Pelle 20T SDLG / Cat avec clavettes",
        ref: "DEN-SDLG-20T",
        category_id: 2,
        brand: "SDLG / LiuGong",
        price: 18500,
        stock: 120,
        description: "Dents renforcées en acier forgé haute résistance à l'abrasion pour godet de pelle mécanique 20-22 tonnes.",
        image: "assets/images/part_bucket_teeth.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 4,
        name: "Flexible Hydraulique 4 Nappes 5000 PSI 1 pouce",
        ref: "FLEX-HYD-5000",
        category_id: 3,
        brand: "Multimarques",
        price: 45000,
        stock: 60,
        description: "Flexible hydraulique ultra-haute pression certifié pour circuits hydrauliques de pelles et chargeuses.",
        image: "assets/images/part_hydraulic_hose.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 5,
        name: "Kit Joints Vérin de Bras LiuGong CLG922E",
        ref: "JNT-LIU-922",
        category_id: 3,
        brand: "LiuGong",
        price: 75000,
        stock: 18,
        description: "Kit complet de joints d'étanchéité Parker haute température pour vérins de levage.",
        image: "assets/images/part_seal_kit.svg",
        featured: 0,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 6,
        name: "Plaquettes de Frein Essieu Chargeuse XCMG",
        ref: "FRN-XCMG-30",
        category_id: 4,
        brand: "XCMG",
        price: 38000,
        stock: 25,
        description: "Jeu de plaquettes de frein avant/arrière pour chargeuses série ZL50 et LW500.",
        image: "assets/images/part_brake_pads.svg",
        featured: 0,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 7,
        name: "Fourches Forgées Chariot Élévateur Heli 3T (Paire)",
        ref: "FRC-HELI-3T",
        category_id: 5,
        brand: "Heli / Hangcha",
        price: 240000,
        stock: 8,
        description: "Paire de fourches en acier allié certifiées ISO 2330 pour chariots élévateurs 2.5T à 3.5T.",
        image: "assets/images/part_forks.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 8,
        name: "Phare de Travail LED Chantier 48W 24V Étanche",
        ref: "ELEC-LED-48W",
        category_id: 6,
        brand: "Universel",
        price: 18000,
        stock: 85,
        description: "Projecteur LED étanche IP68 antichoc pour travaux de nuit sur pelles et bulldozers.",
        image: "assets/images/part_light_led.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 9,
        name: "Pompe Hydraulique Principale SDLG 956L (Sur Commande)",
        ref: "POMP-SDLG-956",
        category_id: 7,
        brand: "SDLG",
        price: 1250000,
        stock: 5,
        description: "Pompe hydraulique d'origine à engrenages haute performance pour chargeuse sur pneus.",
        image: "assets/images/part_hydraulic_pump.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      }
    ],
    categories: [
      { id: 1, name: "Filtration", slug: "filtration", description: "Filtres à huile, à air, carburant et hydrauliques pour engins", icon: "Filter" },
      { id: 2, name: "Pièces d'usure godet & chenille", slug: "usure-chenille", description: "Dents de godet, adaptateurs, patins de chenille, boulons", icon: "ShieldAlert" },
      { id: 3, name: "Hydraulique", slug: "hydraulique", description: "Flexibles haute pression, joints, raccords et joints spi", icon: "Activity" },
      { id: 4, name: "Freinage & Transmission", slug: "freinage-transmission", description: "Plaquettes, disques, courroies et embrayages", icon: "Disc" },
      { id: 5, name: "Chariots Élévateurs", slug: "chariots-elevateurs", description: "Fourches, chaînes de mât, galets, batteries et roues", icon: "Forklift" },
      { id: 6, name: "Électrique & Capteurs", slug: "electrique", description: "Capteurs, relais, faisceaux et phares LED de chantier", icon: "Zap" },
      { id: 7, name: "Moteurs & Composants Lourds", slug: "composants-lourds", description: "Moteurs complets, ponts, boîtes de transmission", icon: "Cpu" }
    ],
    machines: [
      {
        id: 1,
        name: "Pelle Hydraulique SDLG E6210F (21 Tonnes)",
        type: "Pelle Mécanique",
        brand: "SDLG",
        model: "E6211F",
        price_day: 220000,
        price_month: 4800000,
        specs: "Poids: 21.2 T | Godet: 1.0 m³ | Moteur: DDE Deutz 123 kW | Climatisation | Chenilles renforcées",
        status: "Disponible",
        image: "assets/images/machine_excavator.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 2,
        name: "Chargeuse sur Pneus XCMG ZL50GN (5 Tonnes)",
        type: "Chargeuse",
        brand: "XCMG",
        model: "ZL50GN",
        price_day: 180000,
        price_month: 3900000,
        specs: "Capacité godet: 3.0 m³ | Charge utile: 5000 kg | Moteur Weichai 162 kW | Confort cabine ROPS/FOPS",
        status: "Disponible",
        image: "assets/images/machine_loader.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 3,
        name: "Bulldozer Bouteur Shantui SD16 (17 Tonnes)",
        type: "Bulldozer",
        brand: "Shantui",
        model: "SD16",
        price_day: 260000,
        price_month: 5500000,
        specs: "Lame droite orientable 4.5 m³ | Ripper arrière 3 dents | Moteur Shangchai 120 kW",
        status: "En location",
        image: "assets/images/machine_bulldozer.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 4,
        name: "Camion Benne 6x4 Sinotruk HOWO 371HP (20 m³)",
        type: "Poids Lourd",
        brand: "Sinotruk",
        model: "HOWO 371",
        price_day: 150000,
        price_month: 3200000,
        specs: "Charge max: 30T | Benne renforcée roche 20m³ | Ponts doubles réducteurs | Idéal carrière & terrassement",
        status: "Disponible",
        image: "assets/images/machine_dump_truck.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 5,
        name: "Tracteur Routier 6x4 Shacman F3000 avec Porte-Engin",
        type: "Tracteur Poids Lourd",
        brand: "Shacman",
        model: "F3000",
        price_day: 290000,
        price_month: 6200000,
        specs: "Puissance 420 ch | Remorque surbaissée 60T 3 essieux | Transfert de pelles et bulldozers sur chantiers",
        status: "Disponible",
        image: "assets/images/machine_tractor_truck.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 6,
        name: "Chariot Élévateur Diesel Heli CPCD35 (3.5 Tonnes)",
        type: "Manutention",
        brand: "Heli",
        model: "CPCD35",
        price_day: 65000,
        price_month: 1400000,
        specs: "Capacité: 3500 kg | Hauteur mât triplex: 4.8m | Déplacement latéral des fourches | Pneus pleins souples",
        status: "En maintenance",
        image: "assets/images/machine_forklift.svg",
        featured: 1,
        created_at: "2026-11-23 00:23:03"
      }
    ],
    orders: [
      {
        id: 1,
        order_ref: "CMD-2026-001",
        customer_name: "Entreprise Ivoirienne de Terrassement (EIT)",
        customer_phone: "+225 07 45 88 12 34",
        customer_email: "contact@eit-ci.com",
        customer_city: "Abidjan - Yopougon Zone Industrielle",
        type: "Vente Pièces",
        items_json: JSON.stringify([
          { name: "Filtre à Huile Moteur SDLG / Weichai WD615", quantity: 4, price: 25000 },
          { name: "Dents de Godet Pelle 20T SDLG", quantity: 10, price: 18500 },
          { name: "Flexible Hydraulique 4 Nappes", quantity: 2, price: 45000 }
        ]),
        total_amount: 375000,
        status: "Confirmée",
        notes: "Livraison urgente sur chantier 4ème Pont Yopougon.",
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 2,
        order_ref: "CMD-2026-002",
        customer_name: "BTP Génie Civil Kouassi & Frères",
        customer_phone: "+225 05 12 33 44 55",
        customer_email: "kouassi.btp@gmail.com",
        customer_city: "San-Pedro",
        type: "Location Engin",
        items_json: JSON.stringify([
          { name: "Pelle Hydraulique SDLG E6210F (21 Tonnes)", duration: "15 jours", rate_day: 220000 }
        ]),
        total_amount: 3300000,
        status: "En cours de livraison / En location",
        notes: "Location avec chauffeur opérateur qualifié pour aménagement portuaire.",
        created_at: "2026-11-23 00:23:03"
      },
      {
        id: 4,
        order_ref: "CMD-2026-8D933",
        customer_name: "N'guessan",
        customer_phone: "0758951226",
        customer_email: "",
        customer_city: "Abidjan",
        type: "Vente Pièces",
        items_json: JSON.stringify([
          { id: 8, name: "Phare de Travail LED Chantier 48W 24V Étanche", ref: "ELEC-LED-48W", price: 18000, quantity: 1, total: 18000 }
        ]),
        total_amount: 18000,
        status: "En attente",
        notes: "je veux valider la commande de cette pièce",
        created_at: "2026-11-24 00:47:51"
      },
      {
        id: 5,
        order_ref: "CMD-2026-6E961",
        customer_name: "LNWEB",
        customer_phone: "0595356928",
        customer_email: "",
        customer_city: "Abidjan",
        type: "Location Engin",
        items_json: JSON.stringify([
          { machine_id: 1, name: "Pelle Hydraulique SDLG E6210F (21 Tonnes)", type: "Pelle Mécanique", brand: "SDLG", duration: "3 Jour(s)", rate: 220000, total: 660000 }
        ]),
        total_amount: 660000,
        status: "En attente",
        notes: "Location: Pelle Hydraulique SDLG E6210F (21 Tonnes). Chantier: Abidjan.",
        created_at: "2026-11-24 01:43:35"
      }
    ],
    settings: {
      hero_title: {
        key_name: "hero_title",
        value_text: "L'EXPERTISE BTP & PIÈCES D'ENGINS",
        image_url: "",
        description: "Titre principal Hero"
      },
      hero_subtitle: {
        key_name: "hero_subtitle",
        value_text: "Importation directe, distribution de pièces certifiées et location de matériel lourd en Côte d'Ivoire.",
        image_url: "",
        description: "Sous-titre Hero"
      },
      hero_badge: {
        key_name: "hero_badge",
        value_text: "LEADER PIÈCES CHINOISES & TOUTES MARQUES (SDLG, XCMG, LIUGONG, CAT)",
        image_url: "",
        description: "Badge d'accroche Hero"
      },
      hero_image: {
        key_name: "hero_image",
        value_text: "uploads/img_20261124_040547_59914e01.png",
        image_url: "uploads/img_20261124_040547_59914e01.png",
        description: "Grande image d'engin section Hero"
      },
      hero_video_thumb: {
        key_name: "hero_video_thumb",
        value_text: "uploads/img_20261124_040606_9ea999c2.png",
        image_url: "uploads/img_20261124_040606_9ea999c2.png",
        description: "Image miniature aperçu chantier dans le Hero"
      },
      logo_image: {
        key_name: "logo_image",
        value_text: "assets/images/logo.jpg",
        image_url: "assets/images/logo.jpg",
        description: "Logo officiel MAXI PLUS SARL"
      },
      service_parts_image: {
        key_name: "service_parts_image",
        value_text: "uploads/img_20261123_125940_f009a76d.png",
        image_url: "uploads/img_20261123_125940_f009a76d.png",
        description: "Image illustrant la vente de pièces détachées"
      },
      service_rental_image: {
        key_name: "service_rental_image",
        value_text: "assets/images/service_rental.svg",
        image_url: "assets/images/service_rental.svg",
        description: "Image illustrant la location d'engins lourds"
      },
      mobile_app_image: {
        key_name: "mobile_app_image",
        value_text: "assets/images/mobile_mockup.svg",
        image_url: "assets/images/mobile_mockup.svg",
        description: "Image mockup smartphone commande WhatsApp"
      },
      cta_banner_image: {
        key_name: "cta_banner_image",
        value_text: "assets/images/cta_banner.svg",
        image_url: "assets/images/cta_banner.svg",
        description: "Image de fond bannière devis d'urgence"
      }
    }
  };

  // Chargement / Sauvegarde LocalStorage
  function loadDatabase() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.products && parsed.machines && parsed.categories && parsed.settings) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Erreur lecture LocalStorage, initialisation avec les données par défaut", e);
    }
    saveDatabase(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  function saveDatabase(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Erreur sauvegarde LocalStorage", e);
    }
  }

  let db = loadDatabase();

  // Gestion de session Auth Administrateur
  function getStoredAuth() {
    try {
      const session = localStorage.getItem(AUTH_KEY);
      if (session) {
        return JSON.parse(session);
      }
    } catch (e) {}
    return { isAuth: false, user: null };
  }

  function setStoredAuth(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuth: true, user: user }));
  }

  function clearStoredAuth() {
    localStorage.removeItem(AUTH_KEY);
  }

  // API Publique MaxiDB
  window.MaxiDB = {
    getData: () => db,
    saveData: () => saveDatabase(db),
    resetToDefault: () => {
      db = JSON.parse(JSON.stringify(INITIAL_DATA));
      saveDatabase(db);
      return db;
    },
    getAuth: getStoredAuth,
    setAuth: setStoredAuth,
    clearAuth: clearStoredAuth,
    getInitialSiteData: () => {
      const s = db.settings;
      return {
        heroImage: s.hero_image?.image_url || "assets/images/hero_excavator.svg",
        heroThumb: s.hero_video_thumb?.image_url || "assets/images/hero_thumb.svg",
        logoImage: s.logo_image?.image_url || "assets/images/logo.jpg",
        servicePartsImage: s.service_parts_image?.image_url || "assets/images/service_parts.svg",
        serviceRentalImage: s.service_rental_image?.image_url || "assets/images/service_rental.svg",
        mobileAppImage: s.mobile_app_image?.image_url || "assets/images/mobile_mockup.svg",
        ctaBannerImage: s.cta_banner_image?.image_url || "assets/images/cta_banner.svg",
        companyName: "MAXI PLUS SARL",
        rccm: "CI-ABJ-03-2018-B13-21394",
        ncc: "1843673A",
        phone: "+225 07 09 36 50 23",
        whatsapp: "+225 07 09 36 50 23",
        email: "maxiplus.ci@gmail.com",
        location: "Angré Djorobité, Garage zone industrielle, Abidjan, Côte d'Ivoire",
        isAdmin: getStoredAuth().isAuth
      };
    }
  };

  // Convertir un fichier File en Data URL Base64
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Interception universelle de fetch() pour simuler les endpoints PHP
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async function (resource, options = {}) {
    const urlString = typeof resource === 'string' ? resource : (resource?.url || '');
    const method = (options.method || 'GET').toUpperCase();

    // Vérifier si la requête cible un script de l'API PHP
    if (urlString.includes('api/')) {
      return handleMockApi(urlString, method, options);
    }

    // Sinon passer à fetch standard
    return nativeFetch(resource, options);
  };

  async function handleMockApi(urlStr, method, options) {
    // Normaliser l'URL pour extraire le fichier et les paramètres
    const [pathPart, queryPart] = urlStr.split('?');
    const params = new URLSearchParams(queryPart || '');
    let body = null;

    if (options.body) {
      if (typeof options.body === 'string') {
        try {
          body = JSON.parse(options.body);
        } catch (e) {
          body = options.body;
        }
      } else {
        body = options.body; // FormData ou Object
      }
    }

    // Réponse utilitaire
    const jsonResponse = (data, status = 200) => {
      return new Response(JSON.stringify(data), {
        status: status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    };

    // 1. /api/products.php
    if (pathPart.endsWith('products.php')) {
      if (method === 'GET') {
        const id = params.get('id');
        const cat = params.get('category');
        const search = params.get('search');
        const brand = params.get('brand');

        if (id) {
          const item = db.products.find(p => p.id == id);
          if (!item) return jsonResponse({ error: 'Produit introuvable' }, 404);
          const catObj = db.categories.find(c => c.id == item.category_id);
          return jsonResponse({ ...item, category_name: catObj?.name || '' });
        }

        let list = [...db.products];
        if (cat && cat !== 'all') {
          list = list.filter(p => p.category_id == cat || db.categories.find(c => c.slug === cat)?.id == p.category_id);
        }
        if (brand && brand !== 'all') {
          list = list.filter(p => p.brand?.toLowerCase().includes(brand.toLowerCase()));
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(p => p.name?.toLowerCase().includes(s) || p.ref?.toLowerCase().includes(s) || p.brand?.toLowerCase().includes(s));
        }

        // Associer le nom de catégorie
        list = list.map(p => {
          const c = db.categories.find(cat => cat.id == p.category_id);
          return { ...p, category_name: c?.name || '' };
        });

        return jsonResponse({
          success: true,
          products: list,
          categories: db.categories
        });
      }

      if (method === 'POST') {
        const newId = (db.products.reduce((max, p) => Math.max(max, p.id || 0), 0) || 0) + 1;
        const newProduct = {
          id: newId,
          name: body.name || 'Nouvelle Pièce',
          ref: body.ref || `REF-${newId}`,
          category_id: parseInt(body.category_id) || 1,
          brand: body.brand || '',
          price: parseInt(body.price) || 0,
          stock: parseInt(body.stock) || 0,
          description: body.description || '',
          image: body.image || 'assets/images/part_filter_oil.svg',
          featured: body.featured ? 1 : 0,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        db.products.unshift(newProduct);
        saveDatabase(db);
        return jsonResponse({ success: true, message: 'Pièce ajoutée au catalogue !', id: newId });
      }

      if (method === 'PUT') {
        const idx = db.products.findIndex(p => p.id == body.id);
        if (idx >= 0) {
          db.products[idx] = {
            ...db.products[idx],
            name: body.name !== undefined ? body.name : db.products[idx].name,
            ref: body.ref !== undefined ? body.ref : db.products[idx].ref,
            category_id: body.category_id !== undefined ? parseInt(body.category_id) : db.products[idx].category_id,
            brand: body.brand !== undefined ? body.brand : db.products[idx].brand,
            price: body.price !== undefined ? parseInt(body.price) : db.products[idx].price,
            stock: body.stock !== undefined ? parseInt(body.stock) : db.products[idx].stock,
            description: body.description !== undefined ? body.description : db.products[idx].description,
            image: body.image !== undefined ? body.image : db.products[idx].image,
            featured: body.featured !== undefined ? (body.featured ? 1 : 0) : db.products[idx].featured
          };
          saveDatabase(db);
          return jsonResponse({ success: true, message: 'Pièce modifiée avec succès !' });
        }
        return jsonResponse({ error: 'Pièce non trouvée' }, 404);
      }

      if (method === 'DELETE') {
        const id = params.get('id');
        db.products = db.products.filter(p => p.id != id);
        saveDatabase(db);
        return jsonResponse({ success: true, message: 'Pièce supprimée avec succès !' });
      }
    }

    // 2. /api/machines.php
    if (pathPart.endsWith('machines.php')) {
      if (method === 'GET') {
        const id = params.get('id');
        const status = params.get('status');
        const type = params.get('type');

        if (id) {
          const item = db.machines.find(m => m.id == id);
          if (!item) return jsonResponse({ error: 'Engin introuvable' }, 404);
          return jsonResponse(item);
        }

        let list = [...db.machines];
        if (status && status !== 'all') {
          list = list.filter(m => m.status === status);
        }
        if (type && type !== 'all') {
          list = list.filter(m => m.type?.toLowerCase().includes(type.toLowerCase()));
        }

        return jsonResponse({
          success: true,
          machines: list
        });
      }

      if (method === 'POST') {
        const newId = (db.machines.reduce((max, m) => Math.max(max, m.id || 0), 0) || 0) + 1;
        const newMachine = {
          id: newId,
          name: body.name || 'Nouvel Engin',
          type: body.type || 'Pelle Mécanique',
          brand: body.brand || 'SDLG',
          model: body.model || '',
          price_day: parseInt(body.price_day) || 0,
          price_month: parseInt(body.price_month) || 0,
          specs: body.specs || '',
          status: body.status || 'Disponible',
          image: body.image || 'assets/images/machine_excavator.svg',
          featured: body.featured ? 1 : 0,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        db.machines.unshift(newMachine);
        saveDatabase(db);
        return jsonResponse({ success: true, message: 'Engin ajouté au parc avec succès !', id: newId });
      }

      if (method === 'PUT') {
        const idx = db.machines.findIndex(m => m.id == body.id);
        if (idx >= 0) {
          if (body.status_only) {
            db.machines[idx].status = body.status;
          } else {
            db.machines[idx] = {
              ...db.machines[idx],
              name: body.name !== undefined ? body.name : db.machines[idx].name,
              type: body.type !== undefined ? body.type : db.machines[idx].type,
              brand: body.brand !== undefined ? body.brand : db.machines[idx].brand,
              model: body.model !== undefined ? body.model : db.machines[idx].model,
              price_day: body.price_day !== undefined ? parseInt(body.price_day) : db.machines[idx].price_day,
              price_month: body.price_month !== undefined ? parseInt(body.price_month) : db.machines[idx].price_month,
              specs: body.specs !== undefined ? body.specs : db.machines[idx].specs,
              status: body.status !== undefined ? body.status : db.machines[idx].status,
              image: body.image !== undefined ? body.image : db.machines[idx].image,
              featured: body.featured !== undefined ? (body.featured ? 1 : 0) : db.machines[idx].featured
            };
          }
          saveDatabase(db);
          return jsonResponse({ success: true, message: 'Engin mis à jour avec succès !' });
        }
        return jsonResponse({ error: 'Engin non trouvé' }, 404);
      }

      if (method === 'DELETE') {
        const id = params.get('id');
        db.machines = db.machines.filter(m => m.id != id);
        saveDatabase(db);
        return jsonResponse({ success: true, message: 'Engin supprimé du parc !' });
      }
    }

    // 3. /api/orders.php
    if (pathPart.endsWith('orders.php')) {
      if (method === 'GET') {
        const id = params.get('id');
        const status = params.get('status');

        if (id) {
          const item = db.orders.find(o => o.id == id);
          if (!item) return jsonResponse({ error: 'Commande introuvable' }, 404);
          let items = [];
          try { items = typeof item.items_json === 'string' ? JSON.parse(item.items_json) : item.items_json; } catch (e) {}
          return jsonResponse({ ...item, items });
        }

        let list = [...db.orders];
        if (status && status !== 'all') {
          list = list.filter(o => o.status === status);
        }

        const formatted = list.map(o => {
          let items = [];
          try { items = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json; } catch (e) {}
          return { ...o, items };
        });

        // Calcul statistiques
        const totalRevenue = db.orders
          .filter(o => o.status !== 'Annulée')
          .reduce((sum, o) => sum + (parseInt(o.total_amount) || 0), 0);

        const stats = {
          total_revenue: totalRevenue,
          orders_count: db.orders.length,
          pending_count: db.orders.filter(o => o.status === 'En attente').length,
          products_count: db.products.length,
          machines_available: db.machines.filter(m => m.status === 'Disponible').length,
          machines_rented: db.machines.filter(m => m.status === 'En location').length
        };

        return jsonResponse({
          success: true,
          orders: formatted,
          stats: stats
        });
      }

      if (method === 'POST') {
        const newId = (db.orders.reduce((max, o) => Math.max(max, o.id || 0), 0) || 0) + 1;
        const randomRef = 'CMD-2026-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        const itemsArr = Array.isArray(body.items) ? body.items : [];
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const localCreated = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const newOrder = {
          id: newId,
          order_ref: randomRef,
          customer_name: body.customer_name || 'Client',
          customer_phone: body.customer_phone || '',
          customer_email: body.customer_email || '',
          customer_city: body.customer_city || 'Abidjan',
          type: body.type || 'Vente Pièces',
          items_json: JSON.stringify(itemsArr),
          total_amount: parseInt(body.total_amount) || 0,
          status: 'En attente',
          notes: body.notes || '',
          created_at: localCreated
        };
        db.orders.unshift(newOrder);
        saveDatabase(db);
        return jsonResponse({
          success: true,
          order_ref: randomRef,
          id: newId,
          message: 'Votre commande a été transmise à notre service commercial MAXI PLUS !'
        });
      }

      if (method === 'PUT') {
        const idx = db.orders.findIndex(o => o.id == body.id);
        if (idx >= 0) {
          db.orders[idx].status = body.status;
          saveDatabase(db);
          return jsonResponse({ success: true, message: `Statut mis à jour : ${body.status}` });
        }
        return jsonResponse({ error: 'Commande non trouvée' }, 404);
      }

      if (method === 'DELETE') {
        const id = params.get('id');
        db.orders = db.orders.filter(o => o.id != id);
        saveDatabase(db);
        return jsonResponse({ success: true, message: 'Commande supprimée avec succès !' });
      }
    }

    // 4. /api/site_settings.php
    if (pathPart.endsWith('site_settings.php')) {
      if (method === 'GET') {
        return jsonResponse({
          success: true,
          settings: db.settings
        });
      }

      if (method === 'POST') {
        const key = body.key_name;
        if (!key) return jsonResponse({ error: 'Clé requise' }, 400);

        db.settings[key] = {
          key_name: key,
          value_text: body.value_text || '',
          image_url: body.image_url || '',
          description: body.description || db.settings[key]?.description || '',
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        saveDatabase(db);
        return jsonResponse({
          success: true,
          message: 'Image / Contenu du site mis à jour avec succès !'
        });
      }
    }

    // 5. /api/auth.php
    if (pathPart.endsWith('auth.php')) {
      const action = params.get('action');

      if (method === 'GET' && action === 'check') {
        const session = getStoredAuth();
        return jsonResponse({
          authenticated: session.isAuth,
          user: session.user
        });
      }

      if (method === 'POST' && action === 'login') {
        const email = (body.email || '').trim().toLowerCase();
        const pwd = (body.password || '').trim();

        if (email === 'admin@maxiplus.ci' && pwd === 'admin123') {
          const user = {
            id: 1,
            name: 'Administrateur MAXI PLUS',
            email: 'admin@maxiplus.ci',
            role: 'admin'
          };
          setStoredAuth(user);
          return jsonResponse({
            success: true,
            user: user,
            message: 'Connexion réussie.'
          });
        }
        return jsonResponse({ success: false, error: 'Identifiants invalides (admin@maxiplus.ci / admin123)' }, 401);
      }

      if (method === 'POST' && action === 'logout') {
        clearStoredAuth();
        return jsonResponse({ success: true, message: 'Déconnexion réussie.' });
      }
    }

    // 6. /api/upload.php
    if (pathPart.endsWith('upload.php')) {
      if (method === 'POST') {
        try {
          let file = null;
          if (body instanceof FormData) {
            file = body.get('image');
          }
          if (file && file instanceof File) {
            const dataUrl = await fileToDataUrl(file);
            return jsonResponse({
              success: true,
              url: dataUrl,
              message: 'Photo enregistrée avec succès !'
            });
          }
          return jsonResponse({ error: 'Aucun fichier valide' }, 400);
        } catch (err) {
          return jsonResponse({ error: 'Erreur lors du traitement du fichier' }, 500);
        }
      }
    }

    return jsonResponse({ error: 'Endpoint non trouvé' }, 404);
  }
})();
