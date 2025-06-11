import { ReactNode, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigationType } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ShopProducts from './pages/ShopProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

import VerificationPending from './pages/auth/VerificationPending';

import PasswordReset from './pages/auth/PasswordReset';
import VerifyEmail from './pages/auth/VerifyEmail';

import Register from './pages/auth/Register';
import WishList from './pages/WishList';


// import Wholesale from './pages/Wholesale';

import BecomeMerchant from './pages/BecomeMerchant';
import Order from './pages/Order';
import TrackOrder from './pages/TrackOrder';
import NewProduct from './pages/NewProduct';
import BusinessLogin from './pages/auth/BusinessLogin';
import RegisterBusiness from './pages/auth/RegisterBusiness';

import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AdminLayout from './components/business/AdminLayout';

import Dashboard from "./pages/superadmin/Dashboard";
import UserActivity from './pages/superadmin/UserActivity';
import UserManagement from './pages/superadmin/Usermanagement';
import ContentModeration from './pages/superadmin/ContentModeration';
import ProductMonitoring from './pages/superadmin/ProductMonitoring';

import TrafficAnalytics from './pages/superadmin/TrafficAnalytics';
import SalesReportPage from './pages/superadmin/SalesReport';
import FraudDetection from './pages/superadmin/FraudDetection';
import MarketplaceHealth from './pages/superadmin/MarketplaceHealth';
import MerchantAnalytics from './pages/superadmin/MerchantAnalytics';
import PlatformPerformance from './pages/superadmin/PlatformPerformance';
import MerchantManagement from './pages/superadmin/MerchantManagement';
import Notification from './pages/superadmin/Notifications';
import Categories from './pages/superadmin/Categories';
import Attribute from './pages/superadmin/Attribute';
import BrandCreation from './pages/superadmin/BrandCreation';
import HomepageSettings from './pages/superadmin/HomepageSettings';

import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import ShippingPolicy from './pages/ShippingPolicy';
import Returns from './pages/Returns';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import Terms from './pages/Terms';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import MerchantDetails from './pages/superadmin/MerchantDetails';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import Brands from './components/home/brands';
import Inventory from './pages/business/Inventory';
import VerificationStatus from './pages/business/VerificationStatus';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CancellationPolicy from './pages/CancellationPolicy';
import ReturnRefund from './pages/ReturnRefund';
import ShippingDelivery from './pages/ShippingDelivery';
import UserProfile from './pages/UserProfile';
import PaymentPage from './pages/PaymentPage';
import MessengerPopup from './components/MessengerPopup';
import Refund from './pages/Refund';
import Exchange from './pages/Exchange';
import Review from './pages/Review';
import LiveShop from './pages/LiveShop';
import FashionPage from './components/sections/Fashionpage';
import AoinLivePage from './components/sections/AoinLivePage';
import ComingSoonPage from './components/sections/ComingSoonPage';
import FashionFactoryPage from './components/sections/FashionFactoryPage';
import SundayFundayPage from './components/sections/SundayFundayPage';
import LiveShopProductDetailPage from './pages/LiveShopProductDetailPage';
import Reviews from './pages/business/Reviews';
import SalesReport from './pages/business/reports/SalesReport';
import CustomersReport from './pages/business/reports/CustomersReport';
import ProductsReport from './pages/business/reports/ProductsReport';
import Settings from './pages/business/Settings';
import Support from './pages/business/Support';
import { WishlistProvider } from './context/WishlistContext';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import Subscription from './pages/business/Subscription';

import FeaturedProductsPage from './pages/FeaturedProductsPage';
import PromoProductsPage from './pages/PromoProductsPage';

import UserSupport from './pages/superadmin/UserSupport';
import MerchantSupport from './pages/superadmin/MerchantSupport';
import RaiseTicket from './pages/RaiseTicket';


// Lazy-loaded business dashboard pages
const BusinessDashboard = lazy(() => import('./pages/business/Dashboard'));
const BusinessProducts = lazy(() => import('./pages/business/catalog/Products'));
const BusinessOrders = lazy(() => import('./pages/business/Orders'));
const BusinessCustomers = lazy(() => import('./pages/business/Customers'));
const Verification = lazy(() => import('./pages/business/Verification'));
const ProductPlacements = lazy(() => import('./pages/business/ProductPlacements')); 

