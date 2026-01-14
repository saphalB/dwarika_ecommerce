import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Star,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Heart,
  ArrowRight,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Wallet,
} from "lucide-react";
import {
  fetchProducts,
  fetchBanners,
  fetchShippingCharge,
  createOrder,
  registerUser,
  loginUser,
  getCurrentUser,
  fetchMyOrders,
  fetchOrderDetail,
  updateOrder,
  deleteOrder,
  updateProfile,
  verifyEmail,
  setPassword,
  forgotPassword,
} from "./utils/api.js";
/* AnimatedTitle intentionally removed to simplify header and reduce bundle size */

const testimonials = [
  {
    name: "Priya Sharma",
    text: "Absolutely love my bridal jewelry from Dwarika! The craftsmanship is exquisite.",
    rating: 5,
  },
  {
    name: "Rajesh Patel",
    text: "Best gold shop in town. Authentic products and great customer service.",
    rating: 5,
  },
  {
    name: "Anita Rai",
    text: "Bought a beautiful necklace set for my daughter's wedding. Highly recommend!",
    rating: 5,
  },
];

function App() {
  const darkMode = false;
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const path = window.location.pathname || "/";
      if (!path || path === "/") return "home";
      if (path.startsWith("/products")) return "products";
      if (path.startsWith("/cart")) return "cart";
      if (path.startsWith("/checkout")) return "checkout";
      if (path.startsWith("/payment")) return "payment";
      if (path.startsWith("/order-success")) return "orderSuccess";
      if (path.startsWith("/profile")) return "profile";
      if (path.startsWith("/my-orders")) return "myOrders";
      if (path.startsWith("/order")) return "orderDetail";
      if (path.startsWith("/about")) return "about";
      if (path.startsWith("/contact")) return "contact";
      if (path.startsWith("/search")) return "search";
      if (path.startsWith("/login")) return "login";
      if (path.startsWith("/register-success")) return "registerSuccess";
      if (path.startsWith("/register")) return "register";
      if (path.startsWith("/verify")) return "verify";
      if (path.startsWith("/set-password")) return "setPassword";
      if (path.startsWith("/admin")) return "admin";
      return "home";
    } catch (e) {
      return "home";
    }
  });
  const [searchQuery, setSearchQuery] = useState(""); // Committed search term
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  });

  // Cart items: [{product, quantity}, ...]
  const [selectedProduct, setSelectedProduct] = useState(null); // For product detail view
  const [showProductDetail, setShowProductDetail] = useState(false); // Toggle product detail modal
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState(null); // Store shipping info from checkout
  const [lastOrder, setLastOrder] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(null); // loaded from server
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const apiOrigin = (
    import.meta.env.VITE_API_URL || "https://dwarika-ecommerce.onrender.com"
  ).replace(/\/api$/, "");
  const resolveAvatarSrc = (avatar) => {
    if (!avatar) return null;
    if (
      typeof avatar === "string" &&
      (avatar.startsWith("data:") || avatar.startsWith("http"))
    )
      return avatar;
    // server returns paths like /uploads/filename
    return apiOrigin + avatar;
  };
  const generateAvatarDataUrl = (name) => {
    const initials =
      (name || "U")
        .split(" ")
        .map((n) => n[0] || "")
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";
    let hash = 0;
    for (let i = 0; i < initials.length; i++)
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    const bg = `hsl(${hue} 70% 70%)`;
    const fg = "#1f2937";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dy='.08em' text-anchor='middle' font-family='Inter, Roboto, Arial' font-size='48' fill='${fg}' font-weight='700'>${initials}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };
  // Load shipping charge from server (admin configurable)

  const [user, setUser] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [postLoginRedirect, setPostLoginRedirect] = useState(null);
  const [verifyToken, setVerifyToken] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [setPasswordToken, setSetPasswordToken] = useState(null);
  const [setPasswordStatus, setSetPasswordStatus] = useState(null);
  const [registerMessage, setRegisterMessage] = useState(null);
  // Sync currentPage with URL so refresh keeps the same page
  const pageToPath = (page) => {
    const map = {
      home: "/",
      products: "/products",
      cart: "/cart",
      checkout: "/checkout",
      payment: "/payment",
      orderSuccess: "/order-success",
      profile: "/profile",
      myOrders: "/my-orders",
      orderDetail: "/order",
      about: "/about",
      contact: "/contact",
      search: "/search",
      login: "/login",
      register: "/register",
      registerSuccess: "/register-success",
      verify: "/verify",
      setPassword: "/set-password",
      forgotPassword: "/forgot-password",
      admin: "/admin",
    };
    return map[page] || "/";
  };

  const pathToPage = (path) => {
    if (!path || path === "/") return "home";
    if (path.startsWith("/products")) return "products";
    if (path.startsWith("/cart")) return "cart";
    if (path.startsWith("/checkout")) return "checkout";
    if (path.startsWith("/payment")) return "payment";
    if (path.startsWith("/order-success")) return "orderSuccess";
    if (path.startsWith("/profile")) return "profile";
    if (path.startsWith("/my-orders")) return "myOrders";
    if (path.startsWith("/order")) return "orderDetail";
    if (path.startsWith("/about")) return "about";
    if (path.startsWith("/contact")) return "contact";
    if (path.startsWith("/search")) return "search";
    if (path.startsWith("/login")) return "login";
    if (path.startsWith("/register-success")) return "registerSuccess";
    if (path.startsWith("/register")) return "register";
    if (path.startsWith("/verify")) return "verify";
    if (path.startsWith("/set-password")) return "setPassword";
    if (path.startsWith("/forgot-password")) return "forgotPassword";
    if (path.startsWith("/admin")) return "admin";
    return "home";
  };

  // Helper to determine current shipping amount (server state -> localStorage -> fallback)
  const getCurrentShippingAmount = () => {
    if (shippingCharge && typeof shippingCharge.amount === "number")
      return shippingCharge.amount;
    try {
      const local = localStorage.getItem("shippingCharge");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed.amount === "number") return parsed.amount;
      }
    } catch (e) {}
    return 500;
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!token) return;
      try {
        const me = await getCurrentUser();
        if (me) setUser({ ...me, avatar: resolveAvatarSrc(me.avatar || null) });
        else {
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        localStorage.removeItem("token");
        setToken(null);
      }
    };
    loadUser();
  }, [token]);

  // Detect frontend verify route like /verify?token=... and handle it
  useEffect(() => {
    try {
      const path = window.location.pathname || "";
      // prefer token in URL hash (safer), fallback to query
      let t = null;
      const hash = (window.location.hash || "").toString();
      if (hash.startsWith("#")) {
        const hashParams = new URLSearchParams(hash.slice(1));
        t = hashParams.get("token");
      }
      if (!t) {
        const params = new URLSearchParams(window.location.search || "");
        t = params.get("token");
      }
      if (t) {
        // If path is /verify or /set-password handle appropriately
        if (path === "/verify") {
          setVerifyToken(t);
          setCurrentPage("verify");
          const cleanPath = window.location.pathname || "/";
          window.history.replaceState({}, document.title, cleanPath);
        } else if (path === "/set-password") {
          setSetPasswordToken(t);
          setCurrentPage("setPassword");
          const cleanPath = window.location.pathname || "/";
          window.history.replaceState({}, document.title, cleanPath);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Initialize currentPage from the URL path on first load
  useEffect(() => {
    try {
      const path = window.location.pathname || "/";
      const page = pathToPage(path);
      setCurrentPage(page);
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click-away handler to close user menu
  const userMenuRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!isUserMenuOpen) return;
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isUserMenuOpen]);

  const handleLogin = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      if (res?.token) {
        localStorage.setItem("token", res.token);
        setToken(res.token);
        setUser(
          res.user
            ? { ...res.user, avatar: resolveAvatarSrc(res.user.avatar || null) }
            : null
        );
        setCurrentPage("home");
        if (postLoginRedirect) {
          setCurrentPage(postLoginRedirect);
          setPostLoginRedirect(null);
        }
      }
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submit = async (e) => {
      e.preventDefault();
      await handleLogin(email, password);
    };

    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-sm mt-1 opacity-90">
              Login to continue shopping
            </p>
          </div>
          <div className={`p-6 ${darkMode ? "bg-amber-900" : "bg-white"}`}>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label
                  className={`block mb-1 ${
                    darkMode ? "text-amber-200" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded border"
                />
              </div>
              <div>
                <label
                  className={`block mb-1 ${
                    darkMode ? "text-amber-200" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded border"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white shadow"
                >
                  Login
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentPage("register")}
                    className="text-sm text-amber-600"
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("forgotPassword")}
                    className="text-sm text-gray-500"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const VerifyPage = ({ token }) => {
    useEffect(() => {
      let mounted = true;
      const run = async () => {
        try {
          setVerifyStatus("loading");

          // If token looks like a JWT (has 2 dots), treat it as already-issued JWT and log user in
          if (typeof token === "string" && token.split(".").length === 3) {
            localStorage.setItem("token", token);
            setToken(token);
            // refresh current user
            try {
              const me = await getCurrentUser();
              if (mounted)
                setUser({
                  ...me,
                  avatar: resolveAvatarSrc(me?.avatar || null),
                });
            } catch (e) {
              // ignore
            }
            if (!mounted) return;
            setVerifyStatus("success");
            return;
          }

          // Otherwise token is the DB verification token; call backend to verify and receive JWT
          const res = await verifyEmail(token);
          if (!mounted) return;
          if (res?.token) {
            localStorage.setItem("token", res.token);
            setToken(res.token);
            setUser(
              res.user
                ? {
                    ...res.user,
                    avatar: resolveAvatarSrc(res.user.avatar || null),
                  }
                : null
            );
          }
          setVerifyStatus("success");
        } catch (err) {
          if (!mounted) return;
          setVerifyStatus({
            error: true,
            message: err.message || "Verification failed",
          });
        }
      };
      run();
      return () => {
        mounted = false;
      };
    }, [token]);

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-amber-900" : "bg-stone-100"
        } py-20`}
      >
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
          {verifyStatus === "loading" && <p>Verifying your email…</p>}
          {verifyStatus === "success" && (
            <div>
              <h2 className="text-2xl font-bold">Email verified</h2>
              <p className="mt-2">
                Your email address has been verified. You can now login.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setCurrentPage("login")}
                  className="px-4 py-2 rounded bg-amber-600 text-white"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
          {verifyStatus && verifyStatus.error && (
            <div>
              <h2 className="text-2xl font-bold">Verification failed</h2>
              <p className="mt-2 text-red-600">
                {verifyStatus.message || "Token invalid or expired."}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setCurrentPage("register")}
                  className="px-4 py-2 rounded bg-amber-600 text-white"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(null);

    const submit = async (e) => {
      e.preventDefault();
      try {
        setStatus("loading");
        const res = await forgotPassword(email);
        setStatus({ success: true, message: res.message || "Reset link sent" });
      } catch (err) {
        setStatus({
          error: true,
          message: err.message || "Failed to send reset link",
        });
      }
    };

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-stone-100"
        } py-20`}
      >
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white">
            <h2 className="text-2xl font-bold">Reset password</h2>
            <p className="text-sm mt-1 opacity-90">
              Enter your registered email to receive a reset link
            </p>
          </div>
          <div className={`p-6 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
            {status?.success ? (
              <div>
                <h3 className="text-lg font-bold text-green-600">
                  Check your email
                </h3>
                <p className="mt-2 text-sm">
                  We have sent a link to reset your password if the email is
                  registered.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setCurrentPage("login")}
                    className="px-4 py-2 rounded bg-amber-600 text-white"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label
                    className={`block mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded border"
                  />
                </div>
                {status?.error && (
                  <div className="text-sm text-red-600">{status.message}</div>
                )}
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white shadow"
                  >
                    Send reset link
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("login")}
                    className="text-sm text-amber-600"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SetPasswordPage = ({ token }) => {
    const [password, setPasswordInput] = useState("");
    useEffect(() => {
      setSetPasswordStatus(null);
    }, [token]);

    const submit = async (e) => {
      e.preventDefault();
      try {
        setSetPasswordStatus("loading");
        const res = await setPassword(token, password);
        // Do not auto-login after setting password; prompt user to log in
        setSetPasswordStatus("success");
        setCurrentPage("login");
      } catch (err) {
        setSetPasswordStatus({ error: true, message: err.message || "Failed" });
      }
    };

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-stone-100"
        } py-20`}
      >
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
          <h2 className="text-2xl font-bold">Set your password</h2>
          {setPasswordStatus === "loading" && <p>Saving password…</p>}
          {setPasswordStatus === "success" && (
            <div>
              <p className="mt-2">Password set — please log in to continue.</p>
              <div className="mt-4">
                <button
                  onClick={() => setCurrentPage("login")}
                  className="px-4 py-2 rounded bg-amber-600 text-white"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
          {setPasswordStatus && setPasswordStatus.error && (
            <div>
              <p className="mt-2 text-red-600">{setPasswordStatus.message}</p>
            </div>
          )}
          {!setPasswordStatus && (
            <form onSubmit={submit} className="space-y-4 mt-4">
              <div>
                <label className="block mb-1 text-gray-700">New password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full p-3 rounded border"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white shadow"
                >
                  Set password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const submit = async (e) => {
      e.preventDefault();
      await handleRegister(name, email, null, phone);
    };

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-stone-100"
        } py-20`}
      >
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-sm mt-1 opacity-90">
              Join Dwarika to save orders and checkout faster
            </p>
          </div>
          <div className={`p-6 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label
                  className={`block mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded border"
                />
              </div>
              <div>
                <label
                  className={`block mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded border"
                />
              </div>
              <div>
                <label
                  className={`block mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded border"
                />
              </div>
              <div className="text-sm text-gray-600">
                A link to set your password will be sent to your email.
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white shadow"
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage("login")}
                  className="text-sm text-amber-600"
                >
                  Already have an account?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  const handleRegister = async (name, email, password, phone) => {
    try {
      const res = await registerUser({ name, email, phone });
      // Show a full-screen message after registration instead of a popup
      setRegisterMessage(
        res.message ||
          "Registered. Please check your email for the link to set your password."
      );
      setCurrentPage("registerSuccess");
    } catch (err) {
      const msg = err.message || "Registration failed";
      // If the account already exists, show the same friendly message and prompt to check email
      if (
        msg.toLowerCase().includes("user already exists") ||
        msg.toLowerCase().includes("already exists")
      ) {
        setRegisterMessage(
          "Account created. Please check your email for verification and to set your password."
        );
      } else {
        setRegisterMessage(msg);
      }
      setCurrentPage("registerSuccess");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCurrentPage("home");
  };

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await fetchProducts({ status: "active" });
        // Convert API products to match frontend format
        const formattedProducts = allProducts.map((p) => ({
          id: p._id,
          _id: p._id,
          name: p.name,
          price: p.price,
          rating: p.rating || 0,
          image: p.image || "https://via.placeholder.com/400",
          description: p.description,
          stock: p.stock,
          featured: p.featured,
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
        // Fallback to empty array if API fails
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const topRatedProducts = products.filter((p) => p.featured).slice(0, 3);

  const getFilteredProducts = () => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Cart Management Functions
  const getProductId = (product) => product.id || product._id;

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const productId = getProductId(product);
      const existingItem = prevCart.find(
        (item) => getProductId(item.product) === productId
      );
      if (existingItem) {
        return prevCart.map((item) =>
          getProductId(item.product) === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => getProductId(item.product) !== productId)
    );
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        getProductId(item.product) === productId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [cart]);

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const Navbar = () => {
    // Local search state inside Navbar to control input before committing
    const [localTempQuery, setLocalTempQuery] = useState("");

    const localCommitSearch = () => {
      setSearchQuery(localTempQuery);
      if (localTempQuery.trim() !== "") {
        setCurrentPage("search");
      } else {
        setCurrentPage("home");
      }
    };

    return (
      <nav
        className={`sticky top-0 z-50 ${
          darkMode
            ? "bg-amber-900"
            : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
        } shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img
                src="/logo.png"
                alt="Dwarika Logo"
                className="w-20 h-20 object-contain"
              />
              <span
                className={`text-3xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 bg-clip-text text-transparent`}
              >
                Dwarika
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                type="button"
                onClick={() => setCurrentPage("home")}
                className={`${
                  currentPage === "home"
                    ? "text-amber-600"
                    : darkMode
                    ? "text-gray-300"
                    : "text-gray-700"
                } hover:text-amber-600 font-medium`}
              >
                Home
              </button>
              {/* Admin link removed from header */}
              <button
                type="button"
                onClick={() => setCurrentPage("products")}
                className={`${
                  currentPage === "products"
                    ? "text-amber-600"
                    : darkMode
                    ? "text-gray-300"
                    : "text-gray-700"
                } hover:text-amber-600 font-medium`}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage("about")}
                className={`${
                  currentPage === "about"
                    ? "text-amber-600"
                    : darkMode
                    ? "text-gray-300"
                    : "text-gray-700"
                } hover:text-amber-600 font-medium`}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage("contact")}
                className={`${
                  currentPage === "contact"
                    ? "text-amber-600"
                    : darkMode
                    ? "text-gray-300"
                    : "text-gray-700"
                } hover:text-amber-600 font-medium`}
              >
                Contact
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search bar input and commit button */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={localTempQuery}
                  onChange={(e) => setLocalTempQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      localCommitSearch();
                    }
                  }}
                  className={`pl-10 pr-12 py-2 rounded-full w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-800 text-white placeholder-gray-400"
                      : "bg-stone-100 text-gray-900 placeholder-stone-500"
                  }`}
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={localCommitSearch}
                  className={`absolute right-3 top-2.5 rounded-full transition-all duration-200 ${
                    localTempQuery.trim()
                      ? "bg-amber-600 text-white hover:bg-amber-700 shadow-md hover:shadow-lg"
                      : darkMode
                      ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      : "bg-stone-300 text-stone-600 hover:bg-stone-400"
                  }`}
                  aria-label="Search"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>

              {/* Cart Icon */}
              <button
                type="button"
                onClick={() => setCurrentPage("cart")}
                className="relative p-2 rounded-full hover:bg-amber-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ShoppingCart
                  className={`w-6 h-6 ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Dark mode removed — always light theme */}

              {/* Auth Buttons */}
              {user ? (
                <div ref={userMenuRef} className="hidden md:block relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700"
                  >
                    <span
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-amber-700"
                      }`}
                    >
                      {user.name ? user.name.split(" ")[0] : "User"}
                    </span>
                    <ChevronDown
                      className={darkMode ? "text-white" : "text-amber-700"}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-amber-50 rounded-md shadow-lg z-50 overflow-hidden border border-amber-100">
                      <div className="p-4 border-b border-amber-100">
                        <div className="font-semibold text-amber-800">
                          {user.name}
                        </div>
                        <div className="text-sm text-amber-700">
                          {user.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage("profile");
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-amber-100"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentPage("myOrders");
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-amber-100"
                      >
                        My Orders
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-amber-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentPage("login")}
                    className="px-3 py-2 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white shadow-md"
                  >
                    Login
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? (
                  <X className={darkMode ? "text-white" : "text-gray-900"} />
                ) : (
                  <Menu className={darkMode ? "text-white" : "text-gray-900"} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("home");
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left ${
                    currentPage === "home"
                      ? "text-amber-600"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  } hover:text-amber-600`}
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("products");
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left ${
                    currentPage === "products"
                      ? "text-amber-600"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  } hover:text-amber-600`}
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("about");
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left ${
                    currentPage === "about"
                      ? "text-amber-600"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  } hover:text-amber-600`}
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("contact");
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left ${
                    currentPage === "contact"
                      ? "text-amber-600"
                      : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                  } hover:text-amber-600`}
                >
                  Contact
                </button>
                {/* Mobile auth action */}
                {user ? (
                  <>
                    <div className="pt-4 px-3 border-t">
                      <div className="font-semibold text-amber-700">
                        {user.name ? user.name.split(" ")[0] : "User"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage("profile");
                        setMobileMenuOpen(false);
                      }}
                      className="text-left px-4 py-2 text-amber-700"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPage("myOrders");
                        setMobileMenuOpen(false);
                      }}
                      className="text-left px-4 py-2 text-amber-700"
                    >
                      My Orders
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-left px-4 py-2 text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentPage("login");
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-amber-600 font-medium"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  };

  const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [heroImages, setHeroImages] = useState([]);

    useEffect(() => {
      let mounted = true;
      const loadBannersForHero = async () => {
        try {
          const banners = await fetchBanners();
          if (!mounted || !Array.isArray(banners)) return;
          const heroBanners = banners
            .filter((b) => (b.position || "hero") === "hero" && b.active)
            .map((b) => b.image)
            .filter(Boolean);
          if (heroBanners.length > 0) setHeroImages(heroBanners);
        } catch (e) {
          console.debug("Failed to load hero banners:", e.message || e);
        }
      };
      loadBannersForHero();
      return () => {
        mounted = false;
      };
    }, []);

    // Load shipping charge from server (admin configurable)
    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const data = await fetchShippingCharge();
          if (!mounted) return;
          setShippingCharge(data.shippingCharge || data);
        } catch (err) {
          console.error("Failed to load shipping charge", err);
        }
      };
      load();
      return () => {
        mounted = false;
      };
    }, []);

    // Listen for shippingCharge updates from other tabs (admin saves write to localStorage)
    useEffect(() => {
      const handleStorage = (e) => {
        if (e.key === "shippingCharge") {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && typeof parsed.amount === "number")
              setShippingCharge(parsed);
          } catch (err) {
            // ignore
          }
        }
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }, []);

    // Refresh shipping when window/tab gains focus (covers saving in admin then returning to storefront)
    useEffect(() => {
      const fetchShipping = async () => {
        try {
          const res = await fetch("/api/settings/shipping-charge");
          if (res.ok) {
            const d = await res.json();
            setShippingCharge(d.shippingCharge || d);
            console.debug &&
              console.debug(
                "Shipping refreshed on focus",
                d.shippingCharge || d
              );
          }
        } catch (err) {
          // ignore
        }
      };
      const onFocus = () => {
        fetchShipping();
      };
      window.addEventListener("focus", onFocus);
      return () => window.removeEventListener("focus", onFocus);
    }, []);

    // Log shippingCharge changes for debugging
    useEffect(() => {
      console.debug &&
        console.debug("shippingCharge state changed:", shippingCharge);
    }, [shippingCharge]);

    // Refresh shipping when navigating to cart/checkout/payment to ensure latest value
    useEffect(() => {
      if (["cart", "checkout", "payment"].includes(currentPage)) {
        (async () => {
          try {
            const d = await fetchShippingCharge();
            setShippingCharge(d.shippingCharge || d);
          } catch (err) {
            // ignore
          }
        })();
      }
    }, [currentPage]);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }, [heroImages.length]);

    return (
      <div
        className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-rose-900 to-gray-900"
            : "bg-gradient-to-br from-amber-50 via-stone-50 to-rose-50"
        }`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-rose-300 rounded-full opacity-30 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full opacity-10 blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 shadow-lg transform-gpu floaty ${
                  darkMode
                    ? "bg-amber-900/10 text-amber-400"
                    : "bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 text-amber-700"
                }`}
              >
                <Sparkles className="w-6 h-6 text-amber-600 animate-pulse-slow" />
                <span className="text-lg md:text-2xl font-extrabold dwarika-badge">
                  Dwarika Collection
                </span>
              </div>
              <style>{`
                .dwarika-badge { background: linear-gradient(90deg,#b78300 0%,#ffd166 50%,#f0c24a 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
                @keyframes floaty { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
                .floaty { animation: floaty 4.2s ease-in-out infinite; }
                @keyframes pulse-slow { 0% { opacity: 1; transform: scale(1); } 50% { opacity: .85; transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); } }
                .animate-pulse-slow { animation: pulse-slow 2.6s ease-in-out infinite; }
              `}</style>

              <h1
                className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Timeless{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600">
                  Elegance
                </span>
                <br />
                in Every Piece
              </h1>

              <p
                className={`text-xl md:text-2xl leading-relaxed ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Discover our exquisite collection of handcrafted gold jewelry,
                designed to make every moment special and memorable
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage("search");
                  }}
                  className="group relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Collection
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button
                  onClick={() => setCurrentPage("contact")}
                  className={`px-8 py-4 rounded-full text-lg font-semibold border-2 ${
                    darkMode
                      ? "border-amber-500 text-amber-400 hover:bg-amber-900/30"
                      : "border-amber-600 text-amber-600 hover:bg-amber-50"
                  } transition-all duration-300`}
                >
                  Contact Us
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    35+
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Years Experience
                  </div>
                </div>
                <div>
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    10K+
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Happy Customers
                  </div>
                </div>
                <div>
                  <div
                    className={`text-3xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    5★
                  </div>
                  <div
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Average Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image Slider */}
            <div className="relative">
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                {heroImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Hero ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Image Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "w-8 bg-amber-600"
                        : darkMode
                        ? "w-2 bg-gray-600"
                        : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Categories = () => {
    const categories = [
      {
        name: "Necklaces",
        icon: "💎",
        count: 45,
        image:
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
      },
      {
        name: "Rings",
        icon: "💍",
        count: 32,
        image:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop",
      },
      {
        name: "Bangles",
        icon: "✨",
        count: 28,
        image:
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop",
      },
      {
        name: "Earrings",
        icon: "🌟",
        count: 38,
        image:
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
      },
      {
        name: "Bridal Sets",
        icon: "👑",
        count: 15,
        image:
          "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop",
      },
      {
        name: "Chains",
        icon: "🔗",
        count: 25,
        image:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
      },
    ];

    return (
      <div
        className={`py-20 ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-b from-stone-100 to-stone-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Shop by Category
            </h2>
            <p
              className={`text-xl ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Explore our curated collections
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group relative cursor-pointer"
                onClick={() => {
                  setSearchQuery(category.name);
                  setCurrentPage("search");
                }}
              >
                <div
                  className={`relative h-48 rounded-2xl overflow-hidden ${
                    darkMode ? "bg-amber-800" : "bg-stone-200"
                  } transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-2xl`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="text-5xl mb-2 transform group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <h3
                      className={`text-lg font-bold ${
                        darkMode ? "text-white" : "text-white"
                      } text-center`}
                    >
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {category.count} items
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const FeaturedCollection = () => {
    // Show products marked as featured (admin toggle) - limit to 3 items
    const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

    return (
      <div
        className={`py-20 ${
          darkMode
            ? "bg-amber-800"
            : "bg-gradient-to-b from-stone-100 via-stone-50 to-amber-50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Featured Collection
            </h2>
            <p
              className={`text-xl mb-6 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Handpicked excellence for you
            </p>
            <button
              onClick={() => setCurrentPage("products")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Featured Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className={`group relative ${
                  darkMode
                    ? "bg-gray-900"
                    : "bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100"
                } rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300 border-2 ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                } hover:shadow-2xl`}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="p-2 rounded-full bg-stone-100/90 backdrop-blur-sm hover:bg-stone-200 transition-colors shadow-lg">
                      <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-900" />
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(product.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span
                      className={`ml-2 text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      ({product.rating}.0)
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                      रु{product.price.toLocaleString()}
                    </p>
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        darkMode
                          ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowProductDetail(true);
                    }}
                    className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Statistics = () => {
    const stats = [
      {
        icon: <Award className="w-6 h-6" />,
        value: "35+",
        label: "Years of Excellence",
        color: "from-yellow-400 to-yellow-600",
      },
      {
        icon: <Users className="w-6 h-6" />,
        value: "10K+",
        label: "Happy Customers",
        color: "from-rose-400 to-rose-500",
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        value: "5★",
        label: "Average Rating",
        color: "from-amber-500 to-amber-700",
      },
      {
        icon: <Sparkles className="w-6 h-6" />,
        value: "500+",
        label: "Unique Designs",
        color: "from-amber-400 to-amber-600",
      },
    ];

    return (
      <div
        className={`py-12 relative overflow-hidden ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-rose-400 to-gray-900"
            : "bg-gradient-to-br from-rose-200 via-rose-300 to-rose-400"
        }`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Our Achievements
            </h2>
            <p
              className={`text-base ${
                darkMode ? "text-rose-100" : "text-gray-700"
              }`}
            >
              Trusted by thousands of satisfied customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`rounded-xl p-6 text-center border transition-all duration-300 transform hover:scale-105 ${
                  darkMode
                    ? "bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20"
                    : "bg-white/80 backdrop-blur-lg border-rose-200 hover:bg-white shadow-lg"
                }`}
              >
                <div
                  className={`inline-flex p-3 rounded-full bg-gradient-to-r ${stat.color} text-white mb-3`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`text-3xl md:text-4xl font-bold mb-1 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stat.value}
                </div>
                <div
                  className={`text-sm md:text-base ${
                    darkMode ? "text-rose-100" : "text-gray-700"
                  }`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Testimonials = () => {
    return (
      <div
        className={`py-20 relative overflow-hidden ${
          darkMode
            ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-b from-amber-50 via-stone-100 to-amber-50"
        }`}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-rose-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">Customer Reviews</span>
            </div>
            <h2
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              What Our Customers Say
            </h2>
            <p
              className={`text-xl ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Trusted by thousands of satisfied customers
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`group relative ${
                  darkMode
                    ? "bg-amber-800"
                    : "bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100"
                } p-8 rounded-2xl shadow-xl border-2 ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                } hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                {/* Decorative Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-t-2xl"></div>

                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10">
                  <div className="text-6xl font-serif text-amber-400 dark:text-amber-500">
                    "
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p
                  className={`text-lg mb-6 leading-relaxed relative z-10 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {testimonial.text}
                </p>

                {/* Customer Name */}
                <div className="flex items-center gap-3 pt-4 border-t border-amber-100 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p
                      className={`font-bold text-lg ${
                        darkMode ? "text-amber-400" : "text-amber-600"
                      }`}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Verified Customer
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-16 text-center">
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
                darkMode
                  ? "bg-amber-800 border border-amber-700"
                  : "bg-gradient-to-br from-stone-50 to-amber-50 border border-amber-300 shadow-lg"
              }`}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span
                className={`font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <span className="text-amber-500">4.9</span> / 5.0 Average Rating
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-rose-400 text-white"
      } py-12`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-yellow-400 text-3xl font-bold">D</span>
              </div>
              <h3 className="text-3xl font-bold text-yellow-400">Dwarika</h3>
            </div>
            <p className={darkMode ? "text-gray-300" : "text-white/90"}>
              Your trusted partner for exquisite gold jewelry since 1990.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentPage("home")}
                  className={
                    darkMode
                      ? "text-gray-300 hover:text-yellow-400"
                      : "text-white/90 hover:text-yellow-300"
                  }
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("about")}
                  className={
                    darkMode
                      ? "text-gray-300 hover:text-yellow-400"
                      : "text-white/90 hover:text-yellow-300"
                  }
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("contact")}
                  className={
                    darkMode
                      ? "text-gray-300 hover:text-yellow-400"
                      : "text-white/90 hover:text-yellow-300"
                  }
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("products")}
                  className={
                    darkMode
                      ? "text-gray-300 hover:text-yellow-400"
                      : "text-white/90 hover:text-yellow-300"
                  }
                >
                  Products
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className={
                    darkMode
                      ? "text-gray-300 hover:text-yellow-400"
                      : "text-white/90 hover:text-yellow-300"
                  }
                >
                  Necklaces
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={
                    darkMode
                      ? "text-gray-300 hover:text-yellow-400"
                      : "text-white/90 hover:text-yellow-300"
                  }
                >
                  Rings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={
                    darkMode
                      ? "text-gray-300 hover:text-yellow-400"
                      : "text-white/90 hover:text-yellow-300"
                  }
                >
                  Bangles
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={
                    darkMode
                      ? "text-gray-300 hover:text-yellow-400"
                      : "text-white/90 hover:text-yellow-300"
                  }
                >
                  Earrings
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Contact Info
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-yellow-400" />
                <span className={darkMode ? "text-gray-300" : "text-white/90"}>
                  +977 1234567890
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-yellow-400" />
                <span className={darkMode ? "text-gray-300" : "text-white/90"}>
                  info@dwarika.com
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-yellow-400" />
                <span className={darkMode ? "text-gray-300" : "text-white/90"}>
                  Patan, Nepal
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`border-t ${
            darkMode ? "border-gray-700" : "border-white/30"
          } mt-8 pt-8 text-center ${
            darkMode ? "text-gray-400" : "text-white/90"
          }`}
        >
          <p>&copy; 2025 Dwarika Gold Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  const AboutPage = () => (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1
          className={`text-5xl font-bold text-center mb-12 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          About Dwarika
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop"
              alt="Jewelry"
              className="rounded-xl shadow-2xl"
            />
          </div>
          <div>
            <h2
              className={`text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700`}
            >
              Our Story
            </h2>
            <p
              className={`text-lg mb-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Established in 1990, Dwarika has been serving the community with
              authentic and exquisite gold jewelry for over three decades. Our
              commitment to quality and craftsmanship has made us one of the
              most trusted names in the industry.
            </p>
            <p
              className={`text-lg mb-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Every piece of jewelry at Dwarika is crafted with precision and
              passion by our skilled artisans. We blend traditional
              craftsmanship with modern designs to create timeless pieces that
              celebrate your special moments.
            </p>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              From bridal collections to everyday elegance, we offer a wide
              range of jewelry that caters to every taste and occasion. Visit us
              and experience the Dwarika difference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ContactPage = () => (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1
          className={`text-5xl font-bold text-center mb-12 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Contact Us
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2
              className={`text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700`}
            >
              Get In Touch
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-amber-600 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Phone
                  </h3>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    +977 1234567890
                  </p>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    +977 0987654321
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-amber-600 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Email
                  </h3>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    info@dwarika.com
                  </p>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    support@dwarika.com
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-amber-600 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Address
                  </h3>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    Main Street, Patan
                  </p>
                  <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                    Bagmati Province, Nepal
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${
              darkMode ? "bg-amber-800" : "bg-amber-50"
            } p-8 rounded-xl`}
          >
            <h3
              className={`text-2xl font-bold mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Send us a message
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className={`w-full p-3 rounded-lg ${
                  darkMode ? "bg-gray-900 text-white" : "bg-stone-50"
                } border ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                } focus:outline-none focus:ring-2 focus:ring-amber-600`}
              />
              <input
                type="email"
                placeholder="Your Email"
                className={`w-full p-3 rounded-lg ${
                  darkMode ? "bg-gray-900 text-white" : "bg-stone-50"
                } border ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                } focus:outline-none focus:ring-2 focus:ring-amber-600`}
              />
              <input
                type="tel"
                placeholder="Your Phone"
                className={`w-full p-3 rounded-lg ${
                  darkMode ? "bg-gray-900 text-white" : "bg-stone-50"
                } border ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                } focus:outline-none focus:ring-2 focus:ring-amber-600`}
              />
              <textarea
                rows="4"
                placeholder="Your Message"
                className={`w-full p-3 rounded-lg ${
                  darkMode ? "bg-gray-900 text-white" : "bg-stone-50"
                } border ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                } focus:outline-none focus:ring-2 focus:ring-amber-600`}
              ></textarea>
              <button
                onClick={() => alert("Message sent successfully!")}
                className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductDetailModal = () => {
    const [quantity, setQuantity] = useState(1);

    if (!selectedProduct || !showProductDetail) return null;
    const handleAddToCart = () => {
      addToCart(selectedProduct, quantity);
      setShowProductDetail(false);
      setSelectedProduct(null);
      setQuantity(1);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div
          className={`relative max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            darkMode
              ? "bg-amber-800"
              : "bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50"
          } rounded-2xl shadow-2xl`}
        >
          <button
            onClick={() => {
              setShowProductDetail(false);
              setSelectedProduct(null);
              setQuantity(1);
            }}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-10 ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h2
                  className={`text-3xl font-bold mb-4 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedProduct.name}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(selectedProduct.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span
                    className={`ml-2 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ({selectedProduct.rating}.0)
                  </span>
                </div>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6">
                  रु{selectedProduct.price.toLocaleString()}
                </p>
              </div>

              {/* Quantity Selector */}
              <div>
                <label
                  className={`block mb-2 font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`p-2 rounded-full transition-colors ${
                      darkMode
                        ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span
                    className={`text-2xl font-bold w-12 text-center ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={`p-2 rounded-full transition-colors ${
                      darkMode
                        ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Description */}
              <div>
                <h3
                  className={`font-semibold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Description
                </h3>
                <p
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  Exquisitely crafted {selectedProduct.name.toLowerCase()} with
                  premium materials and traditional craftsmanship. This piece
                  combines elegance and durability, making it perfect for
                  special occasions and everyday wear.
                </p>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart - रु
                  {(selectedProduct.price * quantity).toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SearchResultsPage = () => {
    const searchResults = getFilteredProducts();

    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1
            className={`text-5xl font-bold text-center mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {searchQuery.trim() ? "Search Results" : "All Products"}
          </h1>
          <p
            className={`text-xl text-center mb-12 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {searchQuery.trim()
              ? `Showing results for "${searchQuery}"`
              : "Browse our complete collection"}
          </p>

          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p
                className={`text-2xl mb-4 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No products found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage("home");
                }}
                className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className={`${
                    darkMode
                      ? "bg-amber-800"
                      : "bg-gradient-to-br from-stone-50 to-amber-50/30"
                  } rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 border-2 ${
                    darkMode ? "border-gray-700" : "border-amber-200"
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-3">
                      {[...Array(product.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
                      रु{product.price.toLocaleString()}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductDetail(true);
                      }}
                      className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const CartPage = () => {
    if (cart.length === 0) {
      return (
        <div
          className={`min-h-screen ${
            darkMode
              ? "bg-gray-900"
              : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-gray-400" />
              <h2
                className={`text-3xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Your cart is empty
              </h2>
              <p
                className={`text-xl mb-8 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Start adding products to your cart!
              </p>
              <button
                onClick={() => setCurrentPage("products")}
                className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1
            className={`text-4xl font-bold mb-8 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={getProductId(item.product)}
                  className={`${
                    darkMode
                      ? "bg-gray-800"
                      : "bg-gradient-to-br from-stone-50 to-amber-50/30"
                  } rounded-xl shadow-lg p-6 border-2 ${
                    darkMode ? "border-gray-700" : "border-amber-200"
                  }`}
                >
                  <div className="flex gap-6">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-bold mb-2 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4">
                        रु{item.product.price.toLocaleString()}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Quantity:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                getProductId(item.product),
                                item.quantity - 1
                              )
                            }
                            className={`p-1 rounded-full ${
                              darkMode
                                ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span
                            className={`w-8 text-center font-bold ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                getProductId(item.product),
                                item.quantity + 1
                              )
                            }
                            className={`p-1 rounded-full ${
                              darkMode
                                ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(getProductId(item.product))
                          }
                          className={`ml-auto p-2 text-red-500 rounded-lg transition-colors ${
                            darkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"
                          }`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p
                        className={`mt-4 text-lg font-semibold ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Subtotal: रु
                        {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className={`sticky top-24 ${
                  darkMode
                    ? "bg-amber-800"
                    : "bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100"
                } rounded-xl shadow-lg p-6 border-2 ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                }`}
              >
                <h2
                  className={`text-2xl font-bold mb-6 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Subtotal ({getCartItemCount()} items)
                    </span>
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      रु{getCartTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Shipping
                    </span>
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      रु{getCurrentShippingAmount().toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`border-t pt-4 ${
                      darkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span
                        className={`text-xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Total
                      </span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        रु
                        {(
                          getCartTotal() + getCurrentShippingAmount()
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage("checkout")}
                  className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CheckoutPage = () => {
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    });

    const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setShippingInfo(formData);
      setCurrentPage("payment");
    };

    if (cart.length === 0) {
      return (
        <div
          className={`min-h-screen ${
            darkMode
              ? "bg-gray-900"
              : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h2
                className={`text-3xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Your cart is empty
              </h2>
              <button
                onClick={() => setCurrentPage("products")}
                className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1
            className={`text-4xl font-bold mb-8 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-800"
                      : "bg-gradient-to-br from-stone-50 to-amber-50/30"
                  } rounded-xl shadow-lg p-6 border-2 ${
                    darkMode ? "border-gray-700" : "border-amber-200"
                  }`}
                >
                  <h2
                    className={`text-2xl font-bold mb-6 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Shipping Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block mb-2 font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-900 text-white border-gray-700"
                            : "bg-stone-50 border-amber-200"
                        } focus:outline-none focus:ring-2 focus:ring-amber-600`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block mb-2 font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-900 text-white border-gray-700"
                            : "bg-stone-50 border-amber-200"
                        } focus:outline-none focus:ring-2 focus:ring-amber-600`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block mb-2 font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-900 text-white border-gray-700"
                            : "bg-stone-50 border-amber-200"
                        } focus:outline-none focus:ring-2 focus:ring-amber-600`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block mb-2 font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-900 text-white border-gray-700"
                            : "bg-stone-50 border-amber-200"
                        } focus:outline-none focus:ring-2 focus:ring-amber-600`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block mb-2 font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-900 text-white border-gray-700"
                            : "bg-stone-50 border-amber-200"
                        } focus:outline-none focus:ring-2 focus:ring-amber-600`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block mb-2 font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-lg border ${
                          darkMode
                            ? "bg-gray-900 text-white border-gray-700"
                            : "bg-stone-50 border-amber-200"
                        } focus:outline-none focus:ring-2 focus:ring-amber-600`}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label
                      className={`block mb-2 font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Address *
                    </label>
                    <textarea
                      name="address"
                      required
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-lg border ${
                        darkMode
                          ? "bg-gray-900 text-white border-gray-700"
                          : "bg-stone-50 border-amber-200"
                      } focus:outline-none focus:ring-2 focus:ring-amber-600`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className={`sticky top-24 ${
                  darkMode
                    ? "bg-gray-800"
                    : "bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100"
                } rounded-xl shadow-lg p-6 border-2 ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                }`}
              >
                <h2
                  className={`text-2xl font-bold mb-6 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={getProductId(item.product)}
                      className="flex justify-between"
                    >
                      <span
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        {item.product.name} x{item.quantity}
                      </span>
                      <span
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        रु
                        {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div
                    className={`border-t pt-4 space-y-2 ${
                      darkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        Subtotal
                      </span>
                      <span
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        रु{getCartTotal().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        Shipping
                      </span>
                      <span
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        रु{getCurrentShippingAmount().toLocaleString()}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between pt-2 border-t ${
                        darkMode ? "border-gray-600" : "border-gray-300"
                      }`}
                    >
                      <span
                        className={`text-xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Total
                      </span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        रु
                        {(
                          getCartTotal() + getCurrentShippingAmount()
                        ).toLocaleString()}
                      </span>
                    </div>
                    {/* Selected payment method display */}
                    <div className="mt-4">
                      <div className="text-sm text-gray-600">
                        Selected payment method:
                      </div>
                      <div className="font-semibold text-gray-900">
                        {paymentMethod === "cash"
                          ? "Cash on Delivery"
                          : paymentMethod === "card"
                          ? "Card (Credit/Debit)"
                          : paymentMethod === "khalti"
                          ? "Khalti (Mobile Wallet)"
                          : paymentMethod}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PaymentPage = () => {
    const [paymentOptions, setPaymentOptions] = useState([
      { id: "cash_on_delivery", label: "Cash on Delivery", enabled: true },
      { id: "card", label: "Card (Credit/Debit)", enabled: true },
    ]);
    const [loadingPaymentOptions, setLoadingPaymentOptions] = useState(false);

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        setLoadingPaymentOptions(true);
        try {
          const res = await fetch("/api/settings/payment-methods");
          if (res.ok) {
            const d = await res.json();
            if (!mounted) return;
            const serverMethods = d.paymentMethods || [];
            console.log("payment-methods response", serverMethods);
            const opts = serverMethods.filter((m) => m.enabled);
            // fallback: if server returned no enabled methods, default to common methods
            if (!opts || opts.length === 0) {
              const fallback = [
                {
                  id: "cash_on_delivery",
                  label: "Cash on Delivery",
                  enabled: true,
                },
                { id: "card", label: "Card (Credit/Debit)", enabled: true },
              ];
              setPaymentOptions(fallback);
            } else {
              setPaymentOptions(opts);
            }
            // pick a default if current is not available
            const mapToLocal = (id) =>
              id === "cash_on_delivery" ? "cash" : id === "card" ? "card" : id;
            if (opts.length > 0) {
              const hasCurrent = opts.some(
                (m) => mapToLocal(m.id) === paymentMethod
              );
              if (!hasCurrent) setPaymentMethod(mapToLocal(opts[0].id));
            }
          }
        } catch (e) {
          console.error("Failed to load payment options", e);
        }
        setLoadingPaymentOptions(false);
      };
      load();
      return () => {
        mounted = false;
      };
    }, []);

    const handlePayment = async (e) => {
      e.preventDefault();
      try {
        if (!user) {
          setPostLoginRedirect("payment");
          alert("Please login to place order");
          setCurrentPage("login");
          return;
        }
        const orderData = {
          user: user._id,
          items: cart.map((item) => ({
            product: item.product._id || item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
          shippingAddress: shippingInfo
            ? {
                name: shippingInfo.fullName,
                phone: shippingInfo.phone,
                street: shippingInfo.address || "",
                city: shippingInfo.city,
                state: shippingInfo.state,
                zipCode: shippingInfo.zipCode,
                country: "Nepal",
              }
            : {},
          paymentMethod:
            paymentMethod === "cash"
              ? "cash_on_delivery"
              : paymentMethod === "card"
              ? "card"
              : paymentMethod === "khalti"
              ? "khalti"
              : paymentMethod,
          paymentStatus: "pending",
          orderStatus: "pending",
          subtotal: getCartTotal(),
          shipping:
            shippingCharge && typeof shippingCharge.amount === "number"
              ? shippingCharge.amount
              : 500,
          total: getCartTotal() + getCurrentShippingAmount(),
        };

        // If paying with Khalti, create order first then invoke Khalti checkout
        if (paymentMethod === "khalti") {
          const orderRes = await createOrder(orderData);
          // amount in paisa (Khalti expects smallest currency unit)
          const amountPaisa = Math.round(
            (orderRes.total || orderData.total) * 100
          );

          // Load Khalti script if needed
          if (!window.KhaltiCheckout) {
            await new Promise((resolve, reject) => {
              const s = document.createElement("script");
              s.src = "https://khalti.com/static/khalti-checkout.js";
              s.onload = resolve;
              s.onerror = reject;
              document.head.appendChild(s);
            });
          }

          const publicKey = import.meta.env.VITE_KHALTI_PUBLIC_KEY || "";
          if (!publicKey) {
            alert(
              "Khalti public key not configured. Set VITE_KHALTI_PUBLIC_KEY in your frontend env."
            );
            return;
          }

          const config = {
            publicKey,
            productIdentity: orderRes._id,
            productName: `Order ${orderRes.orderNumber || orderRes._id}`,
            productUrl: window.location.origin,
            eventHandler: {
              onSuccess: async (payload) => {
                try {
                  const verifyRes = await fetch("/api/payments/khalti/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      token: payload.token,
                      amount: payload.amount,
                      orderId: orderRes._id,
                    }),
                  });
                  if (verifyRes.ok) {
                    const data = await verifyRes.json();
                    setLastOrder(data.order || orderRes);
                    setCart([]);
                    setShippingInfo(null);
                    setCurrentPage("orderSuccess");
                  } else {
                    const err = await verifyRes.json().catch(() => ({}));
                    alert(
                      "Payment verification failed: " +
                        (err.message || "Unknown")
                    );
                  }
                } catch (err) {
                  console.error("Verify call failed", err);
                  alert("Payment verification failed");
                }
              },
              onError: (err) => {
                console.error("Khalti error", err);
                alert("Khalti payment failed or was cancelled");
              },
              onClose: () => {
                // user closed the widget
              },
            },
          };

          const checkout = new window.KhaltiCheckout(config);
          checkout.show({ amount: amountPaisa });
          return;
        }

        const orderRes = await createOrder(orderData);
        // orderRes should contain saved order with orderNumber
        setLastOrder(orderRes);
        setCart([]);
        setShippingInfo(null);
        setCurrentPage("orderSuccess");
      } catch (error) {
        console.error("Error creating order:", error);
        alert("Failed to place order. Please try again.");
      }
    };

    if (cart.length === 0) {
      return (
        <div
          className={`min-h-screen ${
            darkMode
              ? "bg-gray-900"
              : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h2
                className={`text-3xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Your cart is empty
              </h2>
              <button
                onClick={() => setCurrentPage("products")}
                className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-center mb-8">
            <Wallet className="w-8 h-8 text-amber-600 mr-2" />
            <h1
              className={`text-4xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Payment
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePayment} className="space-y-6">
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-800"
                      : "bg-gradient-to-br from-stone-50 to-amber-50/30"
                  } rounded-xl shadow-lg p-6 border-2 ${
                    darkMode ? "border-gray-700" : "border-amber-200"
                  }`}
                >
                  <h2
                    className={`text-2xl font-bold mb-6 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Select Payment Method
                  </h2>

                  {/* Payment Method Options */}
                  <div className="space-y-4 mb-6">
                    {loadingPaymentOptions ? (
                      <div>Loading payment methods...</div>
                    ) : paymentOptions.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No payment methods available. Please contact admin.
                      </div>
                    ) : (
                      paymentOptions.map((m) => {
                        const local =
                          m.id === "cash_on_delivery"
                            ? "cash"
                            : m.id === "card"
                            ? "card"
                            : m.id;
                        // render cash specifically to match existing UI
                        if (m.id === "cash_on_delivery") {
                          return (
                            <div
                              key={m.id}
                              onClick={() => setPaymentMethod(local)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                paymentMethod === local
                                  ? "border-amber-600 bg-amber-50"
                                  : "border-amber-200 hover:border-amber-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`p-3 rounded-full ${
                                      paymentMethod === local
                                        ? "bg-amber-600 text-white"
                                        : "bg-gray-200 text-gray-600"
                                    }`}
                                  >
                                    <Wallet className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold">
                                      {m.label}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Pay when you receive your order
                                    </p>
                                  </div>
                                </div>
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    paymentMethod === local
                                      ? "border-amber-600 bg-amber-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {paymentMethod === local && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Card, UPI, Khalti or other methods — render selectable box
                        return (
                          <div
                            key={m.id}
                            onClick={() => setPaymentMethod(local)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              paymentMethod === local
                                ? "border-amber-600 bg-amber-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-gray-200 text-gray-600">
                                  {m.id === "card" ? (
                                    <CreditCard className="w-6 h-6" />
                                  ) : m.id === "khalti" ? (
                                    <Wallet className="w-6 h-6" />
                                  ) : (
                                    <Wallet className="w-6 h-6" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold">
                                    {m.label}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {m.id === "card"
                                      ? "Pay with card"
                                      : m.id === "khalti"
                                      ? "Pay via Khalti mobile wallet"
                                      : ""}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full border-2 ${
                                  paymentMethod === local
                                    ? "border-amber-600 bg-amber-600"
                                    : "border-gray-300"
                                }`}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Cash on Delivery Message */}
                  {paymentMethod === "cash" && (
                    <div
                      className={`p-4 rounded-lg ${
                        darkMode ? "bg-amber-900/30" : "bg-amber-50"
                      } border ${
                        darkMode ? "border-amber-700" : "border-amber-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Wallet
                          className={`w-5 h-5 mt-0.5 ${
                            darkMode ? "text-amber-400" : "text-amber-700"
                          }`}
                        />
                        <div>
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-amber-300" : "text-amber-900"
                            }`}
                          >
                            Cash on Delivery Selected
                          </p>
                          <p
                            className={`text-sm mt-1 ${
                              darkMode ? "text-amber-200" : "text-amber-700"
                            }`}
                          >
                            You will pay रु
                            {(
                              getCartTotal() + getCurrentShippingAmount()
                            ).toLocaleString()}{" "}
                            when your order is delivered.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {paymentMethod === "cash" ? (
                    <>
                      <Wallet className="w-5 h-5" />
                      Place Order - Pay रु
                      {(
                        getCartTotal() + getCurrentShippingAmount()
                      ).toLocaleString()}{" "}
                      on Delivery
                    </>
                  ) : paymentMethod === "card" ? (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Place Order - Pay रु
                      {(
                        getCartTotal() + getCurrentShippingAmount()
                      ).toLocaleString()}{" "}
                      now
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Place Order - Pay रु
                      {(
                        getCartTotal() + getCurrentShippingAmount()
                      ).toLocaleString()}{" "}
                      now
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className={`sticky top-24 ${
                  darkMode
                    ? "bg-gray-800"
                    : "bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100"
                } rounded-xl shadow-lg p-6 border-2 ${
                  darkMode ? "border-gray-700" : "border-amber-200"
                }`}
              >
                <h2
                  className={`text-2xl font-bold mb-6 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Subtotal
                    </span>
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      रु{getCartTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      Shipping
                    </span>
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      रु{getCurrentShippingAmount().toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`border-t pt-4 ${
                      darkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span
                        className={`text-xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Total
                      </span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        रु
                        {(
                          getCartTotal() + getCurrentShippingAmount()
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrderSuccessPage = () => {
    if (!lastOrder) {
      return (
        <div
          className={`min-h-screen ${
            darkMode ? "bg-gray-900" : "bg-stone-100"
          } py-20`}
        >
          <div className="max-w-md mx-auto p-6 rounded-lg shadow-lg bg-white text-center">
            <h2 className="text-2xl font-bold">Order placed</h2>
            <p className="mt-4">We have received your order.</p>
            <button
              onClick={() => setCurrentPage("home")}
              className="mt-6 px-4 py-2 rounded-full bg-amber-600 text-white"
            >
              Continue shopping
            </button>
          </div>
        </div>
      );
    }

    const orderNumber = lastOrder.orderNumber || lastOrder._id || "";

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-stone-100"
        } py-20`}
      >
        <div className="max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white text-center">
            <h2 className="text-2xl font-bold">Order Confirmed</h2>
            <p className="mt-2 opacity-90">Thank you for your purchase</p>
          </div>
          <div className={`p-6 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
            <p
              className={`text-lg ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Your order ID:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <span className="font-mono font-semibold text-lg text-amber-800">
                {orderNumber}
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setLastOrder(null);
                }}
                className="flex-1 px-4 py-2 rounded-full bg-amber-600 text-white"
              >
                Continue shopping
              </button>
              <button
                onClick={() => {
                  // If we have the just-created order, navigate straight to its detail page
                  try {
                    if (lastOrder && (lastOrder._id || lastOrder.id)) {
                      const id = lastOrder._id || lastOrder.id;
                      setLastOrder(null);
                      setCurrentPage("orderDetail");
                      try {
                        window.history.pushState(null, "", `/order/${id}`);
                      } catch (e) {}
                      return;
                    }
                  } catch (e) {}
                  // Fallback: go to orders list
                  setLastOrder(null);
                  setCurrentPage("orders");
                  try {
                    window.history.pushState(null, "", "/orders");
                  } catch (e) {}
                }}
                className="flex-1 px-4 py-2 rounded-full border border-amber-600 text-amber-600"
              >
                View orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Order detail page
  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    try {
      const parts = (window.location.pathname || "").split("/").filter(Boolean);
      if (parts[0] === "order" && parts[1]) return parts[1];
    } catch (e) {}
    return null;
  });
  const [selectedOrderEdit, setSelectedOrderEdit] = useState(false);
  // helper to open order and push URL so refresh preserves state
  const openOrder = (id, edit = false) => {
    if (!id) return;
    setSelectedOrderId(id);
    setSelectedOrderEdit(edit);
    setCurrentPage("orderDetail");
    try {
      window.history.pushState(null, "", `/order/${id}`);
    } catch (e) {}
  };

  // when app loads or currentPage changes to orderDetail, populate selectedOrderId from URL
  useEffect(() => {
    if (currentPage === "orderDetail") {
      try {
        const parts = (window.location.pathname || "")
          .split("/")
          .filter(Boolean);
        if (parts[0] === "order" && parts[1]) setSelectedOrderId(parts[1]);
      } catch (e) {}
    }
  }, [currentPage]);

  // ensure on initial mount we read the URL and open order if present
  useEffect(() => {
    try {
      const parts = (window.location.pathname || "").split("/").filter(Boolean);
      if (parts[0] === "order" && parts[1]) {
        setSelectedOrderId(parts[1]);
        setCurrentPage("orderDetail");
      }
    } catch (e) {}
  }, []);

  // Push state when currentPage or selectedOrderId changes so refresh keeps the same page (preserve order id)
  useEffect(() => {
    try {
      let path;
      if (currentPage === "orderDetail" && selectedOrderId) {
        path = `/order/${selectedOrderId}`;
      } else {
        path = pageToPath(currentPage);
      }
      const cur = window.location.pathname || "/";
      if (cur !== path) {
        window.history.pushState({}, document.title, path);
      }
    } catch (e) {}
  }, [currentPage, selectedOrderId]);
  const OrderDetailPage = () => {
    const [order, setOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    const [localShipping, setLocalShipping] = useState({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    });
    const [localItems, setLocalItems] = useState([]);
    const [savingOrder, setSavingOrder] = useState(false);

    useEffect(() => {
      const load = async () => {
        if (!selectedOrderId) return;
        setLoadingOrder(true);
        try {
          const data = await fetchOrderDetail(selectedOrderId);
          setOrder(data);
          setLocalShipping(
            data?.shippingAddress || {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            }
          );
          setLocalItems(
            (data?.items || []).map((it) => ({
              product:
                it.product && it.product._id
                  ? it.product._id
                  : it.product || it._id || it.productId,
              name: it.name,
              price: Number(it.price || 0),
              image: resolveAvatarSrc(
                it.image || (it.product && it.product.image) || null
              ),
              quantity: Number(it.quantity || 1),
            }))
          );
        } catch (err) {
          console.error("Failed to load order", err);
        } finally {
          setLoadingOrder(false);
        }
      };
      load();
    }, [selectedOrderId]);

    useEffect(() => {
      if (selectedOrderEdit && order) {
        if (order.orderStatus === "pending") setIsEditingOrder(true);
        setSelectedOrderEdit(false);
      }
    }, [selectedOrderEdit, order]);

    if (!selectedOrderId) return null;

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-stone-100"
        } py-20`}
      >
        <div className="max-w-3xl mx-auto p-6 rounded-2xl shadow-2xl bg-white">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => {
                setCurrentPage("myOrders");
                setSelectedOrderId(null);
              }}
              className="text-amber-600"
            >
              ← Back to orders
            </button>
            {order && (
              <div className="flex items-center gap-2">
                {order.orderStatus === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingOrder(true);
                        setLocalItems(
                          (order.items || []).map((it) => ({
                            product: it.product || it._id || it.productId,
                            name: it.name,
                            price: it.price,
                            image: resolveAvatarSrc(
                              it.image ||
                                (it.product && it.product.image) ||
                                null
                            ),
                            quantity: Number(it.quantity || 1),
                          }))
                        );
                        setLocalShipping(order.shippingAddress || {});
                      }}
                      className="px-3 py-1 rounded-full border border-amber-200 text-amber-700"
                    >
                      Edit Order
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!order) return;
                        if (
                          !confirm("Delete this order? This cannot be undone.")
                        )
                          return;
                        try {
                          await deleteOrder(order._id);
                          setSelectedOrderId(null);
                          setCurrentPage("myOrders");
                        } catch (err) {
                          console.error("Failed to delete order", err);
                          alert(err.message || "Failed to delete order");
                        }
                      }}
                      className="px-3 py-1 rounded-full bg-red-600 text-white"
                    >
                      Delete Order
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {loadingOrder ? (
            <div>Loading...</div>
          ) : !order ? (
            <div>Order not found</div>
          ) : (
            <div>
              <h3 className="text-2xl font-semibold text-amber-800">
                {order.orderNumber || order._id}
              </h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-amber-700">Status</div>
                  <div className="font-semibold">{order.orderStatus}</div>
                </div>
                <div>
                  <div className="text-sm text-amber-700">Placed</div>
                  <div className="font-semibold">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditingOrder ? (
                  <div className="space-y-2">
                    <input
                      value={localShipping.street}
                      onChange={(e) =>
                        setLocalShipping((prev) => ({
                          ...prev,
                          street: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Address line"
                    />
                    <div className="flex gap-2">
                      <input
                        value={localShipping.city}
                        onChange={(e) =>
                          setLocalShipping((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className="flex-1 p-2 border rounded"
                        placeholder="City"
                      />
                      <input
                        value={localShipping.state}
                        onChange={(e) =>
                          setLocalShipping((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        className="w-32 p-2 border rounded"
                        placeholder="State"
                      />
                      <input
                        value={localShipping.zipCode}
                        onChange={(e) =>
                          setLocalShipping((prev) => ({
                            ...prev,
                            zipCode: e.target.value,
                          }))
                        }
                        className="w-24 p-2 border rounded"
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">
                      {order.shippingAddress?.street}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}{" "}
                      {order.shippingAddress?.zipCode}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.shippingAddress?.country}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h4 className="font-semibold">Items</h4>
                <div className="mt-2 space-y-2">
                  {localItems.map((it, idx) => (
                    <div
                      key={it.product || idx}
                      className="flex items-center gap-3 p-3 rounded border"
                    >
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : null}
                      <div className="flex-1">
                        <div className="font-medium">{it.name}</div>
                        <div className="text-sm text-gray-500">
                          रु{it.price?.toLocaleString()}
                        </div>
                      </div>
                      {isEditingOrder ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setLocalItems((prev) =>
                                prev.map((p, pi) =>
                                  pi === idx
                                    ? {
                                        ...p,
                                        quantity: Math.max(
                                          1,
                                          Number(p.quantity || 1) - 1
                                        ),
                                      }
                                    : p
                                )
                              )
                            }
                            className="px-2 py-1 rounded border"
                          >
                            -
                          </button>
                          <div className="w-12 text-center font-medium">
                            {it.quantity}
                          </div>
                          <button
                            onClick={() =>
                              setLocalItems((prev) =>
                                prev.map((p, pi) =>
                                  pi === idx
                                    ? {
                                        ...p,
                                        quantity: Math.max(
                                          1,
                                          Number(p.quantity || 1) + 1
                                        ),
                                      }
                                    : p
                                )
                              )
                            }
                            className="px-2 py-1 rounded border"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Qty: {it.quantity}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 rounded bg-amber-50 border border-amber-100">
                <div className="flex justify-between">
                  <div className="text-sm text-amber-700">Subtotal</div>
                  <div className="font-semibold">
                    रु{order.subtotal?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-sm text-amber-700">Shipping</div>
                  <div className="font-semibold">
                    रु{order.shipping?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-sm text-amber-700">Total</div>
                  <div className="font-bold text-amber-800">
                    रु{order.total?.toLocaleString() || 0}
                  </div>
                </div>
                {order.orderStatus === "pending" && (
                  <div className="mt-4 flex gap-2">
                    {isEditingOrder ? (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              setSavingOrder(true);
                              const payload = {
                                shippingAddress: localShipping,
                                items: localItems.map((i) => ({
                                  product:
                                    i.product && i.product._id
                                      ? i.product._id
                                      : i.product,
                                  quantity: Number(i.quantity || 1),
                                  price: Number(i.price || 0),
                                })),
                              };
                              const updated = await updateOrder(
                                order._id,
                                payload
                              );
                              setOrder(updated);
                              setLocalItems(
                                (updated.items || []).map((it) => ({
                                  product:
                                    it.product && it.product._id
                                      ? it.product._id
                                      : it.product || it._id,
                                  name: it.name,
                                  price: Number(it.price || 0),
                                  image: resolveAvatarSrc(
                                    it.image ||
                                      (it.product && it.product.image) ||
                                      null
                                  ),
                                  quantity: Number(it.quantity || 1),
                                }))
                              );
                              setIsEditingOrder(false);
                            } catch (err) {
                              console.error("Failed to save order", err);
                              alert(err.message || "Failed to save order");
                            } finally {
                              setSavingOrder(false);
                            }
                          }}
                          className="px-4 py-2 rounded bg-amber-600 text-white"
                        >
                          {savingOrder ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingOrder(false);
                            setLocalItems(
                              (order.items || []).map((it) => ({
                                product: it.product || it._id || it.productId,
                                name: it.name,
                                price: it.price,
                                image: resolveAvatarSrc(
                                  it.image ||
                                    (it.product && it.product.image) ||
                                    null
                                ),
                                quantity: Number(it.quantity || 1),
                              }))
                            );
                            setLocalShipping(order.shippingAddress || {});
                          }}
                          className="px-4 py-2 rounded border"
                        >
                          Cancel
                        </button>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProfilePage = () => {
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(
      resolveAvatarSrc(user?.avatar || null) ||
        generateAvatarDataUrl(user?.name || "")
    );
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [primaryAddress, setPrimaryAddress] = useState(
      user?.addresses?.[0] || { line1: "", city: "", state: "", zip: "" }
    );
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
      // If no user object yet
      if (!user) {
        // If there's no token either, redirect to login
        if (!token) {
          setPostLoginRedirect("profile");
          setCurrentPage("login");
        }
        // otherwise token exists but user not loaded yet — wait.
        return;
      }
      // sync local fields when user loads
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddresses(user.addresses || []);
      setPrimaryAddress(
        user.addresses && user.addresses[0]
          ? user.addresses[0]
          : { line1: "", city: "", state: "", zip: "" }
      );
      setAvatarPreview(
        resolveAvatarSrc(user.avatar || null) ||
          generateAvatarDataUrl(user.name || "")
      );
      setIsEditing(false);
    }, [user, token]);

    useEffect(() => {
      if (addresses && addresses[0]) setPrimaryAddress(addresses[0]);
    }, [addresses]);

    useEffect(() => {
      const loadOrders = async () => {
        try {
          setLoadingOrders(true);
          const data = await fetchMyOrders();
          setOrders(data || []);
        } catch (err) {
          console.error("Failed to load orders", err);
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };
      loadOrders();
    }, []);

    const save = async () => {
      try {
        setSaving(true);
        // ensure primaryAddress is included as the first address
        const newAddresses = Array.isArray(addresses) ? [...addresses] : [];
        if (!newAddresses[0] || typeof newAddresses[0] !== "object")
          newAddresses[0] = primaryAddress;
        else newAddresses[0] = primaryAddress;
        const payload = { phone, addresses: newAddresses };
        const updated = await updateProfile(payload);
        const normalized = updated
          ? { ...updated, avatar: resolveAvatarSrc(updated.avatar || null) }
          : updated;
        setUser(normalized);
        setAvatarPreview(
          resolveAvatarSrc(normalized?.avatar || null) ||
            generateAvatarDataUrl(normalized?.name || name || "")
        );
        setIsEditing(false);
        alert("Profile updated");
      } catch (err) {
        alert(err.message || "Failed to update profile");
      } finally {
        setSaving(false);
      }
    };

    const cancelEdit = () => {
      setName(user?.name || "");
      setPhone(user?.phone || "");
      setAddresses(user?.addresses || []);
      setPrimaryAddress(
        user?.addresses && user.addresses[0]
          ? user.addresses[0]
          : { line1: "", city: "", state: "", zip: "" }
      );
      setAvatarPreview(
        resolveAvatarSrc(user?.avatar || null) ||
          generateAvatarDataUrl(user?.name || "")
      );
      setIsEditing(false);
    };

    const addAddress = () => {
      setAddresses((prev) => [
        ...prev,
        { line1: "", city: "", state: "", zip: "" },
      ]);
    };

    const updateAddress = (idx, key, value) => {
      setAddresses((prev) =>
        prev.map((a, i) => (i === idx ? { ...a, [key]: value } : a))
      );
    };

    const removeAddress = (idx) => {
      setAddresses((prev) => prev.filter((_, i) => i !== idx));
    };

    const changePassword = async (e) => {
      e.preventDefault();
      try {
        setChangingPassword(true);
        // best-effort: call updateProfile with password fields; backend may implement it
        await updateProfile({ currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        alert("Password changed (if supported by server).");
      } catch (err) {
        alert(err.message || "Failed to change password");
      } finally {
        setChangingPassword(false);
      }
    };

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-stone-100"
        } py-20`}
      >
        <div className="max-w-5xl mx-auto px-4">
          <style>{`
            .profile-card { border-radius: 1rem; }
            .profile-input:focus { box-shadow: 0 0 0 4px rgba(253,224,71,0.12); outline: none; }
            .profile-action { transition: transform .18s ease, box-shadow .18s ease; }
            .profile-action:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(15,23,42,0.08); }
            .address-card { border-radius: 0.75rem; transition: box-shadow .15s ease; }
            .address-card:hover { box-shadow: 0 8px 20px rgba(15,23,42,0.06); }
            .order-item:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(15,23,42,0.05); }
          `}</style>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white profile-card shadow-lg">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-yellow-50 flex items-center justify-center overflow-hidden text-4xl font-extrabold text-amber-900 ring-4 ring-white">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user?.name || "D")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </div>
                <div className="mt-3 w-full text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {user?.name}
                  </div>
                </div>
                <div className="mt-4 w-full text-center">
                  <div className="text-sm text-gray-500">Signed in as</div>
                  <div
                    className={`font-semibold text-lg ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user?.email}
                  </div>
                </div>
                <div className="mt-6 w-full flex justify-center gap-3">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-full bg-amber-600 text-white shadow profile-action"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="p-6 bg-white profile-card shadow-lg">
                <div className="-mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white text-center font-semibold">
                    Profile
                  </div>
                </div>

                <div className="space-y-6">
                  <section>
                    <h4 className="text-lg font-semibold mb-3">Account</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">Name</label>
                        <input
                          value={name}
                          disabled
                          className="w-full p-3 rounded-lg border profile-input mt-1 bg-gray-50 text-gray-700"
                          title="Name cannot be changed"
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          Name cannot be changed here. Contact support if you
                          need to update it.
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <input
                          placeholder="e.g. 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditing}
                          className={`w-full p-3 rounded-lg border profile-input mt-1 ${
                            !isEditing
                              ? "bg-gray-50 text-gray-600"
                              : "focus:border-amber-500"
                          }`}
                        />
                        <div className="text-xs text-gray-400 mt-1">
                          We may use this number for delivery and notifications.
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        You can edit phone, addresses and password here.
                      </div>
                      <div className="flex gap-3">
                        {!isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-5 py-2 rounded-full border"
                          >
                            Edit profile
                          </button>
                        )}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-lg font-semibold mb-3">Address</h4>
                    <div className="p-4 border rounded mb-3">
                      <div className="text-sm text-gray-600 mb-2">
                        Primary address
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                        <input
                          placeholder="Address line"
                          value={primaryAddress.line1 || ""}
                          onChange={(e) =>
                            setPrimaryAddress((prev) => ({
                              ...prev,
                              line1: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className={`col-span-3 p-2 rounded border ${
                            !isEditing
                              ? "bg-gray-50 text-gray-600"
                              : "focus:border-amber-500"
                          }`}
                        />
                        <input
                          placeholder="City"
                          value={primaryAddress.city || ""}
                          onChange={(e) =>
                            setPrimaryAddress((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className={`col-span-1 p-2 rounded border ${
                            !isEditing
                              ? "bg-gray-50 text-gray-600"
                              : "focus:border-amber-500"
                          }`}
                        />
                        <input
                          placeholder="State"
                          value={primaryAddress.state || ""}
                          onChange={(e) =>
                            setPrimaryAddress((prev) => ({
                              ...prev,
                              state: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className={`col-span-1 p-2 rounded border ${
                            !isEditing
                              ? "bg-gray-50 text-gray-600"
                              : "focus:border-amber-500"
                          }`}
                        />
                        <input
                          placeholder="ZIP"
                          value={primaryAddress.zip || ""}
                          onChange={(e) =>
                            setPrimaryAddress((prev) => ({
                              ...prev,
                              zip: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className={`col-span-1 p-2 rounded border ${
                            !isEditing
                              ? "bg-gray-50 text-gray-600"
                              : "focus:border-amber-500"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {addresses.slice(1).map((a, idx) => (
                        <div
                          key={idx}
                          className="p-4 border address-card grid grid-cols-1 md:grid-cols-6 gap-2 items-center"
                        >
                          <input
                            placeholder="Address line"
                            value={a.line1 || ""}
                            onChange={(e) =>
                              updateAddress(idx + 1, "line1", e.target.value)
                            }
                            disabled={!isEditing}
                            className={`col-span-4 p-2 rounded border ${
                              !isEditing
                                ? "bg-gray-50 text-gray-600"
                                : "focus:border-amber-500"
                            }`}
                          />
                          <input
                            placeholder="City"
                            value={a.city || ""}
                            onChange={(e) =>
                              updateAddress(idx + 1, "city", e.target.value)
                            }
                            disabled={!isEditing}
                            className={`col-span-1 p-2 rounded border ${
                              !isEditing
                                ? "bg-gray-50 text-gray-600"
                                : "focus:border-amber-500"
                            }`}
                          />
                          {isEditing && (
                            <button
                              onClick={() => removeAddress(idx + 1)}
                              className="col-span-1 px-3 py-2 rounded border text-red-600"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                      {isEditing && (
                        <div className="flex gap-3">
                          <button
                            onClick={save}
                            disabled={saving}
                            className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow profile-action"
                          >
                            Save changes
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-5 py-2 rounded-full border"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h4 className="text-lg font-semibold mb-3">
                      Change password
                    </h4>
                    <form onSubmit={changePassword} className="space-y-3">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 rounded-lg border profile-input focus:border-amber-500"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 rounded-lg border profile-input focus:border-amber-500"
                      />
                      <div className="flex gap-3">
                        <button
                          disabled={changingPassword || !isEditing}
                          type="submit"
                          className="px-4 py-2 rounded bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow"
                        >
                          Change password
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPassword("");
                            setNewPassword("");
                          }}
                          className="px-4 py-2 rounded border"
                        >
                          Reset
                        </button>
                      </div>
                    </form>
                  </section>

                  <section>
                    <h4 className="text-lg font-semibold mb-3">
                      Recent Orders
                    </h4>
                    {loadingOrders ? (
                      <div className="text-gray-500">Loading orders…</div>
                    ) : orders.length === 0 ? (
                      <div className="text-gray-500">No recent orders.</div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 6).map((o) => (
                          <div
                            key={o._id}
                            className="flex justify-between items-center p-3 rounded-lg border order-item"
                          >
                            <div>
                              <div className="font-semibold">
                                {o.orderNumber || o._id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(o.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                रु{(o.total || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-amber-600">
                                {o.orderStatus}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [selectedOrderIdLocal, setSelectedOrderIdLocal] = useState(null);

    useEffect(() => {
      const load = async () => {
        try {
          setLoadingOrders(true);
          const data = await fetchMyOrders();
          setOrders(data);
        } catch (err) {
          console.error("Failed to load orders", err);
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };
      load();
    }, []);

    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-stone-100"
        } py-20`}
      >
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-3xl font-extrabold ${
                darkMode ? "text-white" : "text-amber-800"
              }`}
            >
              My Orders
            </h2>
            <div className="text-sm text-gray-500">
              {loadingOrders ? "Refreshing…" : `${orders.length} orders`}
            </div>
          </div>

          {loadingOrders ? (
            <div className="text-center py-12 text-gray-500">
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              You have no orders yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((o) => {
                const thumb = resolveAvatarSrc(
                  (o.items &&
                    o.items[0] &&
                    (o.items[0].image ||
                      (o.items[0].product && o.items[0].product.image))) ||
                    null
                );
                return (
                  <div
                    key={o._id}
                    className="relative rounded-2xl overflow-hidden bg-white shadow-lg transform transition hover:-translate-y-2"
                  >
                    <div
                      className="absolute -left-8 -top-8 w-40 h-40 bg-gradient-to-tr from-amber-100 to-yellow-50 opacity-80 rotate-12"
                      style={{ filter: "blur(24px)" }}
                    />
                    <div className="p-5 relative z-10 flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-xl bg-amber-50 flex items-center justify-center overflow-hidden">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt="product"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-2xl text-amber-600 font-bold">
                            JW
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-lg text-amber-800">
                              {o.orderNumber || o._id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(o.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-amber-800">
                              रु{(o.total || 0).toLocaleString()}
                            </div>
                            <div
                              className={`mt-1 inline-block px-3 py-1 rounded-full text-sm ${
                                o.orderStatus === "pending"
                                  ? "bg-yellow-100 text-amber-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {o.orderStatus}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                          {o.items && o.items.length
                            ? `${o.items.length} item${
                                o.items.length > 1 ? "s" : ""
                              } • ${o.items
                                .map((it) => it.name)
                                .slice(0, 2)
                                .join(", ")}`
                            : "No items data"}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-amber-50 bg-gradient-to-b from-white to-amber-50/30 flex items-center justify-between">
                      <div className="text-sm text-gray-500">Order total</div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openOrder(o._id)}
                          className="px-4 py-2 rounded-full bg-amber-600 text-white shadow-sm"
                        >
                          View
                        </button>
                        {o.orderStatus === "pending" && (
                          <button
                            type="button"
                            onClick={() => openOrder(o._id, true)}
                            className="px-4 py-2 rounded-full border border-amber-200 text-amber-700"
                          >
                            Edit Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProductsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const categories = [
      "All",
      "Necklaces",
      "Rings",
      "Bangles",
      "Earrings",
      "Bridal Sets",
      "Chains",
    ];

    const filteredProducts =
      selectedCategory === "All"
        ? products
        : products.filter((p) =>
            p.name.toLowerCase().includes(selectedCategory.toLowerCase())
          );

    return (
      <div
        className={`min-h-screen ${
          darkMode
            ? "bg-gray-900"
            : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
        }`}
      >
        <div
          className={`py-20 ${
            darkMode
              ? "bg-gray-900"
              : "bg-gradient-to-b from-stone-100 to-stone-50"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1
                className={`text-4xl md:text-5xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                All Products
              </h1>
              <p
                className={`text-xl ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Browse our complete collection of exquisite jewelry
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white shadow-lg scale-105"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-stone-100 text-gray-800 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`group relative ${
                    darkMode
                      ? "bg-gray-800"
                      : "bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100"
                  } rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300 border-2 ${
                    darkMode ? "border-gray-700" : "border-amber-200"
                  } hover:shadow-2xl`}
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="p-2 rounded-full bg-stone-100/90 backdrop-blur-sm hover:bg-stone-200 transition-colors shadow-lg">
                        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                    {product.rating === 5 && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-900" />
                          Top Rated
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(product.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span
                        className={`ml-2 text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        ({product.rating}.0)
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        रु{product.price.toLocaleString()}
                      </p>
                      <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          darkMode
                            ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        }`}
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductDetail(true);
                      }}
                      className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p
                  className={`text-2xl mb-4 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  No products found in {selectedCategory} category
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100"
      }`}
    >
      <Navbar />
      {currentPage === "home" && (
        <>
          <Hero />
          {/* Hero badge: Dwarika Collection */}
          <Statistics />
          <FeaturedCollection />
          <Testimonials />
        </>
      )}
      {currentPage === "products" && <ProductsPage />}
      {currentPage === "cart" && <CartPage />}
      {currentPage === "checkout" && <CheckoutPage />}
      {currentPage === "payment" && <PaymentPage />}
      {currentPage === "orderSuccess" && <OrderSuccessPage />}
      {currentPage === "profile" && <ProfilePage />}
      {currentPage === "myOrders" && <MyOrdersPage />}
      {currentPage === "orderDetail" && <OrderDetailPage />}
      {currentPage === "about" && <AboutPage />}
      {currentPage === "contact" && <ContactPage />}
      {currentPage === "search" && <SearchResultsPage />}
      {currentPage === "login" && <LoginPage />}
      {currentPage === "register" && <RegisterPage />}
      {currentPage === "registerSuccess" && (
        <div
          className={`min-h-screen ${
            darkMode ? "bg-gray-900" : "bg-stone-100"
          } py-20`}
        >
          <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold">Account created</h2>
            <p className="mt-4">
              {registerMessage ||
                "Please check your email for the link to set your password."}
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setCurrentPage("login")}
                className="px-4 py-2 rounded bg-amber-600 text-white"
              >
                Go to Login
              </button>
              <button
                onClick={() => setCurrentPage("home")}
                className="px-4 py-2 rounded border"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )}
      {currentPage === "verify" && <VerifyPage token={verifyToken} />}
      {currentPage === "setPassword" && (
        <SetPasswordPage token={setPasswordToken} />
      )}
      {currentPage === "forgotPassword" && <ForgotPasswordPage />}
      <Footer />
      {showProductDetail && <ProductDetailModal />}
    </div>
  );
}

export default App;
