// assets/js/app.js - Application React Frontend Ultra-Animée & Moderne pour MAXI PLUS SARL
const { useState, useEffect, useMemo, useRef } = React;

const formatFCFA = (amount) => {
  if (amount === undefined || amount === null) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

function App() {
  const [siteData, setSiteData] = useState(window.INITIAL_SITE_DATA || {});
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'services', 'rental', 'products', 'contact'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Écouter le hash de l'URL pour changer de page dynamiquement
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (['services', 'engins-location', 'location', 'catalogue-pieces', 'pieces', 'contact'].includes(hash)) {
        if (hash === 'services') setCurrentPage('services');
        else if (hash === 'engins-location' || hash === 'location') setCurrentPage('rental');
        else if (hash === 'catalogue-pieces' || hash === 'pieces') setCurrentPage('products');
        else if (hash === 'contact') setCurrentPage('contact');
      } else if (!hash || hash === 'accueil' || hash === 'home') {
        setCurrentPage('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page === 'home') window.location.hash = '';
    else if (page === 'services') window.location.hash = 'services';
    else if (page === 'rental') window.location.hash = 'location';
    else if (page === 'products') window.location.hash = 'pieces';
    else if (page === 'contact') window.location.hash = 'contact';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtres et recherche
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMachineType, setSelectedMachineType] = useState('all');

  // Gestion du panier (Cart)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [cartBump, setCartBump] = useState(false);

  // Modals interactifs
  const [bookingMachine, setBookingMachine] = useState(null);
  const [rentalDuration, setRentalDuration] = useState(1);
  const [rentalDurationUnit, setRentalDurationUnit] = useState('days'); // 'days' ou 'months'
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Formulaire de commande client
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('Abidjan');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Menu mobile et état du scroll
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Détection du scroll pour fixer et animer la navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Charger les données depuis l'API PHP
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const pRes = await fetch('api/products.php');
      const pData = await pRes.json();
      if (pData.success) {
        setProducts(pData.products || []);
        setCategories(pData.categories || []);
      }

      const mRes = await fetch('api/machines.php');
      const mData = await mRes.json();
      if (mData.success) {
        setMachines(mData.machines || []);
      }

      const sRes = await fetch('api/site_settings.php');
      const sData = await sRes.json();
      if (sData.success && sData.settings) {
        setSiteData(prev => ({
          ...prev,
          heroImage: sData.settings.hero_image?.image_url || prev.heroImage,
          heroThumb: sData.settings.hero_video_thumb?.image_url || prev.heroThumb,
          logoImage: sData.settings.logo_image?.image_url || prev.logoImage,
          servicePartsImage: sData.settings.service_parts_image?.image_url || prev.servicePartsImage,
          serviceRentalImage: sData.settings.service_rental_image?.image_url || prev.serviceRentalImage,
          mobileAppImage: sData.settings.mobile_app_image?.image_url || prev.mobileAppImage,
          ctaBannerImage: sData.settings.cta_banner_image?.image_url || prev.ctaBannerImage
        }));
      }
    } catch (err) {
      console.error('Erreur données API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des pièces
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category_id == selectedCategory || p.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = !query || 
        p.name.toLowerCase().includes(query) || 
        p.ref.toLowerCase().includes(query) || 
        p.brand?.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Filtrage des engins
  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      if (selectedMachineType === 'all') return true;
      return m.type.toLowerCase().includes(selectedMachineType.toLowerCase());
    });
  }, [machines, selectedMachineType]);

  // Ajout au panier avec animation Bump
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartBump(true);
    setTimeout(() => setCartBump(false), 500);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  // Passer commande
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const res = await fetch('api/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          customer_city: customerCity,
          type: 'Vente Pièces',
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            ref: item.ref,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
          })),
          total_amount: cartTotal,
          notes: orderNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess({
          ref: data.order_ref,
          total: cartTotal,
          phone: customerPhone
        });
        setCart([]);
      } else {
        alert(data.error || 'Erreur lors de la commande');
      }
    } catch (err) {
      alert('Erreur réseau lors de la commande.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Réserver un engin
  const handleMachineBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Veuillez renseigner votre nom et numéro de téléphone.');
      return;
    }

    const durationNum = parseInt(rentalDuration) || 1;
    const rate = rentalDurationUnit === 'days' ? bookingMachine.price_day : bookingMachine.price_month;
    const totalEst = rate * durationNum;

    try {
      setIsSubmittingOrder(true);
      const res = await fetch('api/orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          customer_city: customerCity,
          type: 'Location Engin',
          items: [{
            machine_id: bookingMachine.id,
            name: bookingMachine.name,
            type: bookingMachine.type,
            brand: bookingMachine.brand,
            duration: `${durationNum} ${rentalDurationUnit === 'days' ? 'Jour(s)' : 'Mois'}`,
            rate: rate,
            total: totalEst
          }],
          total_amount: totalEst,
          notes: `Location: ${bookingMachine.name}. Chantier: ${customerCity}. ${orderNotes}`
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingMachine(null);
        setOrderSuccess({
          ref: data.order_ref,
          total: totalEst,
          phone: customerPhone,
          isRental: true,
          machineName: bookingMachine.name
        });
      } else {
        alert(data.error || 'Erreur lors de la réservation');
      }
    } catch (err) {
      alert('Erreur réseau.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      
      {/* 1. TOP BAR & NAVIGATION FIXÉE (FOND VERT TRÈS PUR & PROFOND QUI TIRE SUR LE NOIR) */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'navbar-scrolled' 
          : 'navbar-fixed-dark'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
            
            {/* Logo officiel MAXI PLUS - Sublime intégration sur fond sombre */}
            <a href="#" className="flex items-center gap-3.5 group">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 p-1 border border-white/20 shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-[#81B39D] group-hover:shadow-[0_0_20px_rgba(129,179,157,0.4)]">
                <img 
                  src={siteData.logoImage} 
                  alt="MAXI PLUS SARL" 
                  className="w-full h-full object-contain filter drop-shadow-sm"
                  onError={(e) => { e.target.src = 'assets/images/logo.jpg'; }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-white font-display">MAXI PLUS</span>
                  <span className="text-[10px] bg-[#81B39D] text-[#011406] font-black px-2 py-0.5 rounded-full shadow-sm">SARL</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-[#81B39D] uppercase tracking-widest">
                  BTP & Maintenance d'engins
                </span>
              </div>
            </a>

            {/* Menu de navigation bureau : Uniquement les 5 éléments avec support multi-pages interactif */}
            <nav className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => navigateTo('services')} 
                className={`text-xs font-black transition-colors uppercase tracking-wider relative group py-2 ${
                  currentPage === 'services' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Nos services</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#81B39D] transition-all duration-300 ${
                  currentPage === 'services' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>

              <button 
                onClick={() => navigateTo('rental')} 
                className={`text-xs font-black transition-colors uppercase tracking-wider relative group py-2 ${
                  currentPage === 'rental' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Location d'engins</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#81B39D] transition-all duration-300 ${
                  currentPage === 'rental' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>

              <button 
                onClick={() => navigateTo('products')} 
                className={`text-xs font-black transition-colors uppercase tracking-wider relative group py-2 flex items-center gap-1.5 ${
                  currentPage === 'products' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Nos pièces</span>
                <span className="bg-[#81B39D]/30 text-[#81B39D] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#81B39D]/40">En stock</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#81B39D] transition-all duration-300 ${
                  currentPage === 'products' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>

              <button 
                onClick={() => navigateTo('contact')} 
                className={`text-xs font-black transition-colors uppercase tracking-wider relative group py-2 ${
                  currentPage === 'contact' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Contact</span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#81B39D] transition-all duration-300 ${
                  currentPage === 'contact' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>

              <a 
                href={`https://wa.me/2250745881234?text=${encodeURIComponent('Bonjour MAXI PLUS SARL, je souhaite demander des informations / devis.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black text-[#011406] hover:bg-[#9cd4bc] transition-all uppercase tracking-wider flex items-center gap-1.5 bg-[#81B39D] px-4 py-2 rounded-full shadow-md"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                <span>WhatsApp</span>
              </a>
            </nav>

            {/* Actions à droite */}
            <div className="flex items-center gap-3">
              
              {/* Bouton Panier interactif animé */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className={`relative p-3 rounded-2xl bg-white/10 hover:bg-[#81B39D]/20 text-white transition-all duration-300 border border-white/15 ${cartBump ? 'scale-125 bg-[#81B39D]/40' : ''}`}
                title="Consulter votre commande"
              >
                <svg className="w-5 h-5 text-[#81B39D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f59e0b] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Bouton Accès Dashboard Admin mis en valeur */}
              <a 
                href="admin/index.php"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#81B39D] hover:text-white text-xs font-black transition-all border border-[#81B39D]/30"
                title="Accéder au tableau de bord"
              >
                <svg className="w-3.5 h-3.5 text-[#81B39D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Dashboard</span>
              </a>

              {/* Hamburger Mobile */}
              <button 
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-white/10 text-white border border-white/15"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>

            </div>

          </div>
        </div>

        {/* Ligne lumineuse en bas de la navbar */}
        <div className="navbar-glow-line"></div>

        {/* Menu déroulant Mobile : Fond vert très sombre pur */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-[#011406]/98 backdrop-blur-md border-b border-[#81B39D]/30 px-6 py-5 space-y-3.5 animate-fade-up">
            <button onClick={() => { navigateTo('services'); setMobileNavOpen(false); }} className="block w-full text-left py-2 text-xs font-black text-slate-200 hover:text-white uppercase tracking-wider">Nos services</button>
            <button onClick={() => { navigateTo('rental'); setMobileNavOpen(false); }} className="block w-full text-left py-2 text-xs font-black text-slate-200 hover:text-white uppercase tracking-wider">Location d'engins</button>
            <button onClick={() => { navigateTo('products'); setMobileNavOpen(false); }} className="block w-full text-left py-2 text-xs font-black text-slate-200 hover:text-white uppercase tracking-wider">Nos pièces</button>
            <button onClick={() => { navigateTo('contact'); setMobileNavOpen(false); }} className="block w-full text-left py-2 text-xs font-black text-slate-200 hover:text-white uppercase tracking-wider">Contact</button>
            <a 
              href={`https://wa.me/2250745881234?text=${encodeURIComponent('Bonjour MAXI PLUS SARL, je souhaite demander des informations / devis.')}`}
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setMobileNavOpen(false)} 
              className="block py-3 px-4 rounded-xl btn-primary-mint text-xs font-black text-center shadow-md"
            >
              WhatsApp (+225 07 45 88 12 34)
            </a>
            <a href="admin/index.php" className="block py-2.5 px-4 rounded-xl bg-white/10 text-[#81B39D] font-black text-xs text-center border border-[#81B39D]/30">
              Tableau de Bord Administrateur
            </a>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION IMMERSIVE - FOND VERT SOMBRE PUR AVEC LE TRACTEUR EN TRANSPARENCE */}
      <section id="accueil" className="relative pt-24 sm:pt-28 pb-16 lg:pb-24 hero-fullscreen-dark">
        
        {/* IMAGE DU TRACTEUR EN FOND TRANSPARENT (HERO TRACTOR) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-end">
          <div className="w-full lg:w-3/5 h-full relative opacity-25 lg:opacity-40 transition-opacity">
            <img 
              src="assets/images/hero_tractor.png" 
              alt="Tracteur BTP MAXI PLUS" 
              className="w-full h-full object-contain object-right lg:scale-110 animate-tractor"
              onError={(e) => { e.target.src = 'assets/images/hero_tractor.jpg'; }}
            />
            {/* Dégradé de fusion pour lier harmonieusement la navbar et le fond */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#011406] via-[#011406]/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#011406] via-transparent to-[#011406]"></div>
          </div>
        </div>

        {/* Cercles de lueur d'ambiance animés & Grille technique subtile */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#81B39D]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Colonne gauche : Typographie équilibrée, concise et très professionnelle */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-5">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-black text-[#81B39D] tracking-wider uppercase border border-[#81B39D]/30 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#81B39D] animate-ping"></span>
                <span>IMPORTATION PIÈCES CHINOISES • LOCATION BTP CÔTE D'IVOIRE</span>
              </div>

              {/* Titre calibré pour ne pas occuper toute la session */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] font-display">
                La disponibilité de vos engins est notre{' '}
                <span className="text-[#81B39D] inline-block relative underline decoration-[#81B39D]/40 decoration-wavy underline-offset-6">
                  priorité absolue
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                Réduisez drastiquement les temps d'arrêt de vos chantiers. <strong>MAXI PLUS SARL</strong> distribue en stock physique à Abidjan les pièces certifiées d'origine (SDLG, XCMG, LiuGong, SANY, Cat) et met en location immédiate des engins lourds et tracteurs avec chauffeurs certifiés.
              </p>

              {/* Boutons d'action clairs et directs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2 w-full sm:w-auto">
                <button 
                  onClick={() => navigateTo('products')}
                  className="px-6 py-3.5 rounded-xl btn-primary-mint text-xs sm:text-sm font-black shadow-xl flex items-center justify-center gap-2.5 group w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 text-[#011406]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Nos Pièces en Stock</span>
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button 
                  onClick={() => navigateTo('rental')}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto hover:border-[#81B39D]"
                >
                  <svg className="w-4 h-4 text-[#81B39D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Louer un Engin</span>
                </button>
              </div>

              {/* Vignette Interactive Vidéo & Visite du Dépôt */}
              <div 
                onClick={() => setVideoModalOpen(true)}
                className="flex items-center gap-3.5 bg-black/40 border border-white/15 rounded-xl p-2.5 pr-5 backdrop-blur-md cursor-pointer hover:bg-black/60 hover:border-[#81B39D]/50 transition-all group shadow-lg"
              >
                <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 shadow-md">
                  <img src={siteData.heroThumb} alt="Terrain" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#81B39D] flex items-center justify-center text-[#011406] shadow-md group-hover:scale-110 transition-transform">
                      <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Parc d'engins en opération</span>
                  </div>
                  <div className="text-[10px] text-slate-300">Dépôt Angré Djorobité, Abidjan</div>
                </div>
              </div>

            </div>

            {/* Colonne droite : Visuel Engin en vedette avec Badges discrets et élégants */}
            <div className="lg:col-span-5 relative flex items-center justify-center mt-6 lg:mt-0">
              
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                
                {/* Image du tracteur / engin avec animation dynamique */}
                <div className="w-full h-full animate-tractor flex items-center justify-center">
                  <img 
                    src="assets/images/hero_tractor.png" 
                    alt="Tracteur MAXI PLUS" 
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
                    onError={(e) => { e.target.src = siteData.heroImage; }}
                  />
                </div>

                {/* Badge Flottant 1 : Pièces en stock */}
                <div className="absolute -top-2 -right-1 sm:right-0 glass-badge text-slate-800 p-2.5 sm:p-3.5 rounded-xl flex items-center gap-2.5 shadow-xl animate-float-reverse">
                  <div className="w-9 h-9 rounded-lg bg-[#011406] flex items-center justify-center text-[#81B39D] font-black border border-[#81B39D]/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-[#011406] uppercase">+500 PIÈCES EN STOCK</div>
                    <div className="text-[10px] text-slate-600 font-semibold">Disponibilité immédiate</div>
                  </div>
                </div>

                {/* Badge Flottant 2 : Devis en FCFA */}
                <div className="absolute -bottom-2 -left-1 sm:left-2 glass-badge text-slate-800 p-2.5 sm:p-3.5 rounded-xl flex items-center gap-2.5 shadow-xl animate-float-slow">
                  <div className="w-9 h-9 rounded-lg bg-[#011406] flex items-center justify-center text-[#81B39D] font-black border border-[#81B39D]/30">
                    <span className="text-[10px] font-black">FCFA</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-[#011406]">TARIFS DIRECTS DISTRIBUTEUR</div>
                    <div className="text-[10px] text-slate-600 font-semibold">Facturation transparente en FCFA</div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* BANDEAU DE STATS CHIFFRÉES RAPIDES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 mt-10 border-t border-white/10 text-center relative z-10">
            <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-2xl sm:text-3xl font-black text-[#81B39D] font-display">+500</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Références de pièces en stock</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-2xl sm:text-3xl font-black text-white font-display">2h à 4h</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Délai moyen de livraison à Abidjan</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-2xl sm:text-3xl font-black text-[#81B39D] font-display">100%</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Pièces testées & certifiées</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-2xl sm:text-3xl font-black text-white font-display">24/7</div>
              <div className="text-[11px] text-slate-300 font-semibold mt-0.5">Assistance dépannage sur chantier</div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. NOS DOMAINES D'EXPERTISE (SERVICES WE PROVIDE - DÉTAILLÉ & COMPLET) */}
      <section id="services" className={`py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all ${
        currentPage === 'services' ? 'ring-2 ring-[#81B39D] rounded-3xl p-6 bg-white shadow-xl my-6' : ''
      }`}>
        {currentPage === 'services' && (
          <div className="mb-6 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Page dédiée : Nos Services</span>
            <button onClick={() => navigateTo('home')} className="text-xs text-emerald-700 font-bold hover:underline">← Retour à l'accueil</button>
          </div>
        )}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#03300D] bg-[#81B39D]/25 px-4 py-1.5 rounded-full inline-block border border-[#81B39D]/30">
            EXPERTISE CHANTIER & LOGISTIQUE BTP
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#03300D] tracking-tight font-display">
            NOS SERVICES & DOMAINES D'EXPERTISE
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            MAXI PLUS SARL vous accompagne de bout en bout pour garantir la productivité continue de vos chantiers en Côte d'Ivoire. Découvrez nos solutions complètes ci-dessous.
          </p>
        </div>

        {/* Grille de 4 Services Détaillés & Professionnels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Service 1 : Importation & Vente de Pièces */}
          <div className="service-card-dark p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#81B39D] flex items-center justify-center font-black mb-5 border border-white/10 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] font-bold bg-[#81B39D]/20 text-[#81B39D] px-2.5 py-0.5 rounded-full">Chine & Europe</span>
                <span className="text-[10px] font-bold bg-[#81B39D]/20 text-[#81B39D] px-2.5 py-0.5 rounded-full">Stock Local</span>
              </div>
              <h3 className="text-xl font-black text-white font-display mb-2.5">
                Vente & Importation de Pièces
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Approvisionnement direct auprès des usines mères chinoises (SDLG, XCMG, LiuGong, Shantui) et européennes. Pièces d'usure, filtres Donaldson/Fleetguard, dents de godet et composants certifiés avec garantie de conformité.
              </p>
              <ul className="text-[11px] text-slate-300 space-y-1.5 border-t border-white/10 pt-3">
                <li className="flex items-center gap-1.5">✓ Dents de godet & lames d'usure</li>
                <li className="flex items-center gap-1.5">✓ Filtration gasoil, huile, air</li>
                <li className="flex items-center gap-1.5">✓ Pompes & distributeurs hydrauliques</li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between">
              <a href="#catalogue-pieces" className="px-4 py-2 rounded-xl btn-primary-mint text-xs font-black inline-flex items-center gap-1.5">
                <span>Voir les Pièces</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </a>
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 p-1 flex-shrink-0">
                <img src={siteData.servicePartsImage} alt="Pièces" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Service 2 : Location de Matériel Lourd */}
          <div className="service-card-light p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#03300D] text-[#81B39D] flex items-center justify-center font-black mb-5 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] font-bold bg-[#03300D]/10 text-[#03300D] px-2.5 py-0.5 rounded-full">Jour / Mois</span>
                <span className="text-[10px] font-bold bg-[#03300D]/10 text-[#03300D] px-2.5 py-0.5 rounded-full">+ Chauffeur</span>
              </div>
              <h3 className="text-xl font-black text-[#03300D] font-display mb-2.5">
                Location d'Engins & Poids Lourds
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Parc moderne de pelles hydrauliques (21T - 36T), chargeuses sur pneus, bulldozers et camions bennes 20m³. Disponibilité immédiate avec chauffeurs expérimentés et suivi télématique.
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 border-t border-slate-200 pt-3">
                <li className="flex items-center gap-1.5">✓ Pelles chenillées SDLG & Cat</li>
                <li className="flex items-center gap-1.5">✓ Chargeuses frontales & bulldozers</li>
                <li className="flex items-center gap-1.5">✓ Camions bennes terrassement</li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-200 flex items-center justify-between">
              <a href="#engins-location" className="px-4 py-2 rounded-xl btn-primary-dark text-xs font-black inline-flex items-center gap-1.5">
                <span>Louer un Engin</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </a>
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#81B39D]/20 p-1 flex-shrink-0">
                <img src={siteData.serviceRentalImage} alt="Location" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          {/* Service 3 : Maintenance & Atelier Mobile */}
          <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:border-[#81B39D] transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black mb-5 border border-amber-200 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">Sur Chantier</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">24h/7j</span>
              </div>
              <h3 className="text-xl font-black text-[#03300D] font-display mb-2.5">
                Maintenance & Atelier Mobile
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Véhicules d'intervention équipés de sertisseuses de flexibles hydrauliques mobiles, valises de diagnostic électronique multimarques et mécaniciens chevronnés pour dépanner vos engins directement sur site.
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">✓ Sertissage de flexibles sur chantier</li>
                <li className="flex items-center gap-1.5">✓ Remplacement de joints de vérins</li>
                <li className="flex items-center gap-1.5">✓ Révision moteurs Weichai / Cummins</li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
              <a 
                href={`https://wa.me/2250745881234?text=${encodeURIComponent('Bonjour MAXI PLUS, j\'ai une urgence mécanique sur chantier.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Dépannage 24/7</span>
              </a>
              <span className="text-[11px] font-bold text-slate-400">Intervention 2h</span>
            </div>
          </div>

          {/* Service 4 : Sourcing Express & Devis Personnalisé */}
          <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:border-[#81B39D] transition-all group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black mb-5 border border-emerald-200 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">Devis sous 15 min</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">Facture Proforma</span>
              </div>
              <h3 className="text-xl font-black text-[#03300D] font-display mb-2.5">
                Sourcing Express de Pièces Rares
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Une pièce introuvable sur le marché ivoirien ? Notre bureau de liaison en Chine localise la référence exacte en usine avec expédition aérienne express en 72h-96h à l'aéroport d'Abidjan (FHB).
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">✓ Identification par numéro de châssis</li>
                <li className="flex items-center gap-1.5">✓ Expédition par fret aérien express</li>
                <li className="flex items-center gap-1.5">✓ Dédouanement et livraison chantier</li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
              <a 
                href="#contact"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#03300D] text-xs font-black inline-flex items-center gap-1.5"
              >
                <span>Demander un Devis</span>
              </a>
              <span className="text-[11px] font-mono font-bold text-emerald-700">Abidjan & Intérieur</span>
            </div>
          </div>

        </div>

        {/* Bannière de réassurance des marques prises en charge */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-100/80 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#03300D] text-[#81B39D] flex items-center justify-center font-black flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <div>
              <div className="text-sm font-black text-[#03300D]">Pièces 100% Compatibles & Certifiées Origine</div>
              <div className="text-xs text-slate-500">Prise en charge officielle : SDLG, XCMG, LIUGONG, SHANTUI, SANY, CATERPILLAR, KOMATSU, WEICHAI.</div>
            </div>
          </div>
          <a 
            href={`https://wa.me/2250745881234?text=${encodeURIComponent('Bonjour MAXI PLUS, j\'aimerais vérifier la compatibilité d\'une pièce.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl btn-primary-mint text-xs font-black whitespace-nowrap shadow-md"
          >
            Vérifier une référence par photo
          </a>
        </div>
      </section>

      {/* 4. SECTION LOCATION ENGINS, TRACTEURS & POIDS LOURDS */}
      <section id="engins-location" className={`py-16 bg-slate-100/80 border-y border-slate-200 px-4 sm:px-6 lg:px-8 transition-all ${
        currentPage === 'rental' ? 'ring-2 ring-[#81B39D] rounded-3xl p-6 bg-white shadow-xl my-6' : ''
      }`}>
        <div className="max-w-7xl mx-auto">
          {currentPage === 'rental' && (
            <div className="mb-6 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
              <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Page dédiée : Location d'Engins & Poids Lourds</span>
              <button onClick={() => navigateTo('home')} className="text-xs text-emerald-700 font-bold hover:underline">← Retour à l'accueil</button>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#03300D] bg-[#81B39D]/25 px-4 py-1.5 rounded-full inline-block">
                PARC MATÉRIEL EN LOCATION
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#03300D] tracking-tight mt-2 font-display">
                Tracteurs, Pelles & Poids Lourds
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-xl">
                Location flexible à la journée ou au mois. Statuts de disponibilité vérifiés en direct.
              </p>
            </div>

            {/* Filtres par type */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Tous les engins', val: 'all' },
                { label: 'Pelles Mécaniques', val: 'Pelle' },
                { label: 'Chargeuses', val: 'Chargeuse' },
                { label: 'Bulldozers', val: 'Bulldozer' },
                { label: 'Poids Lourds & Tracteurs', val: 'Poids Lourd' },
                { label: 'Chariots', val: 'Manutention' }
              ].map(f => (
                <button
                  key={f.val}
                  onClick={() => setSelectedMachineType(f.val)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedMachineType === f.val 
                      ? 'bg-[#03300D] text-white shadow-md' 
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grille des Engins - 2 Colonnes par ligne sur Mobile (grid-cols-2) */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {filteredMachines.map(mach => {
              const isDispo = mach.status === 'Disponible';
              const isLoue = mach.status === 'En location';
              const isMaint = mach.status === 'En maintenance';

              return (
                <div 
                  key={mach.id} 
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group mobile-card-tight"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[#0a2e16] to-[#03300D] overflow-hidden p-2 sm:p-6 flex items-center justify-center product-img-box">
                    <img 
                      src={mach.image} 
                      alt={mach.name} 
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = 'assets/images/machine_excavator.svg'; }}
                    />
                    
                    {/* Badge Statut */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                      {isDispo && (
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full badge-disponible text-[10px] sm:text-xs font-black shadow-sm">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span className="hidden xs:inline">Disponible</span>
                          <span className="xs:hidden">Dispo</span>
                        </span>
                      )}
                      {isLoue && (
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full badge-location text-[10px] sm:text-xs font-black shadow-sm">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-600"></span>
                          <span>Loué</span>
                        </span>
                      )}
                      {isMaint && (
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full badge-maintenance text-[10px] sm:text-xs font-black shadow-sm">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-500"></span>
                          <span>Maintenance</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-1.5 left-2 sm:bottom-3 sm:left-4 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded text-white text-[9px] sm:text-[11px] font-bold">
                      {mach.brand}
                    </div>
                  </div>

                  <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                    <div>
                      <div className="text-[10px] sm:text-xs font-extrabold text-[#81B39D] uppercase tracking-wider">{mach.type}</div>
                      <h3 className="text-xs sm:text-xl font-extrabold text-[#03300D] font-display mt-0.5 sm:mt-1 line-clamp-1">{mach.name}</h3>
                      <p className="text-slate-500 text-[10px] sm:text-xs mt-1 sm:mt-2 line-clamp-2 leading-relaxed hidden sm:block">
                        {mach.specs}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                      <div>
                        <div className="text-[9px] sm:text-[11px] text-slate-500 font-semibold uppercase">Tarif Jour</div>
                        <div className="text-xs sm:text-lg font-black text-[#03300D]">{formatFCFA(mach.price_day)}</div>
                      </div>
                      <div className="sm:text-right sm:border-l sm:border-slate-200 sm:pl-4">
                        <div className="text-[9px] sm:text-[11px] text-slate-500 font-semibold uppercase">Tarif Mois</div>
                        <div className="text-[11px] sm:text-sm font-bold text-slate-700">{formatFCFA(mach.price_month)}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingMachine(mach)}
                      disabled={!isDispo}
                      className={`w-full py-2.5 sm:py-3.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                        isDispo
                          ? 'btn-primary-dark shadow-md'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{isDispo ? 'Réserver' : 'Indisponible'}</span>
                    </button>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. SECTION PRODUITS : CATALOGUE DES PIÈCES DÉTACHÉES */}
      <section id="catalogue-pieces" className={`py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all ${
        currentPage === 'products' ? 'ring-2 ring-[#81B39D] rounded-3xl p-6 bg-white shadow-xl my-6' : ''
      }`}>
        {currentPage === 'products' && (
          <div className="mb-6 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Page dédiée : Catalogue de Nos Pièces Détachées</span>
            <button onClick={() => navigateTo('home')} className="text-xs text-emerald-700 font-bold hover:underline">← Retour à l'accueil</button>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#81B39D] bg-[#81B39D]/10 px-4 py-1.5 rounded-full inline-block">
              VENTE DIRECTE • PIÈCES D'ENGINS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#03300D] tracking-tight mt-2 font-display">
              Catalogue des Pièces de Rechange
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Stock physique à Abidjan. Commandez directement en Francs CFA et recevez sur votre chantier.
            </p>
          </div>

          <div className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher (ex: SDLG, filtre, godet)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#81B39D] shadow-sm"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Onglets de Catégories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#03300D] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Toutes les Pièces ({products.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id.toString())}
              className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === c.id.toString()
                  ? 'bg-[#03300D] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grille des pièces - 2 Colonnes par ligne sur Mobile (grid-cols-2) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map(prod => (
            <div 
              key={prod.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm product-card-hover p-2.5 sm:p-4 flex flex-col justify-between group mobile-card-tight"
            >
              <div>
                <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-100 p-2 sm:p-4 mb-2.5 sm:mb-4 flex items-center justify-center overflow-hidden product-img-box">
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'assets/images/part_filter_oil.svg'; }}
                  />
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[8px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded">
                    {prod.ref}
                  </div>
                  {prod.stock > 0 && (
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-emerald-100 text-emerald-800 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full">
                      Stock: {prod.stock}
                    </div>
                  )}
                </div>

                <div className="text-[9px] sm:text-[11px] font-black text-[#81B39D] uppercase tracking-wider">{prod.brand}</div>
                <h3 className="text-xs sm:text-sm font-black text-[#03300D] line-clamp-2 mt-0.5 sm:mt-1 leading-snug">{prod.name}</h3>
                <p className="text-slate-500 text-[10px] sm:text-xs mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">{prod.description}</p>
              </div>

              <div className="pt-2.5 sm:pt-4 mt-2 sm:mt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[8px] sm:text-[10px] text-slate-400 font-semibold uppercase">Prix TTC</div>
                  <div className="text-xs sm:text-base font-black text-[#03300D]">{formatFCFA(prod.price)}</div>
                </div>

                <button
                  onClick={() => addToCart(prod)}
                  className="w-full sm:w-auto p-2 sm:p-2.5 rounded-xl btn-primary-mint text-[#03300D] hover:bg-[#a3d1be] transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-black shadow-sm"
                  title="Ajouter au panier"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Commander</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 6. SECTION CONTACT & DEVIS (ANCRE #contact) */}
      <section id="contact" className={`py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-100 transition-all ${
        currentPage === 'contact' ? 'ring-2 ring-[#81B39D] rounded-3xl p-6 bg-white shadow-xl my-6' : ''
      }`}>
        {currentPage === 'contact' && (
          <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl">
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Page dédiée : Contact & Demande de Devis</span>
            <button onClick={() => navigateTo('home')} className="text-xs text-emerald-700 font-bold hover:underline">← Retour à l'accueil</button>
          </div>
        )}
        <div className="max-w-7xl mx-auto rounded-[40px] bg-gradient-to-br from-[#011406] via-[#03300D] to-[#011406] text-white p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl border border-[#81B39D]/20">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#81B39D]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#81B39D] bg-white/10 px-4 py-1.5 rounded-full inline-block border border-white/10">
                SERVICE CLIENT IMMÉDIAT • CÔTE D'IVOIRE
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
                BESOIN D'UNE PIÈCE OU D'UN ENGIN EN URGENCE ?
              </h2>
              <p className="text-slate-200 text-base leading-relaxed">
                Prenez simplement une photo de la pièce défaillante ou de la plaque constructeur de votre machine et contactez notre équipe technique directement. Nous vous transmettons votre devis chiffré en FCFA sous 15 minutes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                  <div className="text-[#81B39D] font-black text-lg mb-1">Moins de 5 min</div>
                  <div className="text-xs text-slate-300">Temps moyen de réponse de nos magasiniers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                  <div className="text-emerald-400 font-black text-lg mb-1">Livraison 2h à 4h</div>
                  <div className="text-xs text-slate-300">Expédition express sur les chantiers du Grand Abidjan</div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <a 
                  href={`https://wa.me/2250745881234?text=${encodeURIComponent('Bonjour MAXI PLUS SARL, je vous envoie la photo d\'une pièce d\'engin pour un devis urgent.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-2xl btn-primary-mint text-sm font-black inline-flex items-center gap-3 shadow-2xl"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  <span>Discuter sur WhatsApp (+225 07 45 88 12 34)</span>
                </a>
                <a 
                  href="admin/index.php" 
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-black border border-white/20 backdrop-blur-md transition-all inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#81B39D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Tableau de Bord Administrateur</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-sm animate-float-slow">
                <img 
                  src={siteData.mobileAppImage} 
                  alt="App Mobile MAXI PLUS" 
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. MODAL VIDÉO INTERACTIVE */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up">
          <div className="w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <div className="p-4 bg-slate-800 flex items-center justify-between text-white border-b border-white/10">
              <div className="font-bold text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Présentation du Parc Engins & Dépôt MAXI PLUS SARL</span>
              </div>
              <button onClick={() => setVideoModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="aspect-video bg-black rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/10">
                <img src={siteData.heroThumb} alt="Vidéo" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#81B39D] text-[#03300D] flex items-center justify-center shadow-2xl animate-pulse">
                    <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <div className="font-black text-lg">Parc Matériel & Magasin Pièces Abidjan</div>
                  <div className="text-xs text-slate-300">Angré Djorobité, Garage zone industrielle</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Visitez notre dépôt et nos ateliers de réparation à Abidjan pour vérifier la disponibilité de vos pièces détachées ou réserver vos engins de terrassement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. FOOTER OFFICIEL */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-1 border border-slate-200">
                <img src={siteData.logoImage} alt="MAXI PLUS SARL" className="w-full h-full object-contain" />
              </div>
              <div className="font-black text-xl text-[#03300D] font-display">MAXI PLUS SARL</div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Importation et distribution de pièces pour engins lourds et location d'équipements de terrassement en Côte d'Ivoire.
            </p>
            <div className="text-[11px] text-slate-500 font-mono space-y-1">
              <div>RCCM : {siteData.rccm}</div>
              <div>NCC : {siteData.ncc}</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#03300D] mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><a href="#accueil" className="hover:text-[#03300D]">Accueil</a></li>
              <li><a href="#services" className="hover:text-[#03300D]">Nos Services</a></li>
              <li><a href="#engins-location" className="hover:text-[#03300D]">Engins & Tracteurs</a></li>
              <li><a href="#catalogue-pieces" className="hover:text-[#03300D]">Catalogue Pièces</a></li>
              <li><a href="admin/index.php" className="text-[#81B39D] font-bold hover:underline">Espace Administrateur</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#03300D] mb-4">Marques Couvertes</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>• SDLG (Shandong Lingong)</li>
              <li>• XCMG Construction Machinery</li>
              <li>• LiuGong Machinery</li>
              <li>• Shantui Construction</li>
              <li>• SANY Heavy Industry</li>
              <li>• Caterpillar & Komatsu</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#03300D] mb-4">Implantation & Contact</h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#81B39D] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Angré Djorobité, Garage zone industrielle, Abidjan</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#81B39D] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>+225 07 45 88 12 34 / 05 12 33 44 55</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>© {new Date().getFullYear()} MAXI PLUS SARL. Tarifs en Francs CFA (FCFA / XOF).</div>
          <a href="admin/index.php" className="text-slate-500 hover:text-[#03300D] font-bold">Connexion Admin</a>
        </div>
      </footer>

      {/* MODAL PANIER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#03300D] text-[#81B39D] flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#03300D]">Votre Commande de Pièces</h3>
                  <div className="text-xs text-slate-500">{cart.length} référence(s) sélectionnée(s)</div>
                </div>
              </div>

              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <p className="text-sm font-bold text-slate-600">Votre panier est vide</p>
                  <p className="text-xs text-slate-400 mt-1">Parcourez le catalogue et ajoutez vos pièces.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#03300D] truncate">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.ref}</div>
                        <div className="text-xs font-black text-[#03300D] mt-0.5">{formatFCFA(item.price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                        >-</button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                        >+</button>
                      </div>
                    </div>
                  ))}

                  <form onSubmit={handleCheckout} className="pt-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#03300D]">Coordonnées pour la livraison</h4>
                    <div>
                      <input 
                        type="text" 
                        required 
                        placeholder="Nom ou Entreprise *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#81B39D] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="tel" 
                        required 
                        placeholder="Téléphone / WhatsApp *"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#81B39D] outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Ville / Chantier (ex: Abidjan)"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#81B39D] outline-none"
                      />
                    </div>
                    <div>
                      <textarea 
                        rows="2"
                        placeholder="Précisions de livraison..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#81B39D] outline-none resize-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingOrder}
                      className="w-full py-3.5 rounded-xl btn-primary-mint text-xs font-extrabold shadow-lg flex items-center justify-center gap-2"
                    >
                      {isSubmittingOrder ? <span>Traitement...</span> : <span>Valider la commande • {formatFCFA(cartTotal)}</span>}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total :</span>
                <span className="text-lg font-black text-[#03300D]">{formatFCFA(cartTotal)}</span>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL RÉSERVATION ENGIN */}
      {bookingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="p-6 bg-[#03300D] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#81B39D] bg-white/10 px-2.5 py-0.5 rounded">
                  RÉSERVATION LOCATION
                </span>
                <h3 className="text-lg font-extrabold font-display mt-1">{bookingMachine.name}</h3>
                <div className="text-xs text-slate-300">{bookingMachine.brand} • {bookingMachine.model}</div>
              </div>
              <button 
                onClick={() => setBookingMachine(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMachineBooking} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold">Tarif Jour :</span>
                  <div className="font-extrabold text-[#03300D] text-sm">{formatFCFA(bookingMachine.price_day)}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Tarif Mois :</span>
                  <div className="font-extrabold text-[#03300D] text-sm">{formatFCFA(bookingMachine.price_month)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durée :</label>
                  <input 
                    type="number" 
                    min="1" 
                    required
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unité :</label>
                  <select 
                    value={rentalDurationUnit}
                    onChange={(e) => setRentalDurationUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none bg-white"
                  >
                    <option value="days">Jour(s)</option>
                    <option value="months">Mois</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <input 
                  type="text" 
                  required 
                  placeholder="Nom ou Entreprise *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="tel" 
                    required 
                    placeholder="Téléphone / WhatsApp *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Ville / Chantier *"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900">Total estimé :</span>
                <span className="text-base font-black text-emerald-800">
                  {formatFCFA(
                    (rentalDurationUnit === 'days' ? bookingMachine.price_day : bookingMachine.price_month) * (parseInt(rentalDuration) || 1)
                  )}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingMachine(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 py-3 rounded-xl btn-primary-mint font-black shadow-md"
                >
                  {isSubmittingOrder ? 'Validation...' : 'Confirmer la Réservation'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL SUCCÈS */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            </div>
            
            <h3 className="text-2xl font-black text-[#03300D] font-display">Demande Enregistrée !</h3>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <div className="text-slate-500 font-semibold">Référence de votre dossier :</div>
              <div className="text-lg font-mono font-extrabold text-[#03300D]">{orderSuccess.ref}</div>
              <div className="text-slate-700 font-bold mt-1">Montant : {formatFCFA(orderSuccess.total)}</div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Votre conseiller MAXI PLUS SARL vous contacte immédiatement sur le <strong>{orderSuccess.phone}</strong> pour coordonner la mise à disposition ou l'expédition.
            </p>

            <button 
              onClick={() => setOrderSuccess(null)}
              className="w-full py-3.5 rounded-xl btn-primary-mint text-xs font-extrabold shadow-md"
            >
              Compris, merci !
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
