// import React, { useState, useEffect } from 'react';
// import {
//   LayoutDashboard,
//   Package,
//   Users,
//   ShoppingBag,
//   Image,
//   LogOut,
//   Menu,
//   X,
//   Plus,
//   Edit,
//   Trash2,
//   Search,
//   Filter,
//   Eye,
//   EyeOff,
//   Save,
//   X as XIcon,
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   ShoppingCart,
//   UserPlus,
//   PackageCheck,
//   Clock,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   ArrowUpRight,
//   ArrowDownRight,
//   Activity,
//   BarChart3,
//   PieChart
// } from 'lucide-react';

// const API_URL = 'http://localhost:5000/api';

// function AdminDashboard() {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [token, setToken] = useState(localStorage.getItem('adminToken'));
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Dashboard stats
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     totalUsers: 0,
//     totalOrders: 0,
//     totalRevenue: 0,
//     pendingOrders: 0,
//     completedOrders: 0,
//     lowStockProducts: 0,
//     todayRevenue: 0,
//     monthlyRevenue: 0,
//     averageOrderValue: 0
//   });

//   // Dashboard data
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [topProducts, setTopProducts] = useState([]);
//   const [orderStatusData, setOrderStatusData] = useState({});
//   const [revenueData, setRevenueData] = useState([]);

//   // Products
//   const [products, setProducts] = useState([]);
//   const [showProductForm, setShowProductForm] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [productForm, setProductForm] = useState({
//     name: '',
//     description: '',
//     price: '',
//     originalPrice: '',
//     image: '',
//     category: 'Jewelry',
//     stock: '',
//     featured: false,
//     status: 'active'
//   });
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   // Users
//   const [users, setUsers] = useState([]);
//   const [showUserForm, setShowUserForm] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [userForm, setUserForm] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     role: 'customer',
//     status: 'active'
//   });

//   // Orders
//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   // Reviews
//   const [reviews, setReviews] = useState([]);
//   const [loadingReviews, setLoadingReviews] = useState(false);

//   // Banners
//   const [banners, setBanners] = useState([]);
//   const [showBannerForm, setShowBannerForm] = useState(false);
//   const [editingBanner, setEditingBanner] = useState(null);
//   const [bannerForm, setBannerForm] = useState({
//     title: '',
//     subtitle: '',
//     image: '',
//     link: '',
//     position: 'hero',
//     active: true
//   });
//   // Allow uploading banner image from device
//   const [bannerImageFile, setBannerImageFile] = useState(null);
//   const [bannerImagePreview, setBannerImagePreview] = useState(null);

//   useEffect(() => {
//     if (token) {
//       fetchUser();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     if (user && user.role === 'admin') {
//       loadDashboardData();
//     }
//   }, [user, activeTab]);

