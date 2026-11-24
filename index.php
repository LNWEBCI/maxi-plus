<?php
// index.php - Landing Page & Plateforme Commerciale MAXI PLUS SARL
require_once __DIR__ . '/api/db.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Récupérer les images et paramètres du site
$stmt = $pdo->query("SELECT * FROM site_settings");
$siteSettings = [];
while ($row = $stmt->fetch()) {
    $siteSettings[$row['key_name']] = $row;
}

$heroImage = $siteSettings['hero_image']['image_url'] ?? 'assets/images/hero_excavator.svg';
$heroThumb = $siteSettings['hero_video_thumb']['image_url'] ?? 'assets/images/hero_thumb.svg';
$logoImage = $siteSettings['logo_image']['image_url'] ?? 'assets/images/logo.jpg';
$servicePartsImage = $siteSettings['service_parts_image']['image_url'] ?? 'assets/images/service_parts.svg';
$serviceRentalImage = $siteSettings['service_rental_image']['image_url'] ?? 'assets/images/service_rental.svg';
$mobileAppImage = $siteSettings['mobile_app_image']['image_url'] ?? 'assets/images/mobile_mockup.svg';
$ctaBannerImage = $siteSettings['cta_banner_image']['image_url'] ?? 'assets/images/cta_banner.svg';
?>
<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MAXI PLUS SARL | Vente de Pièces d'Engins & Location de Matériel BTP - Abidjan, Côte d'Ivoire</title>
  <meta name="description" content="Importation et distribution de pièces détachées pour engins de chantier (SDLG, XCMG, LiuGong, Cat) et location de pelles, camions et tracteurs en Côte d'Ivoire. Tarifs en FCFA.">
  <link rel="icon" type="image/jpeg" href="<?php echo htmlspecialchars($logoImage); ?>">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              DEFAULT: '#03300D',
              dark: '#021f08',
              light: '#81B39D',
              mint: '#a3d1be',
              sage: '#6b9c86',
              accent: '#22c55e',
              yellow: '#f59e0b',
              gold: '#fbbf24'
            }
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            display: ['"Cabinet Grotesk"', '"Plus Jakarta Sans"', 'sans-serif']
          }
        }
      }
    }
  </script>

  <!-- Google Fonts & Lucide Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- React 18 & Babel Standalone -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Styles personnalisés -->
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-slate-50 text-slate-800 antialiased selection:bg-[#81B39D] selection:text-[#03300D]">

  <!-- Conteneur racine de l'application React -->
  <div id="root">
    <!-- Affichage immédiat pendant le chargement de React -->
    <div class="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div class="text-center p-8">
        <div class="inline-block w-14 h-14 border-4 border-[#81B39D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 class="text-2xl font-bold tracking-tight text-white">MAXI PLUS SARL</h2>
        <p class="text-slate-400 text-sm mt-2">Chargement de la plateforme BTP & Pièces détachées...</p>
      </div>
    </div>
  </div>

  <!-- Données initiales injectées depuis PHP -->
  <script>
    window.INITIAL_SITE_DATA = {
      heroImage: "<?php echo addslashes($heroImage); ?>",
      heroThumb: "<?php echo addslashes($heroThumb); ?>",
      logoImage: "<?php echo addslashes($logoImage); ?>",
      servicePartsImage: "<?php echo addslashes($servicePartsImage); ?>",
      serviceRentalImage: "<?php echo addslashes($serviceRentalImage); ?>",
      mobileAppImage: "<?php echo addslashes($mobileAppImage); ?>",
      ctaBannerImage: "<?php echo addslashes($ctaBannerImage); ?>",
      companyName: "MAXI PLUS SARL",
      rccm: "CI-ABJ-03-2018-B13-21394",
      ncc: "1843673A",
      phone: "+225 07 09 36 50 23",
      whatsapp: "+225 07 09 36 50 23",
      email: "maxiplus.ci@gmail.com",
      location: "Angré Djorobité, Garage zone industrielle, Abidjan, Côte d'Ivoire",
      isAdmin: <?php echo isset($_SESSION['admin_user']) ? 'true' : 'false'; ?>
    };
  </script>

  <!-- Code React Frontend -->
  <script type="text/babel" src="assets/js/app.js"></script>
</body>
</html>
