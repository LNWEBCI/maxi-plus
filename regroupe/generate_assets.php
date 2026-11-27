<?php
// generate_assets.php - Crée des images vectorielles SVG professionnelles haute définition pour MAXI PLUS SARL

$imgDir = __DIR__ . '/assets/images';
if (!file_exists($imgDir)) {
    mkdir($imgDir, 0777, true);
}

// 1. Hero Excavator (Pelle mécanique puissante)
$hero_excavator = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a2c16" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#031f0a" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="yellowMetal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFDD00"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="darkMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4B5563"/>
      <stop offset="100%" stop-color="#1F2937"/>
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#81B39D"/>
      <stop offset="100%" stop-color="#03300D"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Fond dynamique -->
  <rect width="800" height="600" fill="url(#skyGrad)" rx="24"/>
  <circle cx="580" cy="220" r="220" fill="#81B39D" opacity="0.12" filter="url(#glow)"/>
  <circle cx="200" cy="450" r="180" fill="#22c55e" opacity="0.08" filter="url(#glow)"/>

  <!-- Sol terrassement & chantier BTP -->
  <path d="M0,480 Q200,460 400,485 T800,470 L800,600 L0,600 Z" fill="#2b2319" opacity="0.95"/>
  <path d="M0,510 Q250,490 500,520 T800,500 L800,600 L0,600 Z" fill="#1c160e"/>

  <!-- Groupe Engin (Pelle Mécanique SDLG/Cat) -->
  <g filter="url(#shadow)" transform="translate(60, 40)">
    <!-- Chenilles / Train de roulement -->
    <rect x="220" y="380" width="340" height="70" rx="35" fill="url(#darkMetal)" stroke="#111827" stroke-width="4"/>
    <g fill="#9CA3AF">
      <circle cx="260" cy="415" r="24" fill="#374151" stroke="#111827" stroke-width="4"/>
      <circle cx="310" cy="415" r="18"/>
      <circle cx="360" cy="415" r="18"/>
      <circle cx="410" cy="415" r="18"/>
      <circle cx="460" cy="415" r="18"/>
      <circle cx="520" cy="415" r="24" fill="#374151" stroke="#111827" stroke-width="4"/>
    </g>
    <!-- Patins de chenille crantés -->
    <path d="M220,380 H560 M220,450 H560" stroke="#111" stroke-width="6" stroke-dasharray="12,6"/>

    <!-- Tourelle / Corps supérieur -->
    <path d="M260,330 L490,330 L480,380 L250,380 Z" fill="#1F2937"/>
    <path d="M340,240 L480,240 L490,330 L320,330 Z" fill="url(#yellowMetal)"/>
    
    <!-- Contrepoids arrière -->
    <path d="M470,240 Q540,250 530,340 L480,340 Z" fill="#D97706"/>
    <rect x="480" y="270" width="35" height="15" rx="3" fill="#1F2937"/>
    <text x="485" y="282" font-family="Arial, sans-serif" font-weight="900" font-size="10" fill="#FFDD00">SDLG</text>

    <!-- Cabine opérateur vitrée -->
    <path d="M270,240 L340,240 L340,330 L260,330 Z" fill="#111827"/>
    <path d="M275,248 L330,248 L330,310 L268,310 Z" fill="#67E8F9" opacity="0.75"/>
    <line x1="290" y1="248" x2="285" y2="310" stroke="#374151" stroke-width="3"/>
    <!-- Siège opérateur -->
    <rect x="295" y="275" width="20" height="25" rx="3" fill="#E5E7EB" opacity="0.6"/>

    <!-- Flèche principale (Boom) -->
    <path d="M340,280 L230,130 L200,140 L310,310 Z" fill="url(#yellowMetal)"/>
    <circle cx="330" cy="290" r="10" fill="#374151"/>
    
    <!-- Vérin de flèche hydraulique chrome -->
    <line x1="350" y1="310" x2="260" y2="190" stroke="#9CA3AF" stroke-width="8"/>
    <line x1="335" y1="310" x2="280" y2="230" stroke="#1F2937" stroke-width="12"/>

    <!-- Balancier (Arm) -->
    <path d="M215,135 L90,260 L70,245 L200,125 Z" fill="url(#yellowMetal)"/>
    <circle cx="210" cy="135" r="8" fill="#111827"/>
    <circle cx="80" cy="255" r="7" fill="#111827"/>

    <!-- Vérin de godet -->
    <line x1="160" y1="170" x2="80" y2="235" stroke="#E5E7EB" stroke-width="6"/>

    <!-- Godet d'excavation avec dents d'usure -->
    <path d="M80,255 C60,265 40,295 55,340 C75,370 120,360 125,320 L100,280 Z" fill="#374151"/>
    <!-- Dents du godet en acier forgé -->
    <polygon points="50,345 35,365 45,368 58,350" fill="#F59E0B"/>
    <polygon points="65,355 52,375 62,378 73,360" fill="#F59E0B"/>
    <polygon points="80,362 70,385 80,387 90,365" fill="#F59E0B"/>
    <polygon points="98,362 92,385 102,386 108,365" fill="#F59E0B"/>

    <!-- Inscription Maxi Plus sur la flèche -->
    <text x="240" y="200" transform="rotate(-52 240 200)" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#03300D" letter-spacing="1">MAXI PLUS</text>
  </g>

  <!-- Badges flottants stylés (comme sur la maquette de référence) -->
  <g transform="translate(480, 70)" filter="url(#shadow)">
    <rect width="260" height="70" rx="16" fill="#ffffff" fill-opacity="0.95"/>
    <circle cx="40" cy="35" r="22" fill="#81B39D"/>
    <path d="M30,35 L37,42 L50,28" stroke="#03300D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <text x="75" y="30" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#03300D">+500 PIÈCES EN STOCK</text>
    <text x="75" y="48" font-family="Arial, sans-serif" font-size="12" fill="#4B5563">Disponibles immédiatement à Abidjan</text>
  </g>

  <g transform="translate(60, 480)" filter="url(#shadow)">
    <rect width="250" height="65" rx="16" fill="#03300D" stroke="#81B39D" stroke-width="2"/>
    <circle cx="35" cy="32" r="18" fill="#81B39D"/>
    <!-- Icône tracteur / engin -->
    <path d="M25,35 H45 M30,28 H40 M28,38 A4,4 0 1,1 28,30 M42,38 A4,4 0 1,1 42,30" stroke="#03300D" stroke-width="2" fill="none"/>
    <text x="65" y="27" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff">PARC D'ENGINS EN LOCATION</text>
    <text x="65" y="45" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#81B39D">Tarifs en Francs CFA / Jour & Mois</text>
  </g>