//   const fetchUser = async () => {
//     try {
//       const response = await fetch(`${API_URL}/auth/me`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.ok) {
//         const userData = await response.json();
//         setUser(userData);
//       } else {
//         handleLogout();
//       }
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       handleLogout();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadDashboardData = async () => {
//     try {
//       // Load all dashboard data
//       const [productsRes, usersRes, ordersRes, statsRes, allOrdersRes, allProductsRes] = await Promise.all([
//         fetch(`${API_URL}/products?limit=1`),
//         fetch(`${API_URL}/users?limit=1`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }),
//         fetch(`${API_URL}/orders?limit=1`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }),
//         fetch(`${API_URL}/orders/stats/summary`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }),
//         fetch(`${API_URL}/orders?limit=10`, {
//           headers: { Authorization: `Bearer ${token}` }
//         }),
//         fetch(`${API_URL}/products?limit=100`)
//       ]);

//       const productsData = productsRes.ok ? await productsRes.json() : { total: 0, products: [] };
//       const usersData = usersRes.ok ? await usersRes.json() : { total: 0, users: [] };
//       const ordersData = ordersRes.ok ? await ordersRes.json() : { total: 0, orders: [] };
//       const statsData = statsRes.ok ? await statsRes.json() : { totalRevenue: 0 };
//       const allOrdersData = allOrdersRes.ok ? await allOrdersRes.json() : { orders: [] };
//       const allProductsData = allProductsRes.ok ? await allProductsRes.json() : { products: [] };

//       // Calculate additional stats
//       const allOrders = (allOrdersData.orders || []).sort((a, b) =>
//         new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
//       );
//       const allProducts = allProductsData.products || [];

//       const pendingOrders = allOrders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
//       const completedOrders = allOrders.filter(o => o.orderStatus === 'delivered').length;
//       const lowStockProducts = allProducts.filter(p => p.stock < 10 && p.stock > 0).length;

//       // Calculate revenue data
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//       const todayRevenue = allOrders
//         .filter(o => new Date(o.createdAt) >= today && o.paymentStatus === 'paid')
//         .reduce((sum, o) => sum + (o.total || 0), 0);

//       const monthlyRevenue = allOrders
//         .filter(o => new Date(o.createdAt) >= thisMonth && o.paymentStatus === 'paid')
//         .reduce((sum, o) => sum + (o.total || 0), 0);

//       const paidOrders = allOrders.filter(o => o.paymentStatus === 'paid');
//       const averageOrderValue = paidOrders.length > 0
//         ? paidOrders.reduce((sum, o) => sum + (o.total || 0), 0) / paidOrders.length
//         : 0;

//       // Order status breakdown
//       const statusBreakdown = {
//         pending: allOrders.filter(o => o.orderStatus === 'pending').length,
//         confirmed: allOrders.filter(o => o.orderStatus === 'confirmed').length,
//         processing: allOrders.filter(o => o.orderStatus === 'processing').length,
//         shipped: allOrders.filter(o => o.orderStatus === 'shipped').length,
//         delivered: allOrders.filter(o => o.orderStatus === 'delivered').length,
//         cancelled: allOrders.filter(o => o.orderStatus === 'cancelled').length
//       };

//       // Top products by orders
//       const productOrderCount = {};
//       allOrders.forEach(order => {
//         order.items?.forEach(item => {
//           const productId = item.product?._id || item.product;
//           if (productId) {
//             productOrderCount[productId] = (productOrderCount[productId] || 0) + item.quantity;
//           }
//         });
//       });

//       const topProductsList = Object.entries(productOrderCount)
//         .sort((a, b) => b[1] - a[1])
//         .slice(0, 5)
//         .map(([productId, count]) => {
//           const product = allProducts.find(p => p._id === productId);
//           return product ? { ...product, orderCount: count } : null;
//         })
//         .filter(Boolean);

//       setStats({
//         totalProducts: productsData.total || 0,
//         totalUsers: usersData.total || 0,
//         totalOrders: ordersData.total || 0,
//         totalRevenue: statsData.totalRevenue || 0,
//         pendingOrders,
//         completedOrders,
//         lowStockProducts,
//         todayRevenue,
//         monthlyRevenue,
//         averageOrderValue: Math.round(averageOrderValue)
//       });

//       setRecentOrders(allOrders.slice(0, 5));
//       setTopProducts(topProductsList);
//       setOrderStatusData(statusBreakdown);

//       // Load tab-specific data
//       if (activeTab === 'products') {
//         loadProducts();
//       } else if (activeTab === 'users') {
//         loadUsers();
//       } else if (activeTab === 'orders') {
//         loadOrders();
//       } else if (activeTab === 'banners') {
//         loadBanners();
//       }
//     } catch (error) {
//       console.error('Error loading dashboard data:', error);
//       // Set default values on error
//       setStats({
//         totalProducts: 0,
//         totalUsers: 0,
//         totalOrders: 0,
//         totalRevenue: 0,
//         pendingOrders: 0,
//         completedOrders: 0,
//         lowStockProducts: 0,
//         todayRevenue: 0,
//         monthlyRevenue: 0,
//         averageOrderValue: 0
//       });
//       setRecentOrders([]);
//       setTopProducts([]);
//       setOrderStatusData({});
//     }
//   };

//   const loadProducts = async () => {
//     try {
//       const response = await fetch(`${API_URL}/products`);
//       const data = await response.json();
//       setProducts(data.products || []);
//     } catch (error) {
//       console.error('Error loading products:', error);
//     }
//   };

//   const loadUsers = async () => {
//     try {
//       const response = await fetch(`${API_URL}/users`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await response.json();
//       setUsers(data.users || []);
//     } catch (error) {
//       console.error('Error loading users:', error);
//     }
//   };

//   const loadOrders = async () => {
//     try {
//       const response = await fetch(`${API_URL}/orders`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await response.json();
//       setOrders(data.orders || []);
//     } catch (error) {
//       console.error('Error loading orders:', error);
//     }
//   };

//   const loadBanners = async () => {
//     try {
//       const response = await fetch(`${API_URL}/banners`);
//       if (response.ok) {
//         const data = await response.json();
//         // Handle both array and object with banners property
//         setBanners(Array.isArray(data) ? data : (data.banners || []));
//       } else {
//         setBanners([]);
//       }
//     } catch (error) {
//       console.error('Error loading banners:', error);
//       setBanners([]);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const email = formData.get('email');
//     const password = formData.get('password');

//     try {
//       const response = await fetch(`${API_URL}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         if (data.user && data.user.role === 'admin') {
//           setToken(data.token);
//           localStorage.setItem('adminToken', data.token);
//           setUser(data.user);
//         } else {
//           alert(`Login successful but user is not an admin. Role: ${data.user?.role || 'unknown'}`);
//         }
//       } else {
//         // Show more detailed error message
//         const errorMsg = data.message || 'Invalid credentials or not an admin';
//         alert(`Login failed: ${errorMsg}`);
//         console.error('Login error:', data);
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       alert(`Login failed: ${error.message}. Please check if the backend server is running on ${API_URL}`);
//     }
//   };

//   const handleLogout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('adminToken');
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Banner image change (from device)
//   const handleBannerImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setBannerImageFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => setBannerImagePreview(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   const uploadImage = async (file) => {
//     const formData = new FormData();
//     formData.append('image', file);

//     const response = await fetch(`${API_URL}/upload/image`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`
//       },
//       body: formData
//     });

//     if (!response.ok) {
//       throw new Error('Image upload failed');
//     }

//     const data = await response.json();
//     // Use the API base URL
//     const baseUrl = API_URL.replace('/api', '');
//     return `${baseUrl}${data.url}`;
//   };

//   const handleProductSubmit = async (e) => {
//     e.preventDefault();
//     setUploading(true);
//     try {
//       let imageUrl = productForm.image;

//       // Upload image if file is selected
//       if (imageFile) {
//         imageUrl = await uploadImage(imageFile);
//       }

//       const url = editingProduct
//         ? `${API_URL}/products/${editingProduct._id}`
//         : `${API_URL}/products`;
//       const method = editingProduct ? 'PUT' : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           ...productForm,
//           image: imageUrl,
//           price: parseFloat(productForm.price),
//           originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
//           stock: parseInt(productForm.stock)
//         })
//       });

//       if (response.ok) {
//         setShowProductForm(false);
//         setEditingProduct(null);
//         setImageFile(null);
//         setImagePreview(null);
//         setProductForm({
//           name: '',
//           description: '',
//           price: '',
//           originalPrice: '',
//           image: '',
//           category: 'Jewelry',
//           stock: '',
//           featured: false,
//           status: 'active'
//         });
//         loadProducts();
//         loadDashboardData();
//       }
//     } catch (error) {
//       console.error('Error saving product:', error);
//       alert('Error saving product: ' + error.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleUserSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const url = editingUser
//         ? `${API_URL}/users/${editingUser._id}`
//         : `${API_URL}/users`;
//       const method = editingUser ? 'PUT' : 'POST';

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(userForm)
//       });

//       if (response.ok) {
//         setShowUserForm(false);
//         setEditingUser(null);
//         setUserForm({
//           name: '',
//           email: '',
//           phone: '',
//           password: '',
//           role: 'customer',
//           status: 'active'
//         });
//         loadUsers();
//         loadDashboardData();
//       }
//     } catch (error) {
//       console.error('Error saving user:', error);
//     }
//   };

//   const handleBannerSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const url = editingBanner
//         ? `${API_URL}/banners/${editingBanner._id}`
//         : `${API_URL}/banners`;
//       const method = editingBanner ? 'PUT' : 'POST';

//       // Upload banner image if a file was selected
//       let imageUrl = bannerForm.image;
//       if (bannerImageFile) {
//         imageUrl = await uploadImage(bannerImageFile);
//       }

//       const payload = { ...bannerForm, image: imageUrl };

//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       if (response.ok) {
//         setShowBannerForm(false);
//         setEditingBanner(null);
//         setBannerImageFile(null);
//         setBannerImagePreview(null);
//         setBannerForm({
//           title: '',
//           subtitle: '',
//           image: '',
//           link: '',
//           position: 'hero',
//           active: true
//         });
//         loadBanners();
//       }
//     } catch (error) {
//       console.error('Error saving banner:', error);
//     }
//   };

//   const deleteProduct = async (id) => {
//     if (!confirm('Are you sure you want to delete this product?')) return;
//     try {
//       const response = await fetch(`${API_URL}/products/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.ok) {
//         loadProducts();
//         loadDashboardData();
//       }
//     } catch (error) {
//       console.error('Error deleting product:', error);
//     }
//   };

//   const deleteUser = async (id) => {
//     if (!confirm('Are you sure you want to delete this user?')) return;
//     try {
//       const response = await fetch(`${API_URL}/users/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.ok) {
//         loadUsers();
//         loadDashboardData();
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//     }
//   };

//   const deleteBanner = async (id) => {
//     if (!confirm('Are you sure you want to delete this banner?')) return;
//     try {
//       const response = await fetch(`${API_URL}/banners/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (response.ok) {
//         loadBanners();
//       }
//     } catch (error) {
//       console.error('Error deleting banner:', error);
//     }
//   };

//   const updateOrderStatus = async (orderId, status) => {
//     try {
//       const response = await fetch(`${API_URL}/orders/${orderId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({ orderStatus: status })
//       });
//       if (response.ok) {
//         loadOrders();
//         loadDashboardData();
//       }
//     } catch (error) {
//       console.error('Error updating order:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-stone-50">
//         <div className="text-amber-600 text-xl">Loading...</div>
//       </div>
//     );
//   }

//   if (!token || !user || user.role !== 'admin') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-20" style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           backgroundRepeat: 'repeat'
//         }}></div>
//         <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4 shadow-lg">
//               <LayoutDashboard className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
//             <p className="text-slate-300 text-sm">Enter your credentials to access the dashboard</p>
//           </div>
//           <form onSubmit={handleLogin} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-slate-200 mb-2">Email Address</label>
//               <input
//                 type="email"
//                 name="email"
//                 required
//                 placeholder="admin@dwarika.com"
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
//               <input
//                 type="password"
//                 name="password"
//                 required
//                 placeholder="Enter your password"
//                 className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
//             >
//               Sign In
//             </button>
//           </form>
//           <div className="mt-6 text-center">
//             <p className="text-xs text-slate-400">
//               Dwarika E-commerce Admin Panel
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-stone-50 flex">
//       {/* Sidebar */}
//       <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 fixed h-full shadow-2xl z-50`}>
//         <div className="p-6 flex items-center justify-between border-b border-slate-700">
//           {sidebarOpen && (
//             <div>
//               <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Dwarika Admin</h1>
//               <p className="text-xs text-slate-400 mt-1">Control Panel</p>
//             </div>
//           )}
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
//           >
//             {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
//           </button>
//         </div>
//         <nav className="mt-6 px-3">
//           {[
//             { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-blue-600' },
//             { id: 'products', icon: Package, label: 'Products', color: 'from-purple-500 to-purple-600' },
//             { id: 'users', icon: Users, label: 'Users', color: 'from-green-500 to-green-600' },
//             { id: 'orders', icon: ShoppingBag, label: 'Orders', color: 'from-amber-500 to-amber-600' },
//             { id: 'banners', icon: Image, label: 'Banners', color: 'from-pink-500 to-pink-600' },
//             { id: 'reviews', icon: Users, label: 'Reviews', color: 'from-teal-500 to-teal-600' }
//           ].map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveTab(item.id)}
//               className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
//                 activeTab === item.id
//                   ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
//                   : 'hover:bg-slate-700 text-slate-300'
//               }`}
//             >
//               <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400'} />
//               {sidebarOpen && <span className="font-medium">{item.label}</span>}
//             </button>
//           ))}
//         </nav>
//         <div className="absolute bottom-0 w-full p-4 border-t border-slate-700 bg-slate-800/50">
//           <div className="mb-3 px-4 py-2 bg-slate-700/50 rounded-lg">
//             {sidebarOpen && (
//               <div>
//                 <div className="text-sm font-medium text-white">{user?.name || 'Admin'}</div>
//                 <div className="text-xs text-slate-400">{user?.email || 'admin@dwarika.com'}</div>
//               </div>
//             )}
//           </div>
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 transition rounded-lg text-white font-medium"
//           >
//             <LogOut size={20} />
//             {sidebarOpen && <span>Logout</span>}
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen`}>
//         <div className="p-6 lg:p-8">
//           {/* Dashboard */}
//           {activeTab === 'dashboard' && (
//             <div className="space-y-6">
//               {/* Header */}
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
//                   <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Admin'}!</p>
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//                 </div>
//               </div>

//               {/* Stats Cards */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {/* Total Revenue */}
//                 <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="bg-white/20 p-3 rounded-lg">
//                       <DollarSign className="w-6 h-6" />
//                     </div>
//                     <TrendingUp className="w-5 h-5 opacity-80" />
//                   </div>
//                   <div className="text-amber-100 text-sm font-medium mb-1">Total Revenue</div>
//                   <div className="text-3xl font-bold mb-1">रु{stats.totalRevenue.toLocaleString()}</div>
//                   <div className="text-amber-100 text-xs">All time sales</div>
//                 </div>

//                 {/* Total Orders */}
//                 <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="bg-white/20 p-3 rounded-lg">
//                       <ShoppingCart className="w-6 h-6" />
//                     </div>
//                     <Activity className="w-5 h-5 opacity-80" />
//                   </div>
//                   <div className="text-blue-100 text-sm font-medium mb-1">Total Orders</div>
//                   <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
//                   <div className="text-blue-100 text-xs">{stats.pendingOrders} pending</div>
//                 </div>

//                 {/* Total Products */}
//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="bg-white/20 p-3 rounded-lg">
//                       <Package className="w-6 h-6" />
//                     </div>
//                     {stats.lowStockProducts > 0 ? (
//                       <AlertCircle className="w-5 h-5 opacity-80 text-yellow-200" />
//                     ) : (
//                       <PackageCheck className="w-5 h-5 opacity-80" />
//                     )}
//                   </div>
//                   <div className="text-purple-100 text-sm font-medium mb-1">Total Products</div>
//                   <div className="text-3xl font-bold mb-1">{stats.totalProducts}</div>
//                   <div className="text-purple-100 text-xs">
//                     {stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : 'All in stock'}
//                   </div>
//                 </div>

//                 {/* Total Users */}
//                 <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="bg-white/20 p-3 rounded-lg">
//                       <Users className="w-6 h-6" />
//                     </div>
//                     <UserPlus className="w-5 h-5 opacity-80" />
//                   </div>
//                   <div className="text-green-100 text-sm font-medium mb-1">Total Users</div>
//                   <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
//                   <div className="text-green-100 text-xs">Registered customers</div>
//                 </div>
//               </div>

//               {/* Secondary Stats */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-gray-500 text-sm font-medium mb-1">Today's Revenue</div>
//                       <div className="text-2xl font-bold text-gray-800">रु{stats.todayRevenue.toLocaleString()}</div>
//                     </div>
//                     <div className="bg-green-100 p-3 rounded-lg">
//                       <TrendingUp className="w-5 h-5 text-green-600" />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-gray-500 text-sm font-medium mb-1">Monthly Revenue</div>
//                       <div className="text-2xl font-bold text-gray-800">रु{stats.monthlyRevenue.toLocaleString()}</div>
//                     </div>
//                     <div className="bg-blue-100 p-3 rounded-lg">
//                       <BarChart3 className="w-5 h-5 text-blue-600" />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-gray-500 text-sm font-medium mb-1">Avg Order Value</div>
//                       <div className="text-2xl font-bold text-gray-800">रु{stats.averageOrderValue.toLocaleString()}</div>
//                     </div>
//                     <div className="bg-purple-100 p-3 rounded-lg">
//                       <PieChart className="w-5 h-5 text-purple-600" />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="text-gray-500 text-sm font-medium mb-1">Completed Orders</div>
//                       <div className="text-2xl font-bold text-gray-800">{stats.completedOrders}</div>
//                     </div>
//                     <div className="bg-amber-100 p-3 rounded-lg">
//                       <CheckCircle className="w-5 h-5 text-amber-600" />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Charts and Data */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Order Status Chart */}
//                 <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <BarChart3 className="w-5 h-5 text-amber-600" />
//                     Order Status Breakdown
//                   </h3>
//                   <div className="space-y-4">
//                     {Object.keys(orderStatusData || {}).length > 0 ? (
//                       Object.entries(orderStatusData).map(([status, count]) => {
//                         const total = Object.values(orderStatusData).reduce((a, b) => a + b, 0);
//                         const percentage = total > 0 ? (count / total) * 100 : 0;
//                       const colors = {
//                         pending: 'bg-yellow-500',
//                         confirmed: 'bg-blue-500',
//                         processing: 'bg-purple-500',
//                         shipped: 'bg-indigo-500',
//                         delivered: 'bg-green-500',
//                         cancelled: 'bg-red-500'
//                       };
//                       return (
//                         <div key={status}>
//                           <div className="flex justify-between items-center mb-1">
//                             <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
//                             <span className="text-sm font-bold text-gray-800">{count} ({percentage.toFixed(1)}%)</span>
//                           </div>
//                           <div className="w-full bg-gray-200 rounded-full h-2">
//                             <div
//                               className={`${colors[status] || 'bg-gray-500'} h-2 rounded-full transition-all duration-500`}
//                               style={{ width: `${percentage}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       );
//                     })
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">No order data available</div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Top Products */}
//                 <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                   <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                     <TrendingUp className="w-5 h-5 text-amber-600" />
//                     Top Selling Products
//                   </h3>
//                   <div className="space-y-3">
//                     {topProducts && topProducts.length > 0 ? (
//                       topProducts.map((product, index) => (
//                         <div key={product._id || index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
//                           <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center font-bold text-amber-600">
//                             {index + 1}
//                           </div>
//                           <img src={product.image || 'https://via.placeholder.com/48'} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
//                           <div className="flex-1 min-w-0">
//                             <div className="font-medium text-gray-800 truncate">{product.name || 'Unknown Product'}</div>
//                             <div className="text-sm text-gray-500">{product.orderCount || 0} orders</div>
//                           </div>
//                           <div className="text-right">
//                             <div className="font-bold text-gray-800">रु{(product.price || 0).toLocaleString()}</div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-8 text-gray-500">No product orders yet</div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Recent Orders */}
//               <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                 <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//                   <Clock className="w-5 h-5 text-amber-600" />
//                   Recent Orders
//                 </h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-gray-200">
//                         <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order #</th>
//                         <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
//                         <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
//                         <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
//                         <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {recentOrders && recentOrders.length > 0 ? (
//                         recentOrders.map((order) => {
//                           const statusColors = {
//                             pending: 'bg-yellow-100 text-yellow-800',
//                             confirmed: 'bg-blue-100 text-blue-800',
//                             processing: 'bg-purple-100 text-purple-800',
//                             shipped: 'bg-indigo-100 text-indigo-800',
//                             delivered: 'bg-green-100 text-green-800',
//                             cancelled: 'bg-red-100 text-red-800'
//                           };
//                           return (
//                             <tr key={order._id || Math.random()} className="border-b border-gray-100 hover:bg-gray-50 transition">
//                               <td className="py-3 px-4">
//                                 <span className="font-medium text-gray-800">{order.orderNumber || 'N/A'}</span>
//                               </td>
//                               <td className="py-3 px-4">
//                                 <div className="text-sm text-gray-800">{order.user?.name || 'Guest'}</div>
//                                 <div className="text-xs text-gray-500">{order.user?.email || ''}</div>
//                               </td>
//                               <td className="py-3 px-4">
//                                 <span className="font-semibold text-gray-800">रु{(order.total || 0).toLocaleString()}</span>
//                               </td>
//                               <td className="py-3 px-4">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
//                                   {order.orderStatus || 'pending'}
//                                 </span>
//                               </td>
//                               <td className="py-3 px-4">
//                                 <span className="text-sm text-gray-600">
//                                   {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
//                                 </span>
//                               </td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr>
//                           <td colSpan="5" className="py-8 text-center text-gray-500">No recent orders</td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Products */}
//           {activeTab === 'products' && (
//             <div>
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-3xl font-bold text-amber-800">Products</h2>
//                 <button
//                   onClick={() => {
//                     setShowProductForm(true);
//                     setEditingProduct(null);
//                     setImageFile(null);
//                     setImagePreview(null);
//                     setProductForm({
//                       name: '',
//                       description: '',
//                       price: '',
//                       originalPrice: '',
//                       image: '',
//                       category: 'Jewelry',
//                       stock: '',
//                       featured: false,
//                       status: 'active'
//                     });
//                   }}
//                   className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
//                 >
//                   <Plus size={20} />
//                   Add Product
//                 </button>
//               </div>

