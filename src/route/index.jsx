import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import LandingPage from "../pages/LandingPage";
import SearchP from "../pages/SearchP";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/ResetPassword";
import UserMenuMobile from "../pages/UserMenuMobile";
import Dashboard from "../admin/Dashboard";
import Profile from "../pages/Profile";
import MyOrders from "../pages/MyOrders";
import Address from "../pages/Address";
import ProductList from "../pages/ProductList";
import ProductDisplay from "../pages/ProductDisplay";
import CartMobile from "../pages/CartMobile";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import Cancel from "../pages/Cancel";
import OrderDetails from "../pages/OrderDetails";
import VerifyEmail from "../pages/VerifyEmail";
import AccountPrivacy from "../pages/AccountPrivacy";
import ShopNowRedirect from "../pages/ShopNowRedirect";
import Wishlist from "../pages/Wishlist";
import ContactUs from "../pages/ContactUs";
import FAQ from "../pages/FAQ";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import ShippingReturns from "../pages/ShippingReturns";
import ComingSoon from "../pages/ComingSoon";
import NewArrivals from "../pages/NewArrivals";

// Delivery portal
import DeliveryBoyDashboard from "../pages/DeliveryBoyDashboard";
import DeliveryLayout from "../components/DeliveryLayout";
import DeliveryNotifications from "../pages/DeliveryNotifications";
import DeliveryOrderDetails from "../pages/DeliveryOrderDetails";

// Admin portal
import AdminLayout from "../components/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import Category from "../pages/Category";
import SubCategory from "../pages/SubCategory";
import UploadProduct from "../pages/UploadProduct";
import ProductAdmin from "../pages/ProductAdmin";
import AdminOrders from "../pages/AdminOrders";
import BannerAdmin from "../pages/BannerAdmin";
import ManageUsers from "../pages/ManageUsers";
import Coupons from "../pages/Coupon";
import AdminReviews from "../pages/AdminReviews";
import AdminNotifications from "../pages/AdminNotifications";
import AdminOrderDetails from "../pages/AdminOrderDetails";
import FestivalOfferAdmin from "../pages/FestivalOfferAdmin";
import AdminLandingPage from "../pages/AdminLandingPage";
import AdminMessages from "../pages/AdminMessages";

const router = createBrowserRouter([
    // ─── Delivery Boy Portal ───────────────────────────────────────────────
    {
        path: "delivery-portal",
        element: <DeliveryLayout />,
        children: [
            { path: "dashboard", element: <DeliveryBoyDashboard /> },
            { path: "notifications", element: <DeliveryNotifications /> },
            { path: "order/:orderId", element: <DeliveryOrderDetails /> }
        ]
    },

    // ─── Admin Portal ──────────────────────────────────────────────────────
    {
        path: "admin-portal",
        element: <AdminLayout />,
        children: [
            { path: "dashboard",       element: <AdminDashboard /> },
            { path: "category",        element: <Category /> },
            { path: "subcategory",     element: <SubCategory /> },
            { path: "upload-product",  element: <UploadProduct /> },
            { path: "product",         element: <ProductAdmin /> },
            { path: "orders",          element: <AdminOrders /> },
            { path: "banners",         element: <BannerAdmin /> },
            { path: "manage-users",    element: <ManageUsers /> },
            { path: "coupons",         element: <Coupons /> },
            {
                path: "order/:orderId",
                element: <AdminOrderDetails />
            },
            { path: "reviews",         element: <AdminReviews /> },
            { path: "notifications",   element: <AdminNotifications /> },
            { path: "festival-offers", element: <FestivalOfferAdmin /> },
            { path: "landing-page",    element: <AdminLandingPage /> },
            { path: "messages",        element: <AdminMessages /> },
        ]
    },

    // ─── Customer / User App ───────────────────────────────────────────────
    {
        path: "/",
        element: <App />,
        children: [
            { path: "",                element: <LandingPage /> },
            { path: "home",            element: <Home /> },
            { path: "search",          element: <SearchP /> },
            { path: "login",           element: <Login /> },
            { path: "register",        element: <Register /> },
            { path: "forgot-password", element: <ForgotPassword /> },
            { path: "verification-otp",element: <OtpVerification /> },
            { path: "reset-password",  element: <ResetPassword /> },
            { path: "verify-email",    element: <VerifyEmail /> },
            { path: "shop-now",        element: <ShopNowRedirect /> },
            { path: "user-menu",       element: <UserMenuMobile /> },

            // User dashboard (profile, orders, address, wishlist)
            {
                path: "dashboard",
                element: <Dashboard />,
                children: [
                    { path: "profile",   element: <Profile /> },
                    { path: "myorders",  element: <MyOrders /> },
                    { path: "address",   element: <Address /> },
                    {
                        path: "order-details/:orderId",
                        element: <OrderDetails />
                    },
                    { path: "privacy",   element: <AccountPrivacy /> },
                    { path: "wishlist",  element: <Wishlist /> },
                ]
            },

            // Product browsing
            {
                path: ":category",
                children: [
                    { path: ":subCategory", element: <ProductList /> }
                ]
            },
            { path: "product/:product", element: <ProductDisplay /> },
            { path: "cart",             element: <CartMobile /> },
            { path: "checkout",         element: <CheckoutPage /> },
            { path: "success",          element: <Success /> },
            { path: "cancel",           element: <Cancel /> },
            { path: "wishlist",         element: <Wishlist /> },
            { path: "contact",          element: <ContactUs /> },
            { path: "faq",              element: <FAQ /> },
            { path: "privacy",          element: <PrivacyPolicy /> },
            { path: "terms",            element: <TermsOfService /> },
            { path: "shipping-returns", element: <ShippingReturns /> },
            { path: "new-arrivals",     element: <NewArrivals /> },
            { path: "best-sellers",     element: <ComingSoon title="Best Sellers" subtitle="Our most popular premium products will be curated here soon." /> },
            { path: "gift-cards",       element: <ComingSoon title="Gift Cards" subtitle="Give the gift of luxury. Electronic gift cards will be available soon." /> },
        ]
    },
]);

export default router