// Lazy-loaded catalog pages
const CatalogProducts = lazy(() => import('./pages/business/catalog/Products'));
const AddProducts = lazy(() => import('./pages/business/catalog/product/steps/AddProducts'));
const EditProduct = lazy(() => import('./pages/business/catalog/product/components/EditProduct'));

const LoadingFallback = () => (
  <div className="w-full h-full min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Custom hook for scroll management
const useScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Force scroll reset on every navigation
    const resetScroll = () => {
      // Reset scroll position using multiple methods for maximum compatibility
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      // Force layout recalculation
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 0);
    };

    // Reset scroll immediately
    resetScroll();

    // Reset scroll again after a short delay to ensure it works
    const timeoutId = setTimeout(resetScroll, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, navigationType]);
};

// ScrollToTop component to handle scroll behavior
const ScrollToTop = () => {
  useScrollToTop();
  return null;
};

interface ProtectedRouteProps {
  children: ReactNode;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Main App component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Router>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
                <Routes>
                  {/* Business Dashboard Routes */}
                  <Route path="/business" element={<AdminLayout />}>
                    <Route
                      index
                      element={<Navigate to="/business/dashboard" replace />}
                    />
                    <Route
                      path="dashboard"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <BusinessDashboard />
                        </Suspense>
                      }
                    />
                    <Route
                      path="subscription"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Subscription />
                        </Suspense>
                      }
                    />
                    <Route
                      path="products"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <BusinessProducts />
                        </Suspense>
                      }
                    />
                    <Route
                      path="inventory"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Inventory />
                        </Suspense>
                      }
                    />
                    <Route
                      path="verification"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Verification />
                        </Suspense>
                      }
                    />
                    <Route
                      path="verification-pending"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <VerificationStatus />
                        </Suspense>
                      }
                    />
                    <Route
                      path="orders"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <BusinessOrders />
                        </Suspense>
                      }
                    />
                    <Route
                      path="customers"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <BusinessCustomers />
                        </Suspense>
                      }
                    />
                    <Route
                      path="reviews"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Reviews />
                        </Suspense>
                      }
                    />

                    <Route
                      path="reports/sales"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <SalesReportPage />
                        </Suspense>
                      }
                    />

                    <Route
                      path="reports/customers"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <CustomersReport />
                        </Suspense>
                      }
                    />

                    <Route
                      path="reports/products"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ProductsReport />
                        </Suspense>
                      }
                    />

                    <Route
                      path="settings"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Settings />
                        </Suspense>
                      }
                    />

                    <Route
                      path="support"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Support />
                        </Suspense>
                      }
                    />

                    {/* Catalog Routes */}
                    <Route path="catalog">
                      <Route
                        path="products"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <CatalogProducts />
                          </Suspense>
                        }
                      />
                      <Route
                        path="product/new"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <AddProducts />
                          </Suspense>
                        }
                      />
                      <Route
                        path="product/:id/view"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <AddProducts mode="view" />
                          </Suspense>
                        }
                      />
                      <Route
                        path="product/:id/edit"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <EditProduct />
                          </Suspense>
                        }
                      />
                    </Route>

                    <Route
                      path="product-placements" 
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ProductPlacements />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* Superadmin Routes - Protected by role check in the component */}
                  <Route path="/superadmin" element={<SuperAdminLayout />}>
                    <Route
                      index
                      element={<Navigate to="/superadmin/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route
                      path="user-activity-overview"
                      element={<UserActivity />}
                    />
                    <Route path="user-management" element={<UserManagement />} />

                    <Route path="content-moderation" element={<ContentModeration />} />
                    <Route path="product-monitoring" element={<ProductMonitoring />} />
                    <Route path="site-traffic-analytics" element={<TrafficAnalytics />} />

                    <Route path="sales-reports" element={<SalesReportPage />} />
                    <Route path="fraud-detection" element={<FraudDetection />} />
                    <Route
                      path="marketplace-health"
                      element={<MarketplaceHealth />}
                    />
                    <Route
                      path="merchant-analytics"
                      element={<MerchantAnalytics />}
                    />
                    <Route
                      path="platform-performance"
                      element={<PlatformPerformance />}
                    />
                    <Route
                      path="merchant-management"
                      element={<MerchantManagement />}
                    />
                    <Route
                      path="merchant-management/:id"
                      element={<MerchantDetails />}
                    />
                    <Route path="categories" element={<Categories />} />
                    <Route path="brand-creation" element={<BrandCreation />} />
                    <Route path="attribute" element={<Attribute />} />
                    <Route path="homepage-settings" element={<HomepageSettings />} />
                    <Route path="user-support" element={<UserSupport />} />
                    <Route path="merchant-support" element={<MerchantSupport />} />
                  </Route>

                  {/* Public Routes with header/footer */}
                  <Route
                    path="/*"
                    element={
                      <>
                        <Navbar />
                        <main className="flex-grow content-container">
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/all-products" element={<Products />} />
                            <Route path="/featured-products" element={<FeaturedProductsPage />} />
                            <Route path="/promo-products" element={<PromoProductsPage />} />
                            <Route path="/shop/:shopId" element={<ShopProducts />} />
                            <Route path="/products/:categoryId" element={<Products />} />
                            <Route path="/product/:productId" element={<ProductDetail />} />
                            <Route path="/new-product" element={<NewProduct />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/payment" element={<PaymentPage />} />
                            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route
                              path="/verification-pending"
                              element={<VerificationPending />}
                            />
                            <Route
                              path="/verify-email/:token"
                              element={<VerifyEmail />}
                            />
                            <Route
                              path="/business/login"
                              element={<BusinessLogin />}
                            />
                            <Route
                              path="/register-business"
                              element={<RegisterBusiness />}
                            />

                            <Route
                              path="/password/reset"
                              element={<PasswordReset />}
                            />

                            <Route path="/wishlist" element={<WishList />} />

                           
                            {/* <Route path="/wholesale" element={<Wholesale />} /> */}

                            <Route path="/sign-in" element={<SignIn />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/superadmin/login" element={<SuperAdminLogin />} />
                            <Route
                              path="/become-merchant"
                              element={<BecomeMerchant />}
                            />
                            <Route path="/orders" element={<Order />} />
                            <Route path="/track-order" element={<TrackOrder />} />
                            <Route path="/track/:orderId" element={<TrackOrder />} />
                            <Route path="/refund/:orderId" element={<Refund />} />
                            <Route path="/exchange/:orderId" element={<Exchange />} />
                            <Route path="/review/:orderId" element={<Review />} />
                            <Route
                              path="/categories/:categoryId"
                              element={<Products />}
                            />
                            <Route
                              path="/categories/:categoryId/:brandId"
                              element={<Products />}
                            />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route
                              path="/shipping"
                              element={<ShippingPolicy />}
                            />
                            <Route path="/returns" element={<Returns />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/cookies" element={<Cookies />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route
                              path="/privacy-policy"
                              element={<PrivacyPolicy />}
                            />
                            <Route
                              path="/cancellation-policy"
                              element={<CancellationPolicy />}
                            />
                            <Route
                              path="/return-refund"
                              element={<ReturnRefund />}
                            />
                            <Route
                              path="/shipping-delivery"
                              element={<ShippingDelivery />}
                            />
                            <Route path="/RaiseTicket" element={<RaiseTicket />} />
                            <Route path="/brands/:brandId" element={<Brands />} />
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/live-shop" element={<LiveShop />} />
                            <Route path="/live-shop/fashion" element={<FashionPage />} />
                            <Route path="/live-shop/aoin-live" element={<AoinLivePage />} />
                            <Route path="/live-shop/coming-soon" element={<ComingSoonPage />} />
                            <Route path="/live-shop/fashion-factory" element={<FashionFactoryPage />} />
                            <Route path="/live-shop/sunday-funday" element={<SundayFundayPage />} />
                            <Route path="/live-shop/product/:productId" element={<LiveShopProductDetailPage />} />
                          </Routes>
                        </main>
                        <Footer />
                      </>
                    }
                  />

                  {/* Add this route outside of /business and /superadmin, so it's public */}
                  
                </Routes>
              </div>
              {/* Add MessengerPopup here, outside of routes so it appears on all pages */}
              <MessengerPopup />
            </Router>

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                },
                error: {
                  duration: 4000,
                },
              }}
            />
          </GoogleOAuthProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;