//               {showProductForm && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
//                   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
//                     {/* Header */}
//                     <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-white">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="bg-white/20 p-2 rounded-lg">
//                             <Package className="w-6 h-6" />
//                           </div>
//                           <div>
//                             <h3 className="text-2xl font-bold">{editingProduct ? 'Edit' : 'Add New'} Product</h3>
//                             <p className="text-purple-100 text-sm mt-1">Fill in the product details below</p>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => {
//                             setShowProductForm(false);
//                             setImageFile(null);
//                             setImagePreview(null);
//                           }}
//                           className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
//                         >
//                           <XIcon size={24} />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Form Content */}
//                     <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-white">
//                     <form onSubmit={handleProductSubmit} className="space-y-6">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Product Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={productForm.name}
//                           onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
//                           required
//                           placeholder="Enter product name"
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
//                         <textarea
//                           value={productForm.description}
//                           onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
//                           placeholder="Enter product description"
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none"
//                           rows="4"
//                         />
//                       </div>
//                       <div className="grid grid-cols-2 gap-6">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Price (रु) <span className="text-red-500">*</span>
//                           </label>
//                           <div className="relative">
//                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">रु</span>
//                             <input
//                               type="number"
//                               value={productForm.price}
//                               onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
//                               required
//                               placeholder="0.00"
//                               className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
//                             />
//                           </div>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (रु)</label>
//                           <div className="relative">
//                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">रु</span>
//                             <input
//                               type="number"
//                               value={productForm.originalPrice}
//                               onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
//                               placeholder="0.00"
//                               className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
//                         <div className="space-y-4">
//                           {!(imagePreview || productForm.image) ? (
//                             <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-2xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all group">
//                               <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                                 <div className="bg-purple-100 p-4 rounded-full mb-3 group-hover:bg-purple-200 transition">
//                                   <Image className="w-8 h-8 text-purple-600" />
//                                 </div>
//                                 <p className="mb-1 text-sm font-semibold text-gray-700">
//                                   <span className="text-purple-600">Click to upload</span> or drag and drop
//                                 </p>
//                                 <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
//                               </div>
//                               <input
//                                 type="file"
//                                 className="hidden"
//                                 accept="image/*"
//                                 onChange={handleImageChange}
//                               />
//                             </label>
//                           ) : (
//                             <div className="relative group">
//                               <div className="relative overflow-hidden rounded-2xl border-2 border-purple-200">
//                                 <img
//                                   src={imagePreview || productForm.image}
//                                   alt="Preview"
//                                   className="w-full h-64 object-cover"
//                                 />
//                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
//                               </div>
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setImageFile(null);
//                                   setImagePreview(null);
//                                   setProductForm({ ...productForm, image: '' });
//                                 }}
//                                 className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-transform hover:scale-110"
//                               >
//                                 <X size={18} />
//                               </button>
//                             </div>
//                           )}
//                           <div className="relative">
//                             <div className="absolute inset-0 flex items-center">
//                               <div className="w-full border-t border-gray-200"></div>
//                             </div>
//                             <div className="relative flex justify-center text-sm">
//                               <span className="px-4 bg-white text-gray-500">Or enter image URL</span>
//                             </div>
//                           </div>
//                           <input
//                             type="url"
//                             value={productForm.image}
//                             onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
//                             placeholder="https://example.com/image.jpg"
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
//                             disabled={!!imageFile}
//                           />
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-2 gap-6">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
//                           <input
//                             type="text"
//                             value={productForm.category}
//                             onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
//                             placeholder="e.g., Jewelry, Necklace"
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
//                           <input
//                             type="number"
//                             value={productForm.stock}
//                             onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
//                             placeholder="0"
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
//                           />
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-2 gap-6">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
//                           <select
//                             value={productForm.status}
//                             onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
//                           >
//                             <option value="active">Active</option>
//                             <option value="inactive">Inactive</option>
//                             <option value="out_of_stock">Out of Stock</option>
//                           </select>
//                         </div>
//                         <div className="flex items-end">
//                           <label className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border-2 border-purple-200 cursor-pointer hover:bg-purple-100 transition w-full">
//                             <input
//                               type="checkbox"
//                               checked={productForm.featured}
//                               onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
//                               className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
//                             />
//                             <span className="text-sm font-semibold text-gray-700">Featured Product</span>
//                           </label>
//                         </div>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex gap-4 pt-4 border-t border-gray-200">
//                         <button
//                           type="submit"
//                           disabled={uploading}
//                           className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
//                         >
//                           {uploading ? (
//                             <>
//                               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                               Uploading...
//                             </>
//                           ) : (
//                             <>
//                               <Save size={20} />
//                               {editingProduct ? 'Update Product' : 'Create Product'}
//                             </>
//                           )}
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setShowProductForm(false);
//                             setImageFile(null);
//                             setImagePreview(null);
//                           }}
//                           className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </form>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-amber-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left">Image</th>
//                       <th className="px-4 py-3 text-left">Name</th>
//                       <th className="px-4 py-3 text-left">Price</th>
//                       <th className="px-4 py-3 text-left">Stock</th>
//                       <th className="px-4 py-3 text-left">Status</th>
//                       <th className="px-4 py-3 text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {products.map((product) => (
//                       <tr key={product._id} className="border-t">
//                         <td className="px-4 py-3">
//                           <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
//                         </td>
//                         <td className="px-4 py-3 font-medium">{product.name}</td>
//                         <td className="px-4 py-3">रु{product.price?.toLocaleString()}</td>
//                         <td className="px-4 py-3">{product.stock}</td>
//                         <td className="px-4 py-3">
//                           <span className={`px-2 py-1 rounded text-xs ${
//                             product.status === 'active' ? 'bg-green-100 text-green-800' :
//                             product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
//                             'bg-red-100 text-red-800'
//                           }`}>
//                             {product.status}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 setEditingProduct(product);
//                                 setImageFile(null);
//                                 setImagePreview(null);
//                                 setProductForm({
//                                   name: product.name,
//                                   description: product.description || '',
//                                   price: product.price,
//                                   originalPrice: product.originalPrice || '',
//                                   image: product.image || '',
//                                   category: product.category || 'Jewelry',
//                                   stock: product.stock || '',
//                                   featured: product.featured || false,
//                                   status: product.status || 'active'
//                                 });
//                                 setShowProductForm(true);
//                               }}
//                               className="text-amber-600 hover:text-amber-800"
//                             >
//                               <Edit size={18} />
//                             </button>
//                             <button
//                               onClick={() => deleteProduct(product._id)}
//                               className="text-red-600 hover:text-red-800"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Users */}
//           {activeTab === 'users' && (
//             <div>
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-3xl font-bold text-amber-800">Users</h2>
//                 <button
//                   onClick={() => {
//                     setShowUserForm(true);
//                     setEditingUser(null);
//                     setUserForm({
//                       name: '',
//                       email: '',
//                       phone: '',
//                       password: '',
//                       role: 'customer',
//                       status: 'active'
//                     });
//                   }}
//                   className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
//                 >
//                   <Plus size={20} />
//                   Add User
//                 </button>
//               </div>