</svg>
SVG;

file_put_contents("$imgDir/hero_excavator.svg", $hero_excavator);

// 2. Hero Video/Site Thumbnail Badge (comme le lecteur vidéo dans la maquette)
$hero_thumb = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" height="100%">
  <defs>
    <linearGradient id="thumbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f3b1e"/>
      <stop offset="100%" stop-color="#03300D"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" rx="20" fill="url(#thumbBg)"/>
  <!-- Image de chantier stylisée -->
  <path d="M0,180 Q100,160 200,175 T400,165 L400,250 L0,250 Z" fill="#2d2217" opacity="0.8"/>
  <rect x="50" y="90" width="100" height="60" rx="10" fill="#F59E0B" opacity="0.85"/>
  <rect x="220" y="70" width="120" height="80" rx="12" fill="#81B39D" opacity="0.3"/>
  <!-- Bouton Play central brillant -->
  <circle cx="200" cy="115" r="32" fill="#81B39D"/>
  <circle cx="200" cy="115" r="40" fill="#81B39D" opacity="0.3"/>
  <polygon points="192,100 216,115 192,130" fill="#03300D"/>
  <text x="200" y="195" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#ffffff" text-anchor="middle">NOS ENGINS SUR LE TERRAIN</text>
  <text x="200" y="215" font-family="Arial, sans-serif" font-size="11" fill="#81B39D" text-anchor="middle">Chantiers Abidjan & Grand Bassam</text>
</svg>
SVG;
file_put_contents("$imgDir/hero_thumb.svg", $hero_thumb);

// 3. Service Parts (Vente de pièces détachées)
$service_parts = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
  <defs>
    <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#03300D"/>
      <stop offset="100%" stop-color="#0a4d1a"/>
    </linearGradient>
  </defs>
  <rect width="500" height="400" rx="24" fill="url(#pGrad)"/>
  <!-- Rouages / Engrenages métalliques -->
  <g transform="translate(140, 160)" fill="#81B39D" opacity="0.3">
    <circle cx="0" cy="0" r="90"/>
    <circle cx="0" cy="0" r="50" fill="#03300D"/>
  </g>
  <!-- Filtre mécanique en coupe -->
  <g transform="translate(230, 90)">
    <rect x="0" y="0" width="120" height="190" rx="20" fill="#E5E7EB" stroke="#374151" stroke-width="4"/>
    <rect x="15" y="25" width="90" height="140" rx="10" fill="#F59E0B"/>
    <line x1="30" y1="35" x2="30" y2="155" stroke="#D97706" stroke-width="4" stroke-dasharray="6,4"/>
    <line x1="50" y1="35" x2="50" y2="155" stroke="#D97706" stroke-width="4" stroke-dasharray="6,4"/>
    <line x1="70" y1="35" x2="70" y2="155" stroke="#D97706" stroke-width="4" stroke-dasharray="6,4"/>
    <line x1="90" y1="35" x2="90" y2="155" stroke="#D97706" stroke-width="4" stroke-dasharray="6,4"/>
    <text x="60" y="100" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#03300D" text-anchor="middle">MAXI</text>
    <text x="60" y="118" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#03300D" text-anchor="middle">PLUS</text>
  </g>
  <!-- Flexibles & Raccords -->
  <path d="M80,290 C120,200 200,320 380,280" stroke="#111827" stroke-width="20" stroke-linecap="round" fill="none"/>
  <path d="M80,290 C120,200 200,320 380,280" stroke="#4B5563" stroke-width="12" stroke-linecap="round" fill="none"/>
  <!-- Dents de godet avant-plan -->
  <polygon points="80,310 160,250 180,280 90,340" fill="#F59E0B" stroke="#B45309" stroke-width="3"/>
  <text x="250" y="340" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">PIÈCES D'ORIGINE & ADAPTABLES</text>
  <text x="250" y="365" font-family="Arial, sans-serif" font-size="13" fill="#81B39D" text-anchor="middle">SDLG • XCMG • LIUGONG • CAT • SANY</text>
</svg>
SVG;
file_put_contents("$imgDir/service_parts.svg", $service_parts);

// 4. Service Rental (Location d'engins)
$service_rental = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
  <defs>
    <linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#144622"/>
      <stop offset="100%" stop-color="#03300D"/>
    </linearGradient>
  </defs>
  <rect width="500" height="400" rx="24" fill="url(#rGrad)"/>
  <!-- Silhouette Camion Benne & Tracteur -->
  <g transform="translate(60, 110)">
    <!-- Cabine Poids Lourd -->
    <rect x="50" y="70" width="80" height="110" rx="10" fill="#FFDD00"/>
    <rect x="60" y="80" width="60" height="45" rx="5" fill="#67E8F9"/>
    <!-- Benne arrière -->
    <path d="M140,90 L340,90 L320,180 L140,180 Z" fill="#D97706"/>
    <!-- Roues énormes -->
    <circle cx="90" cy="185" r="32" fill="#1F2937" stroke="#111" stroke-width="6"/>
    <circle cx="200" cy="185" r="32" fill="#1F2937" stroke="#111" stroke-width="6"/>
    <circle cx="270" cy="185" r="32" fill="#1F2937" stroke="#111" stroke-width="6"/>
    <circle cx="90" cy="185" r="14" fill="#9CA3AF"/>
    <circle cx="200" cy="185" r="14" fill="#9CA3AF"/>
    <circle cx="270" cy="185" r="14" fill="#9CA3AF"/>
  </g>
  <text x="250" y="335" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">PARC LOCATION HAUTE CAPACITÉ</text>
  <text x="250" y="360" font-family="Arial, sans-serif" font-size="13" fill="#81B39D" text-anchor="middle">Pelles • Bennes • Bulldozers • Chariots</text>
</svg>
SVG;
file_put_contents("$imgDir/service_rental.svg", $service_rental);

// 5. Mobile Mockup (Commande WhatsApp & Smartphone)
$mobile_mockup = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 650" width="100%" height="100%">
  <defs>
    <filter id="mDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <!-- Châssis smartphone moderne -->
  <g filter="url(#mDrop)" transform="translate(60, 25)">
    <rect width="330" height="600" rx="42" fill="#1E293B" stroke="#475569" stroke-width="6"/>
    <!-- Écran intérieur -->
    <rect x="12" y="12" width="306" height="576" rx="34" fill="#F8FAFC"/>
    <!-- Caméra frontale / Dynamic Island -->
    <rect x="110" y="22" width="110" height="24" rx="12" fill="#0F172A"/>
    
    <!-- Header WhatsApp MAXI PLUS -->
    <rect x="12" y="55" width="306" height="65" fill="#03300D"/>
    <circle cx="45" cy="88" r="20" fill="#81B39D"/>
    <text x="45" y="93" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#03300D" text-anchor="middle">MP</text>
    <text x="75" y="82" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#ffffff">MAXI PLUS SARL</text>
    <text x="75" y="98" font-family="Arial, sans-serif" font-size="10" fill="#81B39D">En ligne • Réponse en 5 min</text>

    <!-- Zone de messages -->
    <!-- Message 1 Client -->
    <g transform="translate(90, 140)">
      <rect width="210" height="60" rx="14" fill="#DCFCE7"/>
      <text x="12" y="24" font-family="Arial, sans-serif" font-size="11" fill="#166534">Bonjour, avez-vous en stock</text>
      <text x="12" y="40" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#166534">le filtre SDLG 956L à Abidjan ?</text>
      <text x="175" y="52" font-family="Arial, sans-serif" font-size="9" fill="#15803D">08:14</text>
    </g>

    <!-- Message 2 MAXI PLUS -->
    <g transform="translate(25, 215)">
      <rect width="220" height="95" rx="14" fill="#ffffff" stroke="#E2E8F0"/>
      <text x="12" y="24" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#03300D">MAXI PLUS Service Commercial :</text>
      <text x="12" y="42" font-family="Arial, sans-serif" font-size="11" fill="#334155">Oui disponible immédiatement !</text>
      <text x="12" y="60" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#059669">Prix : 25 000 FCFA TTC</text>
      <text x="12" y="78" font-family="Arial, sans-serif" font-size="10" fill="#64748B">Livraison possible en 2h sur site.</text>
      <text x="185" y="87" font-family="Arial, sans-serif" font-size="9" fill="#94A3B8">08:15</text>
    </g>

    <!-- Carte produit interactive dans l'app -->
    <g transform="translate(25, 330)">
      <rect width="280" height="160" rx="16" fill="#F1F5F9" stroke="#CBD5E1"/>
      <rect x="15" y="15" width="80" height="75" rx="10" fill="#81B39D" opacity="0.3"/>
      <text x="105" y="35" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#03300D">Pelle SDLG E6210F</text>
      <text x="105" y="55" font-family="Arial, sans-serif" font-size="11" fill="#64748B">Location : 220 000 FCFA/j</text>
      <rect x="105" y="68" width="85" height="20" rx="10" fill="#22C55E"/>
      <text x="147" y="82" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#ffffff" text-anchor="middle">DISPONIBLE</text>

      <!-- Bouton Commander -->
      <rect x="15" y="105" width="250" height="38" rx="10" fill="#03300D"/>
      <text x="140" y="128" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#ffffff" text-anchor="middle">COMMANDER EN 1 CLIC</text>
    </g>

    <!-- Barre de saisie inférieure -->
    <rect x="12" y="525" width="306" height="50" fill="#ffffff" stroke="#E2E8F0"/>
    <rect x="25" y="535" width="230" height="30" rx="15" fill="#F1F5F9"/>
    <text x="40" y="554" font-family="Arial, sans-serif" font-size="11" fill="#94A3B8">Écrivez votre message...</text>
    <circle cx="285" cy="550" r="16" fill="#22C55E"/>
    <polygon points="280,544 293,550 280,556" fill="#ffffff"/>
  </g>
</svg>
SVG;
file_put_contents("$imgDir/mobile_mockup.svg", $mobile_mockup);

// 6. CTA Banner
$cta_banner = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ctaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#03300D"/>
      <stop offset="50%" stop-color="#093f15"/>
      <stop offset="100%" stop-color="#021c08"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="400" rx="36" fill="url(#ctaGrad)"/>
  <circle cx="1050" cy="200" r="280" fill="#81B39D" opacity="0.12"/>
  <circle cx="150" cy="350" r="180" fill="#22C55E" opacity="0.08"/>
</svg>
SVG;
file_put_contents("$imgDir/cta_banner.svg", $cta_banner);

// 7. Images individuelles des pièces
$parts = [
    'part_filter_oil.svg' => ['Filtre Huile', '#2563EB', '#1E40AF', 'OIL FILTER HD'],
    'part_filter_fuel.svg' => ['Filtre Gasoil', '#059669', '#047857', 'FUEL SEPARATOR'],
    'part_bucket_teeth.svg' => ['Dents Godet', '#F59E0B', '#D97706', 'FORGED STEEL 20T'],
    'part_hydraulic_hose.svg' => ['Flexible 5000 PSI', '#4B5563', '#1F2937', 'HIGH PRESSURE 4-WIRE'],
    'part_seal_kit.svg' => ['Kit Joints', '#DC2626', '#991B1B', 'PARKER SEAL KIT'],
    'part_brake_pads.svg' => ['Plaquettes Frein', '#7C3AED', '#5B21B6', 'CERAMIC HEAVY DUTY'],
    'part_forks.svg' => ['Fourches 3T', '#D97706', '#92400E', 'ISO 2330 FORKS'],
    'part_light_led.svg' => ['Phare LED 48W', '#0284C7', '#0369A1', 'IP68 24V FLOOD'],
    'part_hydraulic_pump.svg' => ['Pompe SDLG', '#0F766E', '#115E59', 'HYDRAULIC GEAR PUMP']
];

foreach ($parts as $file => $data) {
    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 240" width="100%" height="100%">
  <defs>
    <linearGradient id="pG_{$file}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$data[1]}"/>
      <stop offset="100%" stop-color="{$data[2]}"/>
    </linearGradient>
  </defs>
  <rect width="300" height="240" rx="16" fill="#F8FAFC"/>
  <rect x="20" y="20" width="260" height="160" rx="12" fill="url(#pG_{$file})" opacity="0.9"/>
  <!-- Symbole mécanique -->
  <circle cx="150" cy="100" r="45" fill="#ffffff" opacity="0.2"/>
  <circle cx="150" cy="100" r="30" fill="#ffffff" opacity="0.3"/>
  <text x="150" y="105" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">{$data[3]}</text>
  <text x="150" y="210" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#03300D" text-anchor="middle">{$data[0]}</text>
</svg>
SVG;
    file_put_contents("$imgDir/$file", $svg);
}

// 8. Images individuelles des Engins en location
$machines = [
    'machine_excavator.svg' => ['Pelle Hydraulique SDLG 21T', 'SDLG E6210F', '#F59E0B'],
    'machine_loader.svg' => ['Chargeuse sur Pneus XCMG 5T', 'XCMG ZL50GN', '#EAB308'],
    'machine_bulldozer.svg' => ['Bulldozer Bouteur Shantui 17T', 'Shantui SD16', '#D97706'],
    'machine_dump_truck.svg' => ['Camion Benne 6x4 Sinotruk', 'HOWO 371HP', '#EF4444'],
    'machine_tractor_truck.svg' => ['Tracteur Porte-Engin Shacman', 'Shacman F3000', '#3B82F6'],
    'machine_forklift.svg' => ['Chariot Élévateur Heli 3.5T', 'Heli CPCD35', '#10B981']
];

foreach ($machines as $file => $data) {
    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="mG_{$file}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f3b1e"/>
      <stop offset="100%" stop-color="#03300D"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" rx="18" fill="url(#mG_{$file})"/>
  <!-- Silhouette industrielle -->
  <rect x="50" y="90" width="210" height="90" rx="12" fill="{$data[2]}"/>
  <rect x="70" y="70" width="80" height="50" rx="8" fill="#111827"/>
  <rect x="75" y="75" width="70" height="40" rx="4" fill="#67E8F9" opacity="0.8"/>
  <circle cx="100" cy="190" r="30" fill="#1F2937" stroke="#111" stroke-width="4"/>
  <circle cx="210" cy="190" r="30" fill="#1F2937" stroke="#111" stroke-width="4"/>
  <text x="200" y="245" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">{$data[0]}</text>
  <text x="200" y="270" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#81B39D" text-anchor="middle">MODÈLE : {$data[1]}</text>
</svg>
SVG;
    file_put_contents("$imgDir/$file", $svg);
}

echo "Toutes les images ont été générées avec succès !\n";
