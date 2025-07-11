import { useEffect, lazy, Suspense } from 'react';
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
import ShippingMethods from './pages/ShippingMethods';
import Shop1LandingPage from './pages/Shop1LandingPage';
import Shop2LandingPage from './pages/Shop2LandingPage';
import Shop3LandingPage from './pages/Shop3LandingPage';
import VerificationPending from './pages/auth/VerificationPending';
import TrendyDealsPage from './pages/TrendyDealsPage';

import PasswordReset from './pages/auth/PasswordReset';
import VerifyEmail from './pages/auth/VerifyEmail';
import RequestPasswordReset from './pages/auth/RequestPasswordReset';

import Register from './pages/auth/Register';
import WishList from './pages/WishList';
import Games from './pages/Games';

// import Wholesale from './pages/Wholesale';

import BecomeMerchant from './pages/BecomeMerchant';
import Order from './pages/Order';
import TrackOrder from './pages/TrackOrder';
import NewProduct from './pages/NewProduct';
import BusinessLogin from './pages/auth/BusinessLogin';
import RegisterBusiness from './pages/auth/RegisterBusiness';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AdminLayout from './components/business/AdminLayout';

import Dashboard from "./pages/superadmin/Dashboard";
import UserActivity from './pages/superadmin/UserActivity';
import UserManagement from './pages/superadmin/Usermanagement';
import ContentModeration from './pages/superadmin/ContentModeration';
import ProductMonitoring from './pages/superadmin/ProductMonitoring';
import Settings from './pages/superadmin/Settings';
import RefundAndReturnManagement from './pages/superadmin/RefundAndReturnManagement';
import PaymentAndTransactionMonitoring from './pages/superadmin/PaymentAndTransaction';
import Promotions from './pages/superadmin/Promotions';

import TrafficAnalytics from './pages/superadmin/TrafficAnalytics';
import SalesReportPage from './pages/superadmin/SalesReport';
import FraudDetection from './pages/superadmin/FraudDetection';
import MarketplaceHealth from './pages/superadmin/MarketplaceHealth';
import PlatformPerformance from './pages/superadmin/PlatformPerformance';
import MerchantManagement from './pages/superadmin/MerchantManagement';
import Notification from './pages/superadmin/Notifications';
import GSTRuleManagement from './pages/superadmin/GSTRuleManagement';
import Categories from './pages/superadmin/Categories';
import Attribute from './pages/superadmin/Attribute';
import BrandCreation from './pages/superadmin/BrandCreation';
import HomepageSettings from './pages/superadmin/HomepageSettings';
import Shop1Productpage from './pages/Shop1Productpage';
import Shop2Productpage from './pages/Shop2Productpage';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import ShippingPolicy from './pages/ShippingPolicy';
import Returns from './pages/Returns';
import Privacy from './pages/Privacy';
import CookiesPage from './pages/Cookies';
import Terms from './pages/Terms';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import MerchantDetails from './pages/superadmin/MerchantDetails';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import Profile from './pages/superadmin/Profile';
import YouTubeManagement from './pages/superadmin/YouTubeManagement';
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
import Sales from './pages/business/reports/Sales';
import CustomersReport from './pages/business/reports/CustomersReport';
import ProductsReport from './pages/business/reports/ProductsReport';
import Support from './pages/business/Support';
import Settingss from './pages/business/Settings';
import Profilee from './pages/business/Profile';
import { WishlistProvider } from './context/WishlistContext';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import Subscription from './pages/business/Subscription';

import FeaturedProductsPage from './pages/FeaturedProductsPage';
import PromoProductsPage from './pages/PromoProductsPage';

import UserSupport from './pages/superadmin/UserSupport';
import MerchantSupport from './pages/superadmin/MerchantSupport';
import RaiseTicket from './pages/RaiseTicket';

import { useVisitTracking } from './hooks/useVisitTracking';
import SearchResultsPage from './pages/SearchResultsPage';
import MerchantPaymentReport from './pages/superadmin/reports/MerchantPaymentReport';
import MerchantSubscription from './pages/MerchantSubscription';

import Aoinlive from './pages/business/Aoinlive';

// Lazy-loaded business dashboard pages
const BusinessDashboard = lazy(() => import('./pages/business/Dashboard'));
const BusinessProducts = lazy(() => import('./pages/business/catalog/Products'));
const BusinessOrders = lazy(() => import('./pages/business/Orders'));
const BusinessOrderDetail = lazy(() => import('./pages/business/OrderDetail'));
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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Create a wrapper component for visit tracking
const VisitTracker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { markAsConverted } = useVisitTracking();

  // Add this to your login/signup success handler
  const handleAuthSuccess = (userId: string) => {
    markAsConverted(userId);
    // ... rest of your auth success handling
  };

  return <>{children}</>;
};