//               {showUserForm && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
//                   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
//                     {/* Header */}
//                     <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-white">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="bg-white/20 p-2 rounded-lg">
//                             <Users className="w-6 h-6" />
//                           </div>
//                           <div>
//                             <h3 className="text-2xl font-bold">{editingUser ? 'Edit' : 'Add New'} User</h3>
//                             <p className="text-green-100 text-sm mt-1">Manage user account details</p>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => setShowUserForm(false)}
//                           className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
//                         >
//                           <XIcon size={24} />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Form Content */}
//                     <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-white">
//                     <form onSubmit={handleUserSubmit} className="space-y-6">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Full Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={userForm.name}
//                           onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
//                           required
//                           placeholder="Enter full name"
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Email Address <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="email"
//                           value={userForm.email}
//                           onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
//                           required
//                           placeholder="user@example.com"
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
//                         <input
//                           type="tel"
//                           value={userForm.phone}
//                           onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
//                           placeholder="+91 1234567890"
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
//                         />
//                       </div>
//                       {!editingUser && (
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Password <span className="text-red-500">*</span>
//                           </label>
//                           <input
//                             type="password"
//                             value={userForm.password}
//                             onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
//                             required={!editingUser}
//                             placeholder="Enter password"
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
//                           />
//                         </div>
//                       )}
//                       <div className="grid grid-cols-2 gap-6">
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
//                           <select
//                             value={userForm.role}
//                             onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
//                           >
//                             <option value="customer">Customer</option>
//                             <option value="admin">Admin</option>
//                           </select>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
//                           <select
//                             value={userForm.status}
//                             onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
//                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
//                           >
//                             <option value="active">Active</option>
//                             <option value="inactive">Inactive</option>
//                             <option value="suspended">Suspended</option>
//                           </select>
//                         </div>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex gap-4 pt-4 border-t border-gray-200">
//                         <button
//                           type="submit"
//                           className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
//                         >
//                           <Save size={20} />
//                           {editingUser ? 'Update User' : 'Create User'}
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => setShowUserForm(false)}
//                           className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               )}

//               <div className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-amber-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left">Name</th>
//                       <th className="px-4 py-3 text-left">Email</th>
//                       <th className="px-4 py-3 text-left">Phone</th>
//                       <th className="px-4 py-3 text-left">Role</th>
//                       <th className="px-4 py-3 text-left">Status</th>
//                       <th className="px-4 py-3 text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {users.map((user) => (
//                       <tr key={user._id} className="border-t">
//                         <td className="px-4 py-3 font-medium">{user.name}</td>
//                         <td className="px-4 py-3">{user.email}</td>
//                         <td className="px-4 py-3">{user.phone || '-'}</td>
//                         <td className="px-4 py-3">
//                           <span className={`px-2 py-1 rounded text-xs ${
//                             user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
//                           }`}>
//                             {user.role}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`px-2 py-1 rounded text-xs ${
//                             user.status === 'active' ? 'bg-green-100 text-green-800' :
//                             user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
//                             'bg-red-100 text-red-800'
//                           }`}>
//                             {user.status}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 setEditingUser(user);
//                                 setUserForm({
//                                   name: user.name,
//                                   email: user.email,
//                                   phone: user.phone || '',
//                                   password: '',
//                                   role: user.role,
//                                   status: user.status
//                                 });
//                                 setShowUserForm(true);
//                               }}
//                               className="text-amber-600 hover:text-amber-800"
//                             >
//                               <Edit size={18} />
//                             </button>
//                             <button
//                               onClick={() => deleteUser(user._id)}
//                               className="text-red-600 hover:text-red-800"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Orders */}
//           {activeTab === 'orders' && (
//             <div>
//               <h2 className="text-3xl font-bold text-amber-800 mb-6">Orders</h2>
//               <div className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-amber-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left">Order #</th>
//                       <th className="px-4 py-3 text-left">Customer</th>
//                       <th className="px-4 py-3 text-left">Items</th>
//                       <th className="px-4 py-3 text-left">Total</th>
//                       <th className="px-4 py-3 text-left">Status</th>
//                       <th className="px-4 py-3 text-left">Payment</th>
//                       <th className="px-4 py-3 text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {orders.map((order) => (
//                       <tr key={order._id} className="border-t">
//                         <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
//                         <td className="px-4 py-3">
//                           <div>
//                             <div className="font-medium">{order.user?.name || 'Guest'}</div>
//                             <div className="text-sm text-gray-500">{order.user?.email}</div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">{order.items?.length || 0} items</td>
//                         <td className="px-4 py-3 font-medium">रु{order.total?.toLocaleString()}</td>
//                         <td className="px-4 py-3">
//                           <select
//                             value={order.orderStatus}
//                             onChange={(e) => updateOrderStatus(order._id, e.target.value)}
//                             className="px-2 py-1 border rounded text-sm"
//                           >
//                             <option value="pending">Pending</option>
//                             <option value="confirmed">Confirmed</option>
//                             <option value="processing">Processing</option>
//                             <option value="shipped">Shipped</option>
//                             <option value="delivered">Delivered</option>
//                             <option value="cancelled">Cancelled</option>
//                           </select>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`px-2 py-1 rounded text-xs ${
//                             order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
//                             order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                             'bg-red-100 text-red-800'
//                           }`}>
//                             {order.paymentStatus}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <button
//                             onClick={() => setSelectedOrder(order)}
//                             className="text-amber-600 hover:text-amber-800"
//                           >
//                             <Eye size={18} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {selectedOrder && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                   <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="text-xl font-bold">Order Details</h3>
//                       <button onClick={() => setSelectedOrder(null)}><XIcon size={24} /></button>
//                     </div>
//                     <div className="space-y-4">
//                       <div>
//                         <strong>Order Number:</strong> {selectedOrder.orderNumber}
//                       </div>
//                       <div>
//                         <strong>Customer:</strong> {selectedOrder.user?.name} ({selectedOrder.user?.email})
//                       </div>
//                       <div>
//                         <strong>Shipping Address:</strong>
//                         <div className="mt-1 text-sm text-gray-600">
//                           {selectedOrder.shippingAddress?.name}<br />
//                           {selectedOrder.shippingAddress?.street}<br />
//                           {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
//                         </div>
//                       </div>
//                       <div>
//                         <strong>Items:</strong>
//                         <div className="mt-2 space-y-2">
//                           {selectedOrder.items?.map((item, idx) => (
//                             <div key={idx} className="flex justify-between border-b pb-2">
//                               <div>
//                                 <div className="font-medium">{item.name}</div>
//                                 <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
//                               </div>
//                               <div>रु{(item.price * item.quantity).toLocaleString()}</div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                       <div className="flex justify-between font-bold text-lg pt-2">
//                         <span>Total:</span>
//                         <span>रु{selectedOrder.total?.toLocaleString()}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Banners */}
//           {activeTab === 'banners' && (
//             <div>
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-3xl font-bold text-amber-800">Banners</h2>
//                 <button
//                   onClick={() => {
//                     setShowBannerForm(true);
//                     setEditingBanner(null);
//                     setBannerForm({
//                       title: '',
//                       subtitle: '',
//                       image: '',
//                       link: '',
//                       position: 'hero',
//                       active: true
//                     });
//                   }}
//                   className="bg-gradient-to-r from-pink-600 to-pink-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-pink-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
//                 >
//                   <Plus size={20} />
//                   Add Banner
//                 </button>
//               </div>

