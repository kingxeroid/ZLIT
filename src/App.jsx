import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import PaymentCallback from "./pages/customer/PaymentCallback";

const Home = lazy(() => import("./pages/customer/Home"));
const Shop = lazy(() => import("./pages/customer/Shop"));
const ProductDetails = lazy(() => import("./pages/customer/ProductDetails"));
const Collections = lazy(() => import("./pages/customer/Collections"));
const Lookbook = lazy(() => import("./pages/customer/Lookbook"));
const Cart = lazy(() => import("./pages/customer/Cart"));
const Checkout = lazy(() => import("./pages/customer/Checkout"));
const Wishlist = lazy(() => import("./pages/customer/Wishlist"));
const Orders = lazy(() => import("./pages/customer/Orders"));
const OrderDetails = lazy(() => import("./pages/customer/OrderDetails"));
const Profile = lazy(() => import("./pages/customer/Profile"));
const NotFound = lazy(() => import("./pages/customer/NotFound"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const Inventory = lazy(() => import("./pages/admin/Inventory"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const AdminCollections = lazy(() => import("./pages/admin/Collections"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const Messages = lazy(() => import("./pages/admin/Messages"));
const Newsletter = lazy(() => import("./pages/admin/Newsletter"));
const AdminLookbook = lazy(() => import("./pages/admin/Lookbook"));
const ActivityLogs = lazy(() => import("./pages/admin/ActivityLogs"));
const Settings = lazy(() => import("./pages/admin/Settings"));

function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#171719]">
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-5xl font-black tracking-tighter text-white"
      >
        ZL<span className="text-[#C8102E]">IT</span>
      </motion.div>

      <div className="mt-8 h-[3px] w-32 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full w-full origin-left rounded-full bg-[#C8102E]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/40">
        Loading experience
      </p>
    </div>
  );
}

function ProtectedRoute({ children, admin = false }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile || !profile.is_active) return <Navigate to="/login" replace />;
  if (admin && profile.role !== "admin") return <Navigate to="/" replace />;
  return children || <Outlet />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return <AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: "easeOut" }}><Suspense fallback={<PageLoader />}><Routes location={location}>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/collections" element={<Collections />} />
      <Route path="/lookbook" element={<Lookbook />} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/payment/callback" element={<PaymentCallback />}/>
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Route>
    <Route element={<ProtectedRoute admin><AdminLayout /></ProtectedRoute>}>
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/products/add" element={<AddProduct />} />
      <Route path="/admin/products/edit/:id" element={<EditProduct />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/customers" element={<AdminCustomers />} />
      <Route path="/admin/inventory" element={<Inventory />} />
      <Route path="/admin/categories" element={<Categories />} />
      <Route path="/admin/collections" element={<AdminCollections />} />
      <Route path="/admin/reviews" element={<Reviews />} />
      <Route path="/admin/coupons" element={<Coupons />} />
      <Route path="/admin/messages" element={<Messages />} />
      <Route path="/admin/newsletter" element={<Newsletter />} />
      <Route path="/admin/lookbook" element={<AdminLookbook />} />
      <Route path="/admin/activity" element={<ActivityLogs />} />
      <Route path="/admin/settings" element={<Settings />} />
    </Route>
  </Routes></Suspense></motion.div></AnimatePresence>;
}

export default function App() { return <AnimatedRoutes />; }