// Main App component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Router>
              <VisitTracker>
                <ScrollToTop />
                <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
                  <Routes>
                    <Route path="/shop1" element={<Shop1LandingPage />} />
                    <Route path="/shop2" element={<Shop2LandingPage />} />
                    <Route path="/shop3" element={<Shop3LandingPage />} />
                    <Route path="/shop1-productpage" element={<Shop1Productpage />} />
                    <Route path="/shop2-productpage" element={<Shop2Productpage />} />
                    <Route
                      path="/business/login"
                      element={<BusinessLogin />}
                    />
                    <Route
                      path="/register-business"
                      element={<RegisterBusiness />}
                    />
                    <Route
                      path="/request-password-reset"
                      element={<RequestPasswordReset />}
                    />
                    <Route path="/superadmin/login" element={<SuperAdminLogin />} />
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
                        path="orders/:orderId"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <BusinessOrderDetail />
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
                            <Sales />
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
                            <Settingss />
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

                      <Route
                        path="profile"
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <Profilee />
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
                          path="aoinlive"
                          element={
                            <Suspense fallback={<LoadingFallback />}>
                              <Aoinlive />
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
                        path="user-report"
                        element={<UserActivity />}
                      />
                      <Route path="users" element={<UserManagement />} />

                      <Route path="content-moderation" element={<ContentModeration />} />
                      <Route path="products" element={<ProductMonitoring />} />
                      <Route path="site-report" element={<TrafficAnalytics />} />

                    <Route path="sales-report" element={<SalesReportPage />} />
                    <Route path="fraud-detection" element={<FraudDetection />} />
                    <Route
                      path="marketplace-health"
                      element={<MarketplaceHealth />}
                    />
                    <Route
                      path="merchant-payment-report"
                      element={<MerchantPaymentReport />}
                    />
                    <Route
                      path="performance"
                      element={<PlatformPerformance />}
                    />
                    <Route
                      path="merchants"
                      element={<MerchantManagement />}
                    />
                    <Route
                      path="merchant-management/:id"
                      element={<MerchantDetails />}
                    />
                    <Route path="categories" element={<Categories />} />
                    <Route path="brands" element={<BrandCreation />} />
                    <Route path="attribute" element={<Attribute />} />
                    <Route path="homepages" element={<HomepageSettings />} />
                    <Route path="user-support" element={<UserSupport />} />
                    <Route path="merchant-support" element={<MerchantSupport />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="refund-and-return" element={<RefundAndReturnManagement />} />
                    <Route path="payments" element={<PaymentAndTransactionMonitoring />} />
                    <Route path="promotions" element={<Promotions />} />
                    <Route path="gst-management" element={<GSTRuleManagement />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="merchant-subscriptions" element={<MerchantSubscription />} />
                    <Route path="youtube-integration" element={<YouTubeManagement />} />
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
                              <Route path="/trendy-deals" element={<TrendyDealsPage />} />
                              <Route path="/shop/:shopId" element={<ShopProducts />} />
                              <Route path="/products/:categoryId" element={<Products />} />
                              <Route path="/product/:productId" element={<ProductDetail />} />
                              <Route path="/new-product" element={<NewProduct />} />
                              <Route path="/cart" element={<Cart />} />
                              <Route path="/payment" element={<PaymentPage />} />
                              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                              <Route path="/search" element={<SearchResultsPage />} />
                              <Route path="/search/:query" element={<Products />} />

                              {/* These routes will have Navbar and Footer */}
                              <Route path="/signup" element={<SignUp />} />
                              <Route
                                path="/verification-pending"
                                element={<VerificationPending />}
                              />
                              <Route path="settings" element={<Settingss />} />
                              <Route
                                path="/verify-email/:token"
                                element={<VerifyEmail />}
                              />


                              <Route
                                path="/password/reset"
                                element={<PasswordReset />}
                              />


                              <Route path="/wishlist" element={<WishList />} />
                              <Route path="/games" element={<Games />} />

                              {/* <Route path="/wholesale" element={<Wholesale />} /> */}

                              <Route path="/sign-in" element={<SignIn />} />
                              <Route path="/register" element={<Register />} />

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
                              <Route path="/cookies" element={<CookiesPage />} />
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
                              <Route path="/shipping-methods" element={<ShippingMethods />} />
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
              </VisitTracker>
            </Router>

            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: "#FFEDD5",        // Tailwind orange-100 (soft warm background)
                  color: "#EA580C",             // Tailwind orange-600 (professional tone)
                  padding: "12px 20px",
                  borderRadius: "0.5rem",       // rounded-lg for softer edges
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // soft neutral shadow
                  fontWeight: "500",            // medium weight for readability
                  fontSize: "0.875rem",         // text-sm
                  minWidth: "260px",
                  textAlign: "center",
                  border: "1px solid #FDBA74",  // subtle border using orange-300
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