//               {showBannerForm && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
//                   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
//                     {/* Header */}
//                     <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-8 py-6 text-white">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="bg-white/20 p-2 rounded-lg">
//                             <Image className="w-6 h-6" />
//                           </div>
//                           <div>
//                             <h3 className="text-2xl font-bold">{editingBanner ? 'Edit' : 'Add New'} Banner</h3>
//                             <p className="text-pink-100 text-sm mt-1">Create promotional banners for your store</p>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => setShowBannerForm(false)}
//                           className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
//                         >
//                           <XIcon size={24} />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Form Content */}
//                     <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-white">
//                     <form onSubmit={handleBannerSubmit} className="space-y-6">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Banner Title <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={bannerForm.title}
//                           onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
//                           required
//                           placeholder="Enter banner title"
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
//                         <input
//                           type="text"
//                           value={bannerForm.subtitle}
//                           onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
//                           placeholder="Enter subtitle (optional)"
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Upload Image <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleBannerImageChange}
//                           required={!editingBanner && !bannerForm.image}
//                           className="w-full"
//                         />
//                         {(bannerImagePreview || bannerForm.image) && (
//                           <div className="mt-3 rounded-xl overflow-hidden border-2 border-pink-200">
//                             <img src={bannerImagePreview || bannerForm.image} alt="Banner preview" className="w-full h-40 object-cover" onError={(e) => e.target.style.display = 'none'} />
//                           </div>
//                         )}
//                       </div>
//                       {/* Link URL removed; banners are uploaded from device only */}
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
//                         <select
//                           value={bannerForm.position}
//                           onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
//                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none bg-white"
//                         >
//                           <option value="hero">Hero (Main Banner)</option>
//                           <option value="featured">Featured Section</option>
//                           <option value="sidebar">Sidebar</option>
//                           <option value="footer">Footer</option>
//                         </select>
//                       </div>
//                       <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
//                         <input
//                           type="checkbox"
//                           checked={bannerForm.active}
//                           onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
//                           className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
//                         />
//                         <span className="text-sm font-semibold text-gray-700">Active Banner</span>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex gap-4 pt-4 border-t border-gray-200">
//                         <button
//                           type="submit"
//                           className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-pink-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
//                         >
//                           <Save size={20} />
//                           {editingBanner ? 'Update Banner' : 'Create Banner'}
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => setShowBannerForm(false)}
//                           className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </form>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {banners && banners.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {banners.map((banner) => (
//                     <div key={banner._id || Math.random()} className="bg-white rounded-lg shadow-md overflow-hidden">
//                       <img
//                         src={banner.image || 'https://via.placeholder.com/400x200'}
//                         alt={banner.title || 'Banner'}
//                         className="w-full h-48 object-cover"
//                         onError={(e) => {
//                           e.target.src = 'https://via.placeholder.com/400x200';
//                         }}
//                       />
//                       <div className="p-4">
//                         <div className="font-bold text-lg mb-1">{banner.title || 'Untitled Banner'}</div>
//                         <div className="text-sm text-gray-600 mb-2">{banner.subtitle || ''}</div>
//                         <div className="flex justify-between items-center">
//                           <span className={`px-2 py-1 rounded text-xs ${
//                             banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                           }`}>
//                             {banner.active ? 'Active' : 'Inactive'}
//                           </span>
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => {
//                                 setEditingBanner(banner);
//                                 setBannerForm({
//                                   title: banner.title || '',
//                                   subtitle: banner.subtitle || '',
//                                   image: banner.image || '',
//                                   link: banner.link || '',
//                                   position: banner.position || 'hero',
//                                   active: banner.active !== undefined ? banner.active : true
//                                 });
//                                 setShowBannerForm(true);
//                               }}
//                               className="text-amber-600 hover:text-amber-800"
//                             >
//                               <Edit size={18} />
//                             </button>
//                             <button
//                               onClick={() => deleteBanner(banner._id)}
//                               className="text-red-600 hover:text-red-800"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="bg-white rounded-lg shadow-md p-12 text-center">
//                   <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-700 mb-2">No Banners Found</h3>
//                   <p className="text-gray-500 mb-4">Get started by creating your first banner</p>
//                   <button
//                     onClick={() => {
//                       setShowBannerForm(true);
//                       setEditingBanner(null);
//                       setBannerForm({
//                         title: '',
//                         subtitle: '',
//                         image: '',
//                         link: '',
//                         position: 'hero',
//                         active: true
//                       });
//                     }}
//                     className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 inline-flex items-center gap-2"
//                   >
//                     <Plus size={18} />
//                     Create Banner
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Image,
  LogOut,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X as XIcon,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  UserPlus,
  PackageCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
  Settings,
} from "lucide-react";

