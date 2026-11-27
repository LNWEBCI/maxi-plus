// assets/js/admin.js - Tableau de bord Administrateur avec Sidebar Professionnelle MAXI PLUS SARL
const { useState, useEffect, useMemo } = React;

const formatFCFA = (amount) => {
  if (amount === undefined || amount === null) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return { date: 'Aujourd\'hui', time: '--:--' };
  try {
    const safeStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const d = new Date(safeStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: '' };
    const dateFormatted = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeFormatted = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return { date: dateFormatted, time: timeFormatted };
  } catch (e) {
    return { date: dateStr, time: '' };
  }
};

function AdminApp() {
  const [auth, setAuth] = useState(window.ADMIN_BOOTSTRAP || { isAuth: false, user: null });
  const [email, setEmail] = useState('admin@maxiplus.ci');
  const [password, setPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sidebar Controls
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'products', 'machines', 'site_images'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Données
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [dataLoading, setDataLoading] = useState(false);

  // Modals et formulaires
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [machineModalOpen, setMachineModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // Pop-up de confirmation personnalisée
  const [isDeleting, setIsDeleting] = useState(false);

  // Formulaire Produit
  const [prodForm, setProdForm] = useState({
    name: '',
    ref: '',
    category_id: 1,
    brand: 'SDLG / LiuGong',
    price: 25000,
    stock: 10,
    description: '',
    image: 'assets/images/part_filter_oil.svg',
    featured: 0
  });

  // Formulaire Engin
  const [machForm, setMachForm] = useState({
    name: '',
    type: 'Pelle Mécanique',
    brand: 'SDLG',
    model: 'E6210F',
    price_day: 220000,
    price_month: 4800000,
    specs: 'Poids: 21T | Godet: 1.0 m³ | Moteur: Weichai',
    status: 'Disponible',
    image: 'assets/images/machine_excavator.svg',
    featured: 1
  });

  // Filtres
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Notifications Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (auth.isAuth) {
      loadAllAdminData();
    }
  }, [auth.isAuth]);

  const loadAllAdminData = async () => {
    try {
      setDataLoading(true);

      const oRes = await fetch('../api/orders.php');
      const oData = await oRes.json();
      if (oData.success) {
        setOrders(oData.orders || []);
        setStats(oData.stats || {});
      }

      const pRes = await fetch('../api/products.php');
      const pData = await pRes.json();
      if (pData.success) {
        setProducts(pData.products || []);
        setCategories(pData.categories || []);
      }

      const mRes = await fetch('../api/machines.php');
      const mData = await mRes.json();
      if (mData.success) {
        setMachines(mData.machines || []);
      }

      const sRes = await fetch('../api/site_settings.php');
      const sData = await sRes.json();
      if (sData.success) {
        setSiteSettings(sData.settings || {});
      }
    } catch (err) {
      console.error('Erreur données admin:', err);
      showToast('Erreur de communication avec le serveur', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('../api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setAuth({ isAuth: true, user: data.user });
      } else {
        setLoginError(data.error || 'Identifiants invalides');
      }
    } catch (err) {
      setLoginError('Impossible de joindre le serveur.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('../api/auth.php?action=logout', { method: 'POST' });
      setAuth({ isAuth: false, user: null });
    } catch (err) {
      window.location.reload();
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('../api/orders.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(`Statut commande mis à jour : ${newStatus}`);
      }
    } catch (err) {
      showToast('Erreur mise à jour statut', 'error');
    }
  };

  // Suppression confirmée via le pop-up personnalisé (sans popup standard du navigateur)
  const confirmDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      if (deleteModal.type === 'order') {
        const res = await fetch(`../api/orders.php?id=${deleteModal.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setOrders(prev => prev.filter(o => o.id !== deleteModal.id));
          if (selectedOrder?.id === deleteModal.id) setSelectedOrder(null);
          showToast('Commande supprimée avec succès !');
        } else {
          alert(data.error || 'Erreur lors de la suppression');
        }
      } else if (deleteModal.type === 'product') {
        const res = await fetch(`../api/products.php?id=${deleteModal.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
          showToast('Pièce retirée du catalogue !');
        } else {
          alert(data.error || 'Erreur lors de la suppression');
        }
      } else if (deleteModal.type === 'machine') {
        const res = await fetch(`../api/machines.php?id=${deleteModal.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setMachines(prev => prev.filter(m => m.id !== deleteModal.id));
          showToast('Engin retiré du parc de location !');
        } else {
          alert(data.error || 'Erreur lors de la suppression');
        }
      }
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModal(null);
    }
  };

  const handleUpdateMachineStatus = async (machineId, newStatus) => {
    try {
      const res = await fetch('../api/machines.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: machineId, status: newStatus, status_only: true })
      });
      const data = await res.json();
      if (data.success) {
        setMachines(prev => prev.map(m => m.id === machineId ? { ...m, status: newStatus } : m));
        showToast(`Statut engin mis à jour : ${newStatus}`);
      }
    } catch (err) {
      showToast('Erreur statut engin', 'error');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingProduct;
      const res = await fetch('../api/products.php', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...prodForm, id: editingProduct?.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setProductModalOpen(false);
        setEditingProduct(null);
        loadAllAdminData();
      } else {
        alert(data.error || 'Erreur enregistrement pièce');
      }
    } catch (err) {
      showToast('Erreur réseau', 'error');
    }
  };

  const handleDeleteProduct = (prod) => {
    setDeleteModal({
      type: 'product',
      id: prod.id,
      refText: prod.ref,
      client: prod.name,
      amount: prod.price
    });
  };

  const handleSaveMachine = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingMachine;
      const res = await fetch('../api/machines.php', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...machForm, id: editingMachine?.id })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setMachineModalOpen(false);
        setEditingMachine(null);
        loadAllAdminData();
      } else {
        alert(data.error || 'Erreur enregistrement engin');
      }
    } catch (err) {
      showToast('Erreur réseau', 'error');
    }
  };

  const handleDeleteMachine = (mach) => {
    setDeleteModal({
      type: 'machine',
      id: mach.id,
      refText: `${mach.brand} ${mach.model}`,
      client: mach.name,
      amount: mach.price_day
    });
  };

  const handleUpdateSiteImage = async (keyName, newImageUrl) => {
    try {
      const res = await fetch('../api/site_settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_name: keyName,
          image_url: newImageUrl,
          value_text: newImageUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setSiteSettings(prev => ({
          ...prev,
          [keyName]: { ...(prev[keyName] || {}), image_url: newImageUrl }
        }));
        showToast('Image du site mise à jour avec succès !');
      }
    } catch (err) {
      showToast('Erreur mise à jour image', 'error');
    }
  };

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Téléversement de la photo en cours...', 'info');
      const res = await fetch('../api/upload.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        callback(data.url);
        showToast('Photo enregistrée avec succès !');
      } else {
        alert(data.error || 'Erreur upload');
      }
    } catch (err) {
      showToast('Erreur réseau', 'error');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = orderFilter === 'all' || o.status === orderFilter;
      const q = (orderSearch || globalSearch).toLowerCase().trim();
      const matchSearch = !q || 
        o.order_ref.toLowerCase().includes(q) || 
        o.customer_name.toLowerCase().includes(q) || 
        o.customer_phone.includes(q) || 
        o.customer_city.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, orderFilter, orderSearch, globalSearch]);

  // Si non connecté : Affichage de la page de connexion
  if (!auth.isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#011a07] via-[#03300D] to-[#084817] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/20 space-y-6 animate-scale-in">
          
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-white p-1 border border-slate-200 shadow-md">
              <img src="../assets/images/logo.jpg" alt="MAXI PLUS SARL" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-[#03300D] font-display">MAXI PLUS SARL</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administration Centrale</p>
          </div>

          {loginError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Identifiant Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@maxiplus.ci"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#81B39D] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#81B39D] outline-none"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Identifiants configurés :</span><br/>
              Email: <code className="text-[#03300D] font-bold">admin@maxiplus.ci</code><br/>
              Mot de passe: <code className="text-[#03300D] font-bold">admin123</code>
            </div>

            <button 
              type="submit" 
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl btn-primary-mint text-xs font-extrabold shadow-lg flex items-center justify-center gap-2"
            >
              {loginLoading ? <span>Vérification...</span> : <span>Se Connecter au Tableau de Bord</span>}
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="index.html" className="text-xs text-slate-500 hover:text-[#03300D] font-bold">
              ← Retour au site public
            </a>
          </div>

        </div>
      </div>
    );
  }

  // Dashboard Administrateur avec SIDEBAR
  return (
    <div className="min-h-screen flex bg-slate-100 antialiased">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 transition-all animate-bounce ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#03300D] text-[#81B39D] border border-[#81B39D]'
        }`}>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* OVERLAY MOBILE */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        ></div>
      )}

      {/* ==============================================================
          SIDEBAR PROFESSIONNELLE
          ============================================================== */}
      <aside className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex flex-col justify-between py-6 transition-all duration-300 lg:static ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* En-tête Sidebar */}
        <div className="px-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 overflow-hidden ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-11 h-11 rounded-2xl bg-white p-1 border border-white/20 shadow-sm flex-shrink-0 flex items-center justify-center">
                <img src="../assets/images/logo.jpg" alt="MAXI PLUS" className="w-full h-full object-contain" />
              </div>
              {!sidebarCollapsed && (
                <div className="leading-tight">
                  <div className="font-black text-lg text-white font-display tracking-tight flex items-center gap-1.5">
                    <span>MAXI PLUS</span>
                  </div>
                  <div className="text-[10px] text-[#81B39D] font-black uppercase tracking-wider">PANNEAU ADMIN</div>
                </div>
              )}
            </div>

            {/* Bouton rétracter sidebar (sur bureau) */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title={sidebarCollapsed ? "Agrandir le menu" : "Réduire le menu"}
            >
              <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
              </svg>
            </button>
          </div>

          {/* Profil admin connecté */}
          {!sidebarCollapsed && (
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#81B39D] text-[#03300D] font-black flex items-center justify-center text-xs shadow-md">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">Administrateur</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>En ligne • Abidjan</span>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION SIDEBAR ITEMS */}
          <nav className="space-y-1.5 pt-2">
            {[
              {
                id: 'overview',
                label: "Vue d'ensemble",
                desc: 'Statistiques & KPI',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                )
              },
              {
                id: 'orders',
                label: 'Commandes & Devis',
                desc: 'Suivi des ventes',
                badge: stats.pending_count > 0 ? stats.pending_count : null,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                )
              },
              {
                id: 'products',
                label: 'Pièces & Produits',
                desc: 'Vente catalogue',
                count: products.length,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                )
              },
              {
                id: 'machines',
                label: 'Engins en Location',
                desc: 'Tracteurs, pelles, bennes',
                count: machines.length,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                )
              },
              {
                id: 'site_images',
                label: 'Images du Site',
                desc: 'Remplacement en direct',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )
              }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`admin-nav-item w-full p-3 rounded-2xl flex items-center gap-3 text-left ${
                  activeTab === item.id ? 'active' : ''
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!sidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="text-xs font-bold truncate">{item.label}</span>
                    {item.badge && (
                      <span className="bg-[#f59e0b] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && !item.badge && (
                      <span className="text-[10px] text-slate-400 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Pied de Sidebar : Site public & Déconnexion */}
        <div className="px-4 space-y-2 border-t border-white/10 pt-4">
          <a
            href="index.html"
            target="_blank"
            className={`w-full p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 text-xs font-bold transition-all ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Ouvrir le site client"
          >
            <svg className="w-5 h-5 flex-shrink-0 text-[#81B39D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            {!sidebarCollapsed && <span>Voir le Site Public</span>}
          </a>

          <button
            onClick={handleLogout}
            className={`w-full p-2.5 rounded-xl text-red-300 hover:text-white hover:bg-red-500/20 flex items-center gap-3 text-xs font-bold transition-all ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Se déconnecter"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>

      </aside>

      {/* ==============================================================
          ESPACE DE TRAVAIL PRINCIPAL (À DROITE DE LA SIDEBAR)
          ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* TOP BAR / HEADER D'ESPACE DE TRAVAIL */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm px-6 py-4 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            {/* Fil d'Ariane dynamique */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-400">Administration</span>
              <span className="text-slate-300">/</span>
              <span className="font-extrabold text-[#03300D] uppercase tracking-wide">
                {activeTab === 'overview' && "Tableau de Bord & Vue d'ensemble"}
                {activeTab === 'orders' && "Gestion des Commandes"}
                {activeTab === 'products' && "Catalogue des Pièces de Rechange"}
                {activeTab === 'machines' && "Parc d'Engins en Location"}
                {activeTab === 'site_images' && "Personnalisation & Images du Site"}
              </span>
            </div>
          </div>

          {/* Recherche globale & Boutons rapides */}
          <div className="flex items-center gap-3">
            
            <div className="hidden sm:block relative w-64">
              <input 
                type="text" 
                placeholder="Recherche rapide (client, réf...)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-[#81B39D] outline-none"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Bouton rapide selon contexte */}
            {activeTab === 'products' && (
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setProdForm({
                    name: '',
                    ref: 'REF-' + Math.floor(1000 + Math.random() * 9000),
                    category_id: 1,
                    brand: 'SDLG / LiuGong',
                    price: 35000,
                    stock: 15,
                    description: 'Pièce de rechange d\'origine pour engins de chantier.',
                    image: 'assets/images/part_filter_oil.svg',
                    featured: 1
                  });
                  setProductModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl btn-primary-mint text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <span>+ Nouvelle Pièce</span>
              </button>
            )}

            {activeTab === 'machines' && (
              <button 
                onClick={() => {
                  setEditingMachine(null);
                  setMachForm({
                    name: '',
                    type: 'Pelle Mécanique',
                    brand: 'SDLG',
                    model: 'E6210F',
                    price_day: 200000,
                    price_month: 4500000,
                    specs: 'Capacité godet 3m³ | Moteur Weichai 162 kW',
                    status: 'Disponible',
                    image: 'assets/images/machine_excavator.svg',
                    featured: 1
                  });
                  setMachineModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl btn-primary-mint text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <span>+ Nouvel Engin</span>
              </button>
            )}

          </div>

        </header>

        {/* CONTENU PRINCIPAL DE L'ONGLET */}
        <main className="p-6 lg:p-8 space-y-8 flex-1">
          
          {/* 1. ONGLET : VUE D'ENSEMBLE */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-up">
              
              {/* Cartes KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-[#81B39D] transition-all">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Chiffre d'Affaires</div>
                    <div className="text-2xl font-black text-[#03300D] mt-1 font-display">{formatFCFA(stats.total_revenue || 0)}</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">Commandes enregistrées</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    CFA
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-300 transition-all">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Total Commandes</div>
                    <div className="text-2xl font-black text-[#03300D] mt-1 font-display">{stats.orders_count || 0}</div>
                    <div className="text-[11px] text-amber-600 font-bold mt-1">{stats.pending_count || 0} en attente</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Engins Disponibles</div>
                    <div className="text-2xl font-black text-[#03300D] mt-1 font-display">{stats.machines_available || 0}</div>
                    <div className="text-[11px] text-slate-500 font-bold mt-1">{stats.machines_rented || 0} actuellement loués</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-purple-300 transition-all">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Pièces en Catalogue</div>
                    <div className="text-2xl font-black text-[#03300D] mt-1 font-display">{stats.products_count || 0}</div>
                    <div className="text-[11px] text-slate-500 font-bold mt-1">Multi-marques SDLG, XCMG</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                </div>

              </div>

              {/* Tableau Récent */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-[#03300D]">Commandes Récentes</h3>
                    <p className="text-xs text-slate-500">Dernières requêtes clients à traiter.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#81B39D] hover:underline"
                  >
                    Voir tout le carnet de commandes →
                  </button>
                </div>

                <div className="overflow-x-auto w-full rounded-2xl border border-slate-100 shadow-sm">
                  <table className="table-single-line min-w-[1150px] w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4 whitespace-nowrap">Réf.</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Client</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Contact</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Type</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Montant FCFA</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">Statut</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {orders.slice(0, 5).map(ord => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-black text-[#03300D] whitespace-nowrap">{ord.order_ref}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-700 text-xs">{formatDateTime(ord.created_at).date}</div>
                            <div className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-1 mt-0.5">
                              <svg className="w-3 h-3 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{formatDateTime(ord.created_at).time}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-800 whitespace-nowrap">{ord.customer_name}</span>
                            <span className="text-[10px] text-slate-400 block whitespace-nowrap">{ord.customer_city}</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-700 whitespace-nowrap font-mono">{ord.customer_phone}</span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 whitespace-nowrap">
                              {ord.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-[#03300D] whitespace-nowrap">{formatFCFA(ord.total_amount)}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select 
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className="text-[11px] font-bold rounded-lg border border-slate-300 py-1.5 px-2.5 outline-none bg-white cursor-pointer whitespace-nowrap"
                            >
                              <option value="En attente">En attente</option>
                              <option value="Confirmée">Confirmée</option>
                              <option value="En cours de livraison / En location">En cours de livraison / En location</option>
                              <option value="Terminée">Terminée</option>
                              <option value="Annulée">Annulée</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                              <button 
                                onClick={() => setSelectedOrder(ord)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold whitespace-nowrap transition-colors"
                              >
                                Facture
                              </button>
                              <button 
                                onClick={() => setDeleteModal({
                                  type: 'order',
                                  id: ord.id,
                                  refText: ord.order_ref,
                                  client: ord.customer_name,
                                  amount: ord.total_amount
                                })}
                                className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center justify-center whitespace-nowrap transition-colors"
                                title="Supprimer la commande"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 2. ONGLET : GESTION DES COMMANDES */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-up">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#03300D]">Registre des Commandes ({filteredOrders.length})</h3>
                  <p className="text-xs text-slate-500">Traitez, confirmez et imprimez les factures proforma en FCFA.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Filtrer client, réf, tel..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#81B39D] outline-none"
                  />

                  <select 
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-[#81B39D] outline-none bg-white"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="En attente">En attente</option>
                    <option value="Confirmée">Confirmée</option>
                    <option value="En cours de livraison / En location">En cours de livraison / En location</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto w-full rounded-2xl border border-slate-100 shadow-sm">
                <table className="table-single-line min-w-[1150px] w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4 whitespace-nowrap">Réf.</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Client</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Contact</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Articles / Engin</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Montant FCFA</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Statut</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredOrders.map(ord => {
                      const itemsText = ord.items && Array.isArray(ord.items)
                        ? ord.items.map(it => `${it.name} (${it.quantity || it.duration || 1})`).join(', ')
                        : 'Détails non spécifiés';

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-mono font-black text-[#03300D] whitespace-nowrap">{ord.order_ref}</td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-700 text-xs">{formatDateTime(ord.created_at).date}</div>
                            <div className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-1 mt-0.5">
                              <svg className="w-3 h-3 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{formatDateTime(ord.created_at).time}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-800 whitespace-nowrap block">{ord.customer_name}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap block">{ord.customer_city}</span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 font-bold text-slate-700 whitespace-nowrap">
                              <span className="whitespace-nowrap font-mono">{ord.customer_phone}</span>
                              <a 
                                href={`https://wa.me/${ord.customer_phone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex-shrink-0"
                                title="WhatsApp direct"
                              >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                              </a>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap max-w-[280px] truncate text-[11px] text-slate-600" title={itemsText}>
                            {itemsText}
                          </td>
                          <td className="py-4 px-4 font-black text-[#03300D] text-sm whitespace-nowrap">
                            {formatFCFA(ord.total_amount)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <select 
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className={`text-[11px] font-black rounded-xl py-1.5 px-3 border outline-none cursor-pointer whitespace-nowrap ${
                                ord.status === 'Confirmée' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                ord.status === 'En attente' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                ord.status === 'Terminée' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                ord.status === 'Annulée' ? 'bg-red-50 border-red-200 text-red-700' :
                                'bg-purple-50 border-purple-200 text-purple-700'
                              }`}
                            >
                              <option value="En attente">En attente</option>
                              <option value="Confirmée">Confirmée</option>
                              <option value="En cours de livraison / En location">En cours de livraison / En location</option>
                              <option value="Terminée">Terminée</option>
                              <option value="Annulée">Annulée</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                              <button 
                                onClick={() => setSelectedOrder(ord)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold whitespace-nowrap transition-colors"
                              >
                                Facture
                              </button>
                              <button 
                                onClick={() => setDeleteModal({
                                  type: 'order',
                                  id: ord.id,
                                  refText: ord.order_ref,
                                  client: ord.customer_name,
                                  amount: ord.total_amount
                                })}
                                className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center justify-center whitespace-nowrap transition-colors"
                                title="Supprimer la commande"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* 3. ONGLET : GESTION DES PIÈCES & PRODUITS */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-up">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#03300D]">Catalogue des Pièces de Rechange ({products.length})</h3>
                  <p className="text-xs text-slate-500">Ajout, modification, ajustement des stocks et remplacement des images.</p>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="Recherche pièce, réf..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#81B39D] outline-none"
                  />

                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setProdForm({
                        name: '',
                        ref: 'REF-' + Math.floor(1000 + Math.random() * 9000),
                        category_id: 1,
                        brand: 'SDLG / Weichai',
                        price: 35000,
                        stock: 15,
                        description: 'Pièce de rechange certifiée.',
                        image: 'assets/images/part_filter_oil.svg',
                        featured: 1
                      });
                      setProductModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl btn-primary-mint text-xs font-black shadow-md flex items-center gap-1.5"
                  >
                    <span>+ Ajouter une Pièce</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.ref.toLowerCase().includes(productSearch.toLowerCase()))
                  .map(prod => (
                    <div key={prod.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-[#81B39D] transition-all">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                            <img src={`../${prod.image}`} alt={prod.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-mono font-bold text-slate-400">{prod.ref}</div>
                            <h4 className="text-xs font-bold text-[#03300D] truncate">{prod.name}</h4>
                            <div className="text-[11px] text-[#81B39D] font-bold">{prod.brand}</div>
                          </div>
                        </div>

                        <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed mb-3">{prod.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-[#03300D]">{formatFCFA(prod.price)}</div>
                          <div className="text-[10px] text-slate-500">Stock: {prod.stock} unités</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => {
                              setEditingProduct(prod);
                              setProdForm({ ...prod });
                              setProductModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
                          >
                            Modifier
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(prod)}
                            className="px-2 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold"
                            title="Supprimer la pièce"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* 4. ONGLET : GESTION DES ENGINS EN LOCATION */}
          {activeTab === 'machines' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-up">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#03300D]">Parc d'Engins & Poids Lourds ({machines.length})</h3>
                  <p className="text-xs text-slate-500">Contrôlez les statuts opérationnels et tarifs de location en Francs CFA.</p>
                </div>

                <button 
                  onClick={() => {
                    setEditingMachine(null);
                    setMachForm({
                      name: '',
                      type: 'Pelle Mécanique',
                      brand: 'SDLG',
                      model: 'LG956L',
                      price_day: 200000,
                      price_month: 4500000,
                      specs: 'Capacité godet 3m³ | Moteur Weichai 162 kW',
                      status: 'Disponible',
                      image: 'assets/images/machine_excavator.svg',
                      featured: 1
                    });
                    setMachineModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl btn-primary-mint text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <span>+ Ajouter un Engin</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.map(mach => (
                  <div key={mach.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="aspect-video bg-[#03300D] p-4 flex items-center justify-center relative">
                        <img src={`../${mach.image}`} alt={mach.name} className="w-full h-full object-contain" />
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {mach.brand} • {mach.model}
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-[10px] font-extrabold text-[#81B39D] uppercase">{mach.type}</div>
                        <h4 className="text-sm font-extrabold text-[#03300D]">{mach.name}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{mach.specs}</p>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Tarif Jour :</span>
                            <span className="font-bold text-[#03300D]">{formatFCFA(mach.price_day)}</span>
                          </div>
                          <div className="text-right border-l pl-3">
                            <span className="text-[10px] text-slate-400 block">Tarif Mois :</span>
                            <span className="font-bold text-slate-700">{formatFCFA(mach.price_month)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Statut opérationnel :
                        </label>
                        <select 
                          value={mach.status}
                          onChange={(e) => handleUpdateMachineStatus(mach.id, e.target.value)}
                          className={`w-full text-xs font-black rounded-xl py-2 px-3 border outline-none cursor-pointer ${
                            mach.status === 'Disponible' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                            mach.status === 'En location' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                            'bg-slate-100 border-slate-300 text-slate-700'
                          }`}
                        >
                          <option value="Disponible">🟢 Disponible (Prêt)</option>
                          <option value="En location">🟡 En location (Sur chantier)</option>
                          <option value="En maintenance">⚪ En maintenance</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingMachine(mach);
                            setMachForm({ ...mach });
                            setMachineModalOpen(true);
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteMachine(mach)}
                          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold"
                          title="Supprimer l'engin"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 5. ONGLET : REMPLACEMENT DES IMAGES DU SITE */}
          {activeTab === 'site_images' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-up">
              
              <div>
                <h3 className="text-lg font-extrabold text-[#03300D]">Remplacement des Images & Contenus du Site</h3>
                <p className="text-xs text-slate-500">
                  Modifiez les images affichées sur la Landing Page. Téléversez directement vos propres photos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    key: 'hero_image',
                    title: 'Grande Image Hero (Accueil)',
                    desc: 'Affiche la pelle mécanique ou l\'engin principal du site.',
                    def: 'assets/images/hero_excavator.svg'
                  },
                  {
                    key: 'hero_video_thumb',
                    title: 'Miniature Vidéo / Chantier',
                    desc: 'Bouton de prévisualisation dans la bannière Hero.',
                    def: 'assets/images/hero_thumb.svg'
                  },
                  {
                    key: 'logo_image',
                    title: 'Logo Officiel MAXI PLUS',
                    desc: 'Logo officiel apparaissant dans la navbar et sur les factures.',
                    def: 'assets/images/logo.jpg'
                  },
                  {
                    key: 'service_parts_image',
                    title: 'Image Section Pièces de Rechange',
                    desc: 'Illustration du domaine filtration et pièces mécaniques.',
                    def: 'assets/images/service_parts.svg'
                  },
                  {
                    key: 'service_rental_image',
                    title: 'Image Section Location Matériel',
                    desc: 'Illustration des camions bennes et du parc lourd.',
                    def: 'assets/images/service_rental.svg'
                  },
                  {
                    key: 'mobile_app_image',
                    title: 'Mockup Smartphone WhatsApp',
                    desc: 'Image smartphone montrant la commande WhatsApp.',
                    def: 'assets/images/mobile_mockup.svg'
                  }
                ].map(slot => {
                  const currentImg = siteSettings[slot.key]?.image_url || slot.def;
                  return (
                    <div key={slot.key} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#03300D]">{slot.title}</h4>
                        <p className="text-xs text-slate-500">{slot.desc}</p>
                      </div>

                      <div className="aspect-video bg-[#03300D] rounded-xl overflow-hidden p-3 flex items-center justify-center border border-slate-200">
                        <img 
                          src={`../${currentImg}`} 
                          alt={slot.title} 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = `../${slot.def}`; }}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          Fichier actif : {currentImg}
                        </div>

                        <div className="flex gap-2">
                          <label className="flex-1 py-2.5 px-3 rounded-xl btn-primary-mint text-xs font-bold text-center cursor-pointer shadow-sm">
                            <span>📁 Téléverser une photo locale</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, (uploadedPath) => handleUpdateSiteImage(slot.key, uploadedPath))}
                            />
                          </label>
                        </div>

                        <button 
                          onClick={() => handleUpdateSiteImage(slot.key, slot.def)}
                          className="text-[11px] text-slate-400 hover:text-slate-700 underline block"
                        >
                          Rétablir l'image par défaut
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </main>

      </div>

      {/* MODAL : FACTURE PROFORMA / BON DE COMMANDE IMPRIMABLE */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            
            <div className="p-6 bg-[#03300D] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#81B39D]">BON DE COMMANDE OFFICIEL</span>
                <h3 className="text-lg font-black font-display">{selectedOrder.order_ref}</h3>
                <div className="text-[11px] text-emerald-300 font-mono font-semibold flex items-center gap-1.5 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Validée le {formatDateTime(selectedOrder.created_at).date} à {formatDateTime(selectedOrder.created_at).time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  <span>Imprimer</span>
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div id="printable-invoice" className="p-8 space-y-6 text-xs text-slate-700">
              
              <div className="flex justify-between items-start border-b pb-6">
                <div className="space-y-1">
                  <div className="text-lg font-black text-[#03300D]">MAXI PLUS SARL</div>
                  <div className="text-slate-500">BTP & Maintenance d'engins lourds</div>
                  <div>Angré Djorobité, Garage zone industrielle, Abidjan</div>
                  <div>RCCM: CI-ABJ-03-2018-B13-21394 • NCC: 1843673A</div>
                  <div>Tél: +225 07 09 36 50 23 / 05 12 33 44 55</div>
                </div>

                <div className="text-right space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="font-bold text-slate-500 uppercase text-[10px]">Facturé à :</div>
                  <div className="font-black text-[#03300D] text-sm">{selectedOrder.customer_name}</div>
                  <div>{selectedOrder.customer_phone}</div>
                  <div>{selectedOrder.customer_city}</div>
                  <div className="pt-1.5 text-[10px] text-slate-500 font-mono border-t border-slate-200 mt-1">
                    Date : <strong className="text-slate-800">{formatDateTime(selectedOrder.created_at).date}</strong> à <strong className="text-emerald-700">{formatDateTime(selectedOrder.created_at).time}</strong>
                  </div>
                </div>
              </div>

              <div>
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">Désignation</th>
                      <th className="py-2.5 px-3 text-center">Quantité / Durée</th>
                      <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                      <th className="py-2.5 px-3 text-right">Total FCFA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{it.name}</td>
                        <td className="py-2.5 px-3 text-center">{it.quantity || it.duration || 1}</td>
                        <td className="py-2.5 px-3 text-right">{formatFCFA(it.price || it.rate)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-[#03300D]">{formatFCFA(it.total || ((it.price || it.rate) * (it.quantity || 1)))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Devise :</span>
                    <span className="font-bold">Franc CFA (FCFA)</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#03300D] bg-emerald-50 p-3 rounded-xl">
                    <span>NET À PAYER :</span>
                    <span>{formatFCFA(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold">Notes :</span> {selectedOrder.notes}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* MODAL : AJOUT / ÉDITION PIÈCE */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#03300D]">
                {editingProduct ? 'Modifier la Pièce' : 'Ajouter une Nouvelle Pièce'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom de la pièce *</label>
                <input 
                  type="text" 
                  required 
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="ex: Filtre à Huile SDLG 956L"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#81B39D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Référence SKU *</label>
                  <input 
                    type="text" 
                    required 
                    value={prodForm.ref}
                    onChange={(e) => setProdForm({ ...prodForm, ref: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marque compatible</label>
                  <input 
                    type="text" 
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    placeholder="SDLG / XCMG / LiuGong"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix TTC en Francs CFA (FCFA) *</label>
                  <input 
                    type="number" 
                    required 
                    min="100"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold text-[#03300D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock disponible</label>
                  <input 
                    type="number" 
                    min="0"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                <select 
                  value={prodForm.category_id}
                  onChange={(e) => setProdForm({ ...prodForm, category_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows="2"
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image de la pièce</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 border border-slate-200 flex-shrink-0">
                    <img src={`../${prodForm.image}`} alt="Aperçu" className="w-full h-full object-contain" />
                  </div>
                  <label className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-center cursor-pointer">
                    <span>Choisir une photo locale</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (uploadedUrl) => setProdForm({ ...prodForm, image: uploadedUrl }))}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl btn-primary-mint font-extrabold shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL : AJOUT / ÉDITION ENGIN */}
      {machineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-[#03300D]">
                {editingMachine ? 'Modifier l\'Engin' : 'Ajouter un Engin en Location'}
              </h3>
              <button onClick={() => setMachineModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveMachine} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom de l'engin *</label>
                <input 
                  type="text" 
                  required 
                  value={machForm.name}
                  onChange={(e) => setMachForm({ ...machForm, name: e.target.value })}
                  placeholder="ex: Pelle Hydraulique SDLG E6210F (21 Tonnes)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type d'engin</label>
                  <select 
                    value={machForm.type}
                    onChange={(e) => setMachForm({ ...machForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white"
                  >
                    <option value="Pelle Mécanique">Pelle Mécanique</option>
                    <option value="Chargeuse">Chargeuse sur Pneus</option>
                    <option value="Bulldozer">Bulldozer / Bouteur</option>
                    <option value="Poids Lourd">Camion Benne Poids Lourd</option>
                    <option value="Tracteur Poids Lourd">Tracteur Porte-Engin</option>
                    <option value="Manutention">Chariot Élévateur</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut Initial</label>
                  <select 
                    value={machForm.status}
                    onChange={(e) => setMachForm({ ...machForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none bg-white font-bold"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En location">En location</option>
                    <option value="En maintenance">En maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marque</label>
                  <input 
                    type="text" 
                    value={machForm.brand}
                    onChange={(e) => setMachForm({ ...machForm, brand: e.target.value })}
                    placeholder="SDLG, XCMG, LiuGong..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modèle</label>
                  <input 
                    type="text" 
                    value={machForm.model}
                    onChange={(e) => setMachForm({ ...machForm, model: e.target.value })}
                    placeholder="E6210F, ZL50GN..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Jour en FCFA *</label>
                  <input 
                    type="number" 
                    required 
                    min="1000"
                    value={machForm.price_day}
                    onChange={(e) => setMachForm({ ...machForm, price_day: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold text-[#03300D]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Mois en FCFA *</label>
                  <input 
                    type="number" 
                    required 
                    min="1000"
                    value={machForm.price_month}
                    onChange={(e) => setMachForm({ ...machForm, price_month: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none font-bold text-[#03300D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Spécifications techniques</label>
                <input 
                  type="text" 
                  value={machForm.specs}
                  onChange={(e) => setMachForm({ ...machForm, specs: e.target.value })}
                  placeholder="Poids 21T | Godet 1.0 m³ | Moteur Deutz"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo de l'engin</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-12 rounded-xl bg-[#03300D] p-1 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                    <img src={`../${machForm.image}`} alt="Aperçu" className="w-full h-full object-contain" />
                  </div>
                  <label className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-center cursor-pointer">
                    <span>Choisir une photo locale</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (uploadedUrl) => setMachForm({ ...machForm, image: uploadedUrl }))}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setMachineModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl btn-primary-mint font-extrabold shadow-md"
                >
                  Enregistrer l'Engin
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL POP-UP DE CONFIRMATION DE SUPPRESSION (Composant intégré au site, remplaçant la boîte standard alert/confirm) */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 text-center space-y-5 animate-scale-in">
            
            {/* Icône Danger Rouge */}
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 font-display">
                Confirmer la suppression ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement cet élément ? Cette action est irréversible.
              </p>
            </div>

            {/* Détails du dossier / article */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Référence :</span>
                <span className="font-mono font-black text-[#03300D]">{deleteModal.refText}</span>
              </div>
              {deleteModal.client && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">{deleteModal.type === 'order' ? 'Client :' : 'Désignation :'}</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{deleteModal.client}</span>
                </div>
              )}
              {deleteModal.amount !== undefined && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 font-semibold">Montant :</span>
                  <span className="font-black text-[#03300D]">{formatFCFA(deleteModal.amount)}</span>
                </div>
              )}
            </div>

            {/* Deux boutons en bas : Annuler & Supprimer */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span>Suppression en cours...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

ReactDOM.render(<AdminApp />, document.getElementById('admin-root'));