const API_URL = "https://dwarika-ecommerce.onrender.com/api";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const path = window.location.pathname || "";
      const parts = path.split("/").filter(Boolean);
      if (parts[0] === "admin" && parts[1]) return parts[1];
      const saved = localStorage.getItem("adminActiveTab");
      if (saved) return saved;
    } catch (e) {
      // ignore
    }
    return "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockProducts: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
  });

  // Dashboard data
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState({});
  const [revenueData, setRevenueData] = useState([]); // unused for now, kept

  // Products
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    category: "Jewelry",
    stock: "",
    featured: false,
    status: "active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Banner image upload state
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
    status: "active",
  });

  // Orders
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Banners
  const [banners, setBanners] = useState([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    position: "hero",
    active: true,
  });

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Initialize activeTab from URL (e.g., /admin/products) so refresh preserves subsection
  useEffect(() => {
    try {
      const path = window.location.pathname || "";
      const parts = path.split("/").filter(Boolean); // ['admin', 'products']
      if (parts[0] === "admin" && parts[1]) {
        setActiveTab(parts[1]);
        // persist chosen tab
        try {
          localStorage.setItem("adminActiveTab", parts[1]);
        } catch (e) {}
      } else {
        // fallback to previously chosen tab stored in localStorage
        try {
          const saved = localStorage.getItem("adminActiveTab");
          if (saved) setActiveTab(saved);
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync activeTab -> URL and persist it so refresh keeps subsection
  useEffect(() => {
    try {
      const expected = `/admin/${activeTab}`;
      if (window.location.pathname !== expected) {
        // Use pushState so navigation is reflected in history
        window.history.pushState({}, document.title, expected);
      }
      try {
        localStorage.setItem("adminActiveTab", activeTab);
      } catch (e) {}
    } catch (e) {
      // ignore
    }
  }, [activeTab]);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadDashboardData();
      // load settings and shipping charge when admin opens dashboard
      loadSettings();
      loadShippingCharge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // Settings (payment methods)
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [shippingCharge, setShippingCharge] = useState({ amount: 500 });

  const loadShippingCharge = async () => {
    try {
      console.log("Loading shipping charge from server...");
      const res = await fetch("/api/settings/shipping-charge");
      console.log("Response status", res.status);
      if (res.ok) {
        const d = await res.json();
        console.log("Loaded shipping charge", d);
        setShippingCharge(d.shippingCharge || { amount: 500 });
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn("Failed to load shipping charge", err);
      }
    } catch (e) {
      console.error("Failed to load shipping charge", e);
    }
  };

  const saveShippingCharge = async () => {
    try {
      console.debug &&
        console.debug("Saving shipping charge to server", shippingCharge);
      const res = await fetch("/api/settings/shipping-charge", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shippingCharge }),
      });
      console.debug && console.debug("Save response status", res.status);
      const respBody = await res.json().catch(() => ({}));
      console.debug && console.debug("Save response body", respBody);
      if (res.ok) {
        alert("Shipping charge saved");
        try {
          localStorage.setItem(
            "shippingCharge",
            JSON.stringify(shippingCharge)
          );
        } catch (e) {}
      } else {
        alert(respBody.message || "Failed to save shipping charge");
      }
    } catch (e) {
      console.error("Save shipping error", e);
      alert("Failed to save shipping charge");
    }
  };

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch(`/api/settings/payment-methods`);
      if (res.ok) {
        const d = await res.json();
        // Filter out UPI/mobile-pay option from admin settings
        setPaymentMethods(
          (d.paymentMethods || []).filter((m) => m.id !== "upi")
        );
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoadingSettings(false);
    }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch(`/api/settings/payment-methods`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethods }),
      });
      if (res.ok) {
        alert("Settings saved");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to save settings");
      }
    } catch (e) {
      console.error("Save settings error", e);
      alert("Failed to save settings");
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [
        productsRes,
        usersRes,
        ordersRes,
        statsRes,
        allOrdersRes,
        allProductsRes,
      ] = await Promise.all([
        fetch(`${API_URL}/products?limit=1`),
        fetch(`${API_URL}/users?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/orders?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/orders/stats/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/orders?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/products?limit=100`),
      ]);

      const productsData = productsRes.ok
        ? await productsRes.json()
        : { total: 0, products: [] };
      const usersData = usersRes.ok
        ? await usersRes.json()
        : { total: 0, users: [] };
      const ordersData = ordersRes.ok
        ? await ordersRes.json()
        : { total: 0, orders: [] };
      const statsData = statsRes.ok
        ? await statsRes.json()
        : { totalRevenue: 0 };
      const allOrdersData = allOrdersRes.ok
        ? await allOrdersRes.json()
        : { orders: [] };
      const allProductsData = allProductsRes.ok
        ? await allProductsRes.json()
        : { products: [] };

      const allOrders = (allOrdersData.orders || []).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      const allProducts = allProductsData.products || [];

      const pendingOrders = allOrders.filter(
        (o) => o.orderStatus === "pending" || o.orderStatus === "processing"
      ).length;
      const completedOrders = allOrders.filter(
        (o) => o.orderStatus === "delivered"
      ).length;
      const lowStockProducts = allProducts.filter(
        (p) => p.stock < 10 && p.stock > 0
      ).length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const todayRevenue = allOrders
        .filter(
          (o) => new Date(o.createdAt) >= today && o.paymentStatus === "paid"
        )
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const monthlyRevenue = allOrders
        .filter(
          (o) =>
            new Date(o.createdAt) >= thisMonth && o.paymentStatus === "paid"
        )
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const paidOrders = allOrders.filter((o) => o.paymentStatus === "paid");
      const averageOrderValue =
        paidOrders.length > 0
          ? paidOrders.reduce((sum, o) => sum + (o.total || 0), 0) /
            paidOrders.length
          : 0;

      // Fetch an accurate status breakdown from the server-side aggregation
      let statusBreakdown = {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };
      try {
        const breakdownRes = await fetch(`${API_URL}/orders/stats/breakdown`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (breakdownRes.ok) {
          const data = await breakdownRes.json();
          statusBreakdown = { ...statusBreakdown, ...data };
        }
      } catch (e) {
        console.error("Failed to fetch order status breakdown:", e);
      }

      const productOrderCount = {};
      allOrders.forEach((order) => {
        order.items?.forEach((item) => {
          const productId = item.product?._id || item.product;
          if (productId) {
            productOrderCount[productId] =
              (productOrderCount[productId] || 0) + item.quantity;
          }
        });
      });

      const topProductsList = Object.entries(productOrderCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productId, count]) => {
          const product = allProducts.find((p) => p._id === productId);
          return product ? { ...product, orderCount: count } : null;
        })
        .filter(Boolean);

      setStats({
        totalProducts: productsData.total || 0,
        totalUsers: usersData.total || 0,
        totalOrders: ordersData.total || 0,
        totalRevenue: statsData.totalRevenue || 0,
        pendingOrders,
        completedOrders,
        lowStockProducts,
        todayRevenue,
        monthlyRevenue,
        averageOrderValue: Math.round(averageOrderValue),
      });

      setRecentOrders(allOrders.slice(0, 5));
      setTopProducts(topProductsList);
      setOrderStatusData(statusBreakdown);

      if (activeTab === "products") {
        loadProducts();
      } else if (activeTab === "users") {
        loadUsers();
      } else if (activeTab === "orders") {
        loadOrders();
      } else if (activeTab === "banners") {
        loadBanners();
      } else if (activeTab === "settings") {
        loadSettings();
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setStats({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        lowStockProducts: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        averageOrderValue: 0,
      });
      setRecentOrders([]);
      setTopProducts([]);
      setOrderStatusData({});
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Print an order by opening a printable window with order details
  const handlePrintOrder = (order) => {
    try {
      const win = window.open("", "_blank");
      if (!win) return alert("Pop-up blocked. Allow pop-ups to print.");

      const itemsHtml = (order.items || [])
        .map(
          (i) => `
          <tr>
            <td style="padding:8px;border:1px solid #ddd">${i.name || ""}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center">${
              i.quantity
            }</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">रु${(
              i.price || 0
            ).toLocaleString()}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">रु${(
              (i.price || 0) * (i.quantity || 1)
            ).toLocaleString()}</td>
          </tr>`
        )
        .join("");

      const html = `
          <html>
            <head>
              <title>Order ${order.orderNumber}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <style>
                body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:20px}
                .header{display:flex;justify-content:space-between;align-items:center}
                table{width:100%;border-collapse:collapse;margin-top:12px}
                th,td{border:1px solid #ddd;padding:8px}
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <h2>Order Details</h2>
                  <div>Order #: ${order.orderNumber}</div>
                  <div>Date: ${new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div style="text-align:right">
                  <h3>Customer</h3>
                  <div>${order.user?.name || ""}</div>
                  <div>${order.user?.email || ""}</div>
                  <div>${order.shippingAddress?.phone || ""}</div>
                </div>
              </div>

              <h4 style="margin-top:18px">Items</h4>
              <table>
                <thead>
                  <tr>
                    <th style="padding:8px;border:1px solid #ddd;text-align:left">Product</th>
                    <th style="padding:8px;border:1px solid #ddd;text-align:center">Qty</th>
                    <th style="padding:8px;border:1px solid #ddd;text-align:right">Price</th>
                    <th style="padding:8px;border:1px solid #ddd;text-align:right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top:18px;text-align:right">
                <div>Subtotal: रु${(order.subtotal || 0).toLocaleString()}</div>
                <div>Shipping: रु${(order.shipping || 0).toLocaleString()}</div>
                <div style="font-weight:700;margin-top:6px">Total: रु${(
                  order.total || 0
                ).toLocaleString()}</div>
              </div>

              <h4 style="margin-top:22px">Shipping Address</h4>
              <div>
  ${order.shippingAddress?.name || ""}<br/>
  ${order.shippingAddress?.phone || ""}<br/>
  ${order.shippingAddress?.street || ""}<br/>
  ${order.shippingAddress?.city || ""} ${
        order.shippingAddress?.zipCode || ""
      }<br/>
  ${order.shippingAddress?.state || ""}, ${order.shippingAddress?.country || ""}
</div>

              <script>
                window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };
              </script>
            </body>
          </html>
        `;

      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (e) {
      console.error("Print error", e);
      alert("Failed to open print window");
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadBanners = async () => {
    try {
      const response = await fetch(`${API_URL}/banners`);
      if (response.ok) {
        const data = await response.json();
        setBanners(Array.isArray(data) ? data : data.banners || []);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error("Error loading banners:", error);
      setBanners([]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user && data.user.role === "admin") {
          setToken(data.token);
          localStorage.setItem("adminToken", data.token);
          setUser(data.user);
        } else {
          alert(
            `Login successful but user is not an admin. Role: ${
              data.user?.role || "unknown"
            }`
          );
        }
      } else {
        const errorMsg = data.message || "Invalid credentials or not an admin";
        alert(`Login failed: ${errorMsg}`);
        console.error("Login error:", data);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        `Login failed: ${error.message}. Please check if the backend server is running on ${API_URL}`
      );
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("adminToken");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Image upload failed");
    }

    const data = await response.json();
    const baseUrl = API_URL.replace("/api", "");
    return `${baseUrl}${data.url}`;
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = productForm.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const url = editingProduct
        ? `${API_URL}/products/${editingProduct._id}`
        : `${API_URL}/products`;
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productForm,
          image: imageUrl,
          price: parseFloat(productForm.price),
          originalPrice: productForm.originalPrice
            ? parseFloat(productForm.originalPrice)
            : undefined,
          stock: parseInt(productForm.stock, 10),
        }),
      });

      if (response.ok) {
        setShowProductForm(false);
        setEditingProduct(null);
        setImageFile(null);
        setImagePreview(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          originalPrice: "",
          image: "",
          category: "Jewelry",
          stock: "",
          featured: false,
          status: "active",
        });
        loadProducts();
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser
        ? `${API_URL}/users/${editingUser._id}`
        : `${API_URL}/users`;
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        setShowUserForm(false);
        setEditingUser(null);
        setUserForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "customer",
          status: "active",
        });
        loadUsers();
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBanner
        ? `${API_URL}/banners/${editingBanner._id}`
        : `${API_URL}/banners`;
      const method = editingBanner ? "PUT" : "POST";

      // Upload banner image if a file was selected
      let imageUrl = bannerForm.image;
      if (bannerImageFile) {
        imageUrl = await uploadImage(bannerImageFile);
      }

      const payload = { ...bannerForm, image: imageUrl };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowBannerForm(false);
        setEditingBanner(null);
        setBannerForm({
          title: "",
          subtitle: "",
          image: "",
          link: "",
          position: "hero",
          active: true,
        });
        setBannerImageFile(null);
        setBannerImagePreview(null);
        loadBanners();
      }
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        loadProducts();
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        loadUsers();
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const deleteBanner = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const response = await fetch(`${API_URL}/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        loadBanners();
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  const deleteOrderAdmin = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        loadOrders();
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: status }),
      });
      if (response.ok) {
        loadOrders();
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-amber-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (!token || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
        <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4 shadow-lg">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
            <p className="text-slate-300 text-sm">
              Enter your credentials to access the dashboard
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@dwarika.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Dwarika E-commerce Admin Panel
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------- AUTHENTICATED ADMIN UI ----------
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 fixed h-full shadow-2xl z-50`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Dwarika Admin
              </h1>
              <p className="text-xs text-slate-400 mt-1">Control Panel</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-3">
          {[
            {
              id: "dashboard",
              icon: LayoutDashboard,
              label: "Dashboard",
              color: "from-blue-500 to-blue-600",
            },
            {
              id: "products",
              icon: Package,
              label: "Products",
              color: "from-purple-500 to-purple-600",
            },
            {
              id: "users",
              icon: Users,
              label: "Users",
              color: "from-green-500 to-green-600",
            },
            {
              id: "orders",
              icon: ShoppingBag,
              label: "Orders",
              color: "from-amber-500 to-amber-600",
            },
            {
              id: "banners",
              icon: Image,
              label: "Banners",
              color: "from-pink-500 to-pink-600",
            },
            {
              id: "settings",
              icon: Settings,
              label: "Settings",
              color: "from-slate-500 to-slate-600",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                  : "hover:bg-slate-700 text-slate-300"
              }`}
            >
              <item.icon
                size={20}
                className={
                  activeTab === item.id ? "text-white" : "text-slate-400"
                }
              />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="mb-3 px-4 py-2 bg-slate-700/50 rounded-lg">
            {sidebarOpen && (
              <div>
                <div className="text-sm font-medium text-white">
                  {user?.name || "Admin"}
                </div>
                <div className="text-xs text-slate-400">
                  {user?.email || "admin@dwarika.com"}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 transition rounded-lg text-white font-medium"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen`}
      >
        <div className="p-6 lg:p-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Dashboard Overview
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Welcome back, {user?.name || "Admin"}!
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <TrendingUp className="w-5 h-5 opacity-80" />
                  </div>
                  <div className="text-amber-100 text-sm font-medium mb-1">
                    Total Revenue
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    रु{stats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-amber-100 text-xs">All time sales</div>
                </div>

                {/* Total Orders */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <Activity className="w-5 h-5 opacity-80" />
                  </div>
                  <div className="text-blue-100 text-sm font-medium mb-1">
                    Total Orders
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {stats.totalOrders}
                  </div>
                  <div className="text-blue-100 text-xs">
                    {stats.pendingOrders} pending
                  </div>
                </div>

                {/* Total Products */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Package className="w-6 h-6" />
                    </div>
                    {stats.lowStockProducts > 0 ? (
                      <AlertCircle className="w-5 h-5 opacity-80 text-yellow-200" />
                    ) : (
                      <PackageCheck className="w-5 h-5 opacity-80" />
                    )}
                  </div>
                  <div className="text-purple-100 text-sm font-medium mb-1">
                    Total Products
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {stats.totalProducts}
                  </div>
                  <div className="text-purple-100 text-xs">
                    {stats.lowStockProducts > 0
                      ? `${stats.lowStockProducts} low stock`
                      : "All in stock"}
                  </div>
                </div>

                {/* Total Users */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Users className="w-6 h-6" />
                    </div>
                    <UserPlus className="w-5 h-5 opacity-80" />
                  </div>
                  <div className="text-green-100 text-sm font-medium mb-1">
                    Total Users
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {stats.totalUsers}
                  </div>
                  <div className="text-green-100 text-xs">
                    Registered customers
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-sm font-medium mb-1">
                        Today's Revenue
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        रु{stats.todayRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-sm font-medium mb-1">
                        Monthly Revenue
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        रु{stats.monthlyRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-sm font-medium mb-1">
                        Avg Order Value
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        रु{stats.averageOrderValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <PieChart className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-sm font-medium mb-1">
                        Completed Orders
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {stats.completedOrders}
                      </div>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                    Order Status Breakdown
                  </h3>

                  <div className="space-y-4">
                    {Object.keys(orderStatusData || {}).length > 0 ? (
                      Object.entries(orderStatusData).map(([status, count]) => {
                        const total = Object.values(orderStatusData).reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage =
                          total > 0 ? (count / total) * 100 : 0;

                        const colors = {
                          pending: "bg-yellow-500",
                          confirmed: "bg-blue-500",
                          processing: "bg-purple-500",
                          shipped: "bg-indigo-500",
                          delivered: "bg-green-500",
                          cancelled: "bg-red-500",
                        };

                        return (
                          <div key={status}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {status}
                              </span>
                              <span className="text-sm font-bold text-gray-800">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`${
                                  colors[status] || "bg-gray-500"
                                } h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No order data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    Top Selling Products
                  </h3>
                  <div className="space-y-3">
                    {topProducts && topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <div
                          key={product._id || index}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center font-bold text-amber-600">
                            {index + 1}
                          </div>
                          <img
                            src={
                              product.image || "https://via.placeholder.com/48"
                            }
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 truncate">
                              {product.name || "Unknown Product"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.orderCount || 0} orders
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800">
                              रु{(product.price || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No product orders yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Recent Orders
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Order #
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders && recentOrders.length > 0 ? (
                        recentOrders.map((order) => {
                          const statusColors = {
                            pending: "bg-yellow-100 text-yellow-800",
                            confirmed: "bg-blue-100 text-blue-800",
                            processing: "bg-purple-100 text-purple-800",
                            shipped: "bg-indigo-100 text-indigo-800",
                            delivered: "bg-green-100 text-green-800",
                            cancelled: "bg-red-100 text-red-800",
                          };
                          return (
                            <tr
                              key={
                                order._id || order.orderNumber || Math.random()
                              }
                              className="border-b border-gray-100 hover:bg-gray-50 transition"
                            >
                              <td className="py-3 px-4">
                                <span className="font-medium text-gray-800">
                                  {order.orderNumber || "N/A"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-gray-800">
                                  {order.user?.name || "Guest"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.user?.email || ""}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-gray-800">
                                  रु{(order.total || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    statusColors[order.orderStatus] ||
                                    "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.orderStatus || "pending"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600">
                                  {order.createdAt
                                    ? new Date(
                                        order.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-8 text-center text-gray-500"
                          >
                            No recent orders
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-amber-800">Products</h2>
                <button
                  onClick={() => {
                    setShowProductForm(true);
                    setEditingProduct(null);
                    setImageFile(null);
                    setImagePreview(null);
                    setProductForm({
                      name: "",
                      description: "",
                      price: "",
                      originalPrice: "",
                      image: "",
                      category: "Jewelry",
                      stock: "",
                      featured: false,
                      status: "active",
                    });
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Plus size={20} />
                  Add Product
                </button>
              </div>

              {showProductForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">
                              {editingProduct ? "Edit" : "Add New"} Product
                            </h3>
                            <p className="text-purple-100 text-sm mt-1">
                              Fill in the product details below
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowProductForm(false);
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        >
                          <XIcon size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-white">
                      <form
                        onSubmit={handleProductSubmit}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Product Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                name: e.target.value,
                              })
                            }
                            required
                            placeholder="Enter product name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={productForm.description}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter product description"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none"
                            rows="4"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Price (रु) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                रु
                              </span>
                              <input
                                type="number"
                                value={productForm.price}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    price: e.target.value,
                                  })
                                }
                                required
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Original Price (रु)
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                रु
                              </span>
                              <input
                                type="number"
                                value={productForm.originalPrice}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    originalPrice: e.target.value,
                                  })
                                }
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Product Image
                          </label>
                          <div className="space-y-4">
                            {!(imagePreview || productForm.image) ? (
                              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-2xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <div className="bg-purple-100 p-4 rounded-full mb-3 group-hover:bg-purple-200 transition">
                                    <Image className="w-8 h-8 text-purple-600" />
                                  </div>
                                  <p className="mb-1 text-sm font-semibold text-gray-700">
                                    <span className="text-purple-600">
                                      Click to upload
                                    </span>{" "}
                                    or drag and drop
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF up to 5MB
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                />
                              </label>
                            ) : (
                              <div className="relative group">
                                <div className="relative overflow-hidden rounded-2xl border-2 border-purple-200">
                                  <img
                                    src={imagePreview || productForm.image}
                                    alt="Preview"
                                    className="w-full h-64 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImageFile(null);
                                    setImagePreview(null);
                                    setProductForm({
                                      ...productForm,
                                      image: "",
                                    });
                                  }}
                                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-transform hover:scale-110"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            )}

                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                              </div>
                              <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">
                                  Or enter image URL
                                </span>
                              </div>
                            </div>

                            <input
                              type="url"
                              value={productForm.image}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  image: e.target.value,
                                })
                              }
                              placeholder="https://example.com/image.jpg"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                              disabled={!!imageFile}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Category
                            </label>
                            <input
                              type="text"
                              value={productForm.category}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  category: e.target.value,
                                })
                              }
                              placeholder="e.g., Jewelry, Necklace"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              value={productForm.stock}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  stock: e.target.value,
                                })
                              }
                              placeholder="0"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={productForm.status}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  status: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="out_of_stock">Out of Stock</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border-2 border-purple-200 cursor-pointer hover:bg-purple-100 transition w-full">
                              <input
                                type="checkbox"
                                checked={productForm.featured}
                                onChange={(e) =>
                                  setProductForm({
                                    ...productForm,
                                    featured: e.target.checked,
                                  })
                                }
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                Featured Product
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-200">
                          <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                          >
                            {uploading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Save size={20} />
                                {editingProduct
                                  ? "Update Product"
                                  : "Create Product"}
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowProductForm(false);
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Image</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Price</th>
                      <th className="px-4 py-3 text-left">Stock</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">View</th>
                      <th className="px-4 py-3 text-left">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-t">
                        <td className="px-4 py-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {product.name}
                        </td>
                        <td className="px-4 py-3">
                          रु{product.price?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{product.stock}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              product.status === "active"
                                ? "bg-green-100 text-green-800"
                                : product.status === "inactive"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setImageFile(null);
                                setImagePreview(null);
                                setProductForm({
                                  name: product.name,
                                  description: product.description || "",
                                  price: product.price,
                                  originalPrice: product.originalPrice || "",
                                  image: product.image || "",
                                  category: product.category || "Jewelry",
                                  stock: product.stock || "",
                                  featured: product.featured || false,
                                  status: product.status || "active",
                                });
                                setShowProductForm(true);
                              }}
                              className="text-amber-600 hover:text-amber-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-amber-800">Users</h2>
                <button
                  onClick={() => {
                    setShowUserForm(true);
                    setEditingUser(null);
                    setUserForm({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      role: "customer",
                      status: "active",
                    });
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Plus size={20} />
                  Add User
                </button>
              </div>

              {showUserForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">
                              {editingUser ? "Edit" : "Add New"} User
                            </h3>
                            <p className="text-green-100 text-sm mt-1">
                              Manage user account details
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowUserForm(false)}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        >
                          <XIcon size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-white">
                      <form onSubmit={handleUserSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={userForm.name}
                            onChange={(e) =>
                              setUserForm({ ...userForm, name: e.target.value })
                            }
                            required
                            placeholder="Enter full name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={userForm.email}
                            onChange={(e) =>
                              setUserForm({
                                ...userForm,
                                email: e.target.value,
                              })
                            }
                            required
                            placeholder="user@example.com"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={userForm.phone}
                            onChange={(e) =>
                              setUserForm({
                                ...userForm,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+91 1234567890"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          />
                        </div>

                        {!editingUser && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              value={userForm.password}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  password: e.target.value,
                                })
                              }
                              required
                              placeholder="Enter password"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Role
                            </label>
                            <select
                              value={userForm.role}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  role: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
                            >
                              <option value="customer">Customer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={userForm.status}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  status: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="suspended">Suspended</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-200">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                          >
                            <Save size={20} />
                            {editingUser ? "Update User" : "Create User"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowUserForm(false)}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-t">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.phone || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              u.status === "active"
                                ? "bg-green-100 text-green-800"
                                : u.status === "inactive"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserForm({
                                  name: u.name,
                                  email: u.email,
                                  phone: u.phone || "",
                                  password: "",
                                  role: u.role,
                                  status: u.status,
                                });
                                setShowUserForm(true);
                              }}
                              className="text-amber-600 hover:text-amber-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteUser(u._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-3xl font-bold text-amber-800 mb-6">Orders</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Order #</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Items</th>
                      <th className="px-4 py-3 text-left">Total</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Payment</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-t">
                        <td className="px-4 py-3 font-medium">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">
                              {order.user?.name || "Guest"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-4 py-3 font-medium">
                          रु{order.total?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              updateOrderStatus(order._id, e.target.value)
                            }
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              order.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : order.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-amber-600 hover:text-amber-800 mr-1"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteOrderAdmin(order._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Order Details</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintOrder(selectedOrder)}
                          className="px-3 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200"
                        >
                          Print
                        </button>
                        <button onClick={() => setSelectedOrder(null)}>
                          <XIcon size={24} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <strong>Order Number:</strong>{" "}
                        {selectedOrder.orderNumber}
                      </div>
                      <div>
                        <strong>Customer:</strong> {selectedOrder.user?.name} (
                        {selectedOrder.user?.email})
                      </div>
                      <div>
                        <strong>Shipping Address:</strong>
                        <div className="mt-1 text-sm text-gray-600">
                          {selectedOrder.shippingAddress?.name}
                          <br />
                          {selectedOrder.shippingAddress?.street}
                          <br />
                          {selectedOrder.shippingAddress?.city},{" "}
                          {selectedOrder.shippingAddress?.state}{" "}
                          {selectedOrder.shippingAddress?.zipCode}
                        </div>
                      </div>
                      <div>
                        <strong>Items:</strong>
                        <div className="mt-2 space-y-2">
                          {selectedOrder.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between border-b pb-2"
                            >
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">
                                  Qty: {item.quantity}
                                </div>
                              </div>
                              <div>
                                रु
                                {(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total:</span>
                        <span>रु{selectedOrder.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Banners */}
          {activeTab === "banners" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-amber-800">Banners</h2>
                <button
                  onClick={() => {
                    setShowBannerForm(true);
                    setEditingBanner(null);
                    setBannerForm({
                      title: "",
                      subtitle: "",
                      image: "",
                      link: "",
                      position: "hero",
                      active: true,
                    });
                  }}
                  className="bg-gradient-to-r from-pink-600 to-pink-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-pink-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Plus size={20} />
                  Add Banner
                </button>
              </div>

              {showBannerForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                    <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-8 py-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Image className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">
                              {editingBanner ? "Edit" : "Add New"} Banner
                            </h3>
                            <p className="text-pink-100 text-sm mt-1">
                              Create promotional banners for your store
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowBannerForm(false)}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        >
                          <XIcon size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-white">
                      <form onSubmit={handleBannerSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Banner Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={bannerForm.title}
                            onChange={(e) =>
                              setBannerForm({
                                ...bannerForm,
                                title: e.target.value,
                              })
                            }
                            required
                            placeholder="Enter banner title"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={bannerForm.subtitle}
                            onChange={(e) =>
                              setBannerForm({
                                ...bannerForm,
                                subtitle: e.target.value,
                              })
                            }
                            placeholder="Enter subtitle (optional)"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                          />
                        </div>

                        {/* Banner Image upload (from device) */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Banner Image <span className="text-red-500">*</span>
                          </label>
                          {!(bannerImagePreview || bannerForm.image) ? (
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-pink-300 rounded-2xl cursor-pointer bg-gradient-to-br from-pink-50 to-white hover:from-pink-100 transition-all group">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="bg-pink-100 p-4 rounded-full mb-3 group-hover:bg-pink-200 transition">
                                  <Image className="w-8 h-8 text-pink-600" />
                                </div>
                                <p className="mb-1 text-sm font-semibold text-gray-700">
                                  <span className="text-pink-600">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG up to 5MB
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleBannerImageChange}
                              />
                            </label>
                          ) : (
                            <div className="relative group">
                              <div className="relative overflow-hidden rounded-2xl border-2 border-pink-200">
                                <img
                                  src={bannerImagePreview || bannerForm.image}
                                  alt="Banner preview"
                                  className="w-full h-40 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setBannerImageFile(null);
                                  setBannerImagePreview(null);
                                  setBannerForm({ ...bannerForm, image: "" });
                                }}
                                className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-transform hover:scale-110"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Link URL removed; banners are uploaded from device only */}

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Position
                          </label>
                          <select
                            value={bannerForm.position}
                            onChange={(e) =>
                              setBannerForm({
                                ...bannerForm,
                                position: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none bg-white"
                          >
                            <option value="hero">Hero (Main Banner)</option>
                            <option value="featured">Featured Section</option>
                            <option value="sidebar">Sidebar</option>
                            <option value="footer">Footer</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
                          <input
                            type="checkbox"
                            checked={bannerForm.active}
                            onChange={(e) =>
                              setBannerForm({
                                ...bannerForm,
                                active: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Active Banner
                          </span>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-200">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-pink-600 to-pink-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-pink-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                          >
                            <Save size={20} />
                            {editingBanner ? "Update Banner" : "Create Banner"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowBannerForm(false)}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {banners && banners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {banners.map((banner) => (
                    <div
                      key={banner._id || Math.random()}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <img
                        src={
                          banner.image || "https://via.placeholder.com/400x200"
                        }
                        alt={banner.title || "Banner"}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/400x200";
                        }}
                      />
                      <div className="p-4">
                        <div className="font-bold text-lg mb-1">
                          {banner.title || "Untitled Banner"}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {banner.subtitle || ""}
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              banner.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {banner.active ? "Active" : "Inactive"}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingBanner(banner);
                                setBannerForm({
                                  title: banner.title || "",
                                  subtitle: banner.subtitle || "",
                                  image: banner.image || "",
                                  link: banner.link || "",
                                  position: banner.position || "hero",
                                  active:
                                    banner.active !== undefined
                                      ? banner.active
                                      : true,
                                });
                                setShowBannerForm(true);
                              }}
                              className="text-amber-600 hover:text-amber-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteBanner(banner._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Banners Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first banner
                  </p>
                  <button
                    onClick={() => {
                      setShowBannerForm(true);
                      setEditingBanner(null);
                      setBannerForm({
                        title: "",
                        subtitle: "",
                        image: "",
                        link: "",
                        position: "hero",
                        active: true,
                      });
                    }}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Create Banner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Payment Methods</h3>
                    <p className="text-sm text-gray-500">
                      Enable or disable the payment options shown to customers.
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    Last saved:{" "}
                    <span className="font-medium text-gray-700">just now</span>
                  </div>
                </div>

                {loadingSettings ? (
                  <div className="py-8 text-center text-gray-500">
                    Loading settings…
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((m, idx) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-semibold">
                            {m.id === "cash_on_delivery"
                              ? "COD"
                              : m.id === "card"
                              ? "CARD"
                              : m.id === "khalti"
                              ? "KHL"
                              : m.id.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {m.label}
                            </div>
                            <div className="text-sm text-gray-500">{m.id}</div>
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              const next = [...paymentMethods];
                              next[idx] = { ...m, enabled: !m.enabled };
                              setPaymentMethods(next);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              m.enabled ? "bg-amber-600" : "bg-gray-200"
                            }`}
                            aria-pressed={m.enabled}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                m.enabled ? "translate-x-5" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={loadSettings}
                    className="px-4 py-2 bg-white border rounded text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={saveSettings}
                    className="px-4 py-2 bg-amber-600 text-white rounded shadow hover:brightness-95 inline-flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Settings
                  </button>
                </div>

                {/* Shipping Charge Section */}
                <div className="mt-8 bg-gray-50 p-4 rounded-lg border">
                  <h4 className="text-lg font-medium mb-2">Shipping Charge</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Set a flat shipping fee (in NPR) applied to orders.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      value={shippingCharge.amount ?? ""}
                      onChange={(e) =>
                        setShippingCharge({ amount: Number(e.target.value) })
                      }
                      type="number"
                      min="0"
                      className="w-40 p-2 rounded border"
                    />
                    <button
                      onClick={saveShippingCharge}
                      className="px-4 py-2 bg-amber-600 text-white rounded"
                    >
                      Save Shipping
                    </button>
                    <button
                      onClick={loadShippingCharge}
                      className="px-3 py-2 bg-white border rounded text-gray-700"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
