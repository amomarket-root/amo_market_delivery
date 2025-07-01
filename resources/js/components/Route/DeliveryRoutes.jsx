import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../Template/Layout';
import PrivateRoute from './PrivateRoute';
import { SnackbarProvider } from '../Template/SnackbarAlert';

// Lazy load all components
const LoginPage = lazy(() => import('../Auth/LoginPage'));
const RegisterPage = lazy(() => import('../Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../Auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../Auth/ResetPasswordPage'));
const PermissionPage = lazy(() => import('../Permit/PermissionPage'));
const DashboardPage = lazy(() => import('../Home/DashboardPage'));
const NotFoundPage = lazy(() => import('../Template/NotFoundPage'));
const OrderDetailsPage = lazy(() => import('../Order/OrderDetailsPage'));
const OrderDetailsByIdPage = lazy(() => import('../Order/OrderDetailsByIdPage'));
const OrderDetailsWithShopDirectionPage = lazy(() => import('../Order/OrderDetailsWithShopDirectionPage'));
const OrderDetailsWithUserDirectionPage = lazy(() => import('../Order/OrderDetailsWithUserDirectionPage'));
const OrderWithUserDetailsPage = lazy(() => import('../Order/OrderWithUserDetailsPage'));
const AboutUsPage = lazy(() => import('../Information/AboutUsPage'));
const PrivacyPage = lazy(() => import('../Information/PrivacyPage'));
const TermsPage = lazy(() => import('../Information/TermsPage'));
const CareersPage = lazy(() => import('../Information/CareersPage'));
const SecurityPage = lazy(() => import('../Information/SecurityPage'));
const ShopPageInfo = lazy(() => import('../Information/ShopPageInfo'));
const DeliveryPageInfo = lazy(() => import('../Information/DeliveryPageInfo'));
const BlogPage = lazy(() => import('../Information/BlogPage'));
const BlogDetailsPage = lazy(() => import('../Information/BlogDetailsPage'));
const DeliveryPersonBankAccount = lazy(() => import('../BankAccount/DeliveryPersonBankAccount'));

const DeliveryRoutes = () => {
    return (
        <Suspense fallback={
            <div className="loader-container">
                <img src="/image/loader.gif" alt="Loading..." className="loader" />
            </div>
        }>
                <SnackbarProvider>
                    <Routes>
                        {/* Redirect from / to /login */}
                        <Route path="/" element={<LoginPage />} />

                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
                        <Route path="/reset_password" element={<ResetPasswordPage />} />

                        {/* Static Pages */}
                        <Route path="/about_us" element={<Layout><AboutUsPage /></Layout>} />
                        <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
                        <Route path="/careers" element={<Layout><CareersPage /></Layout>} />
                        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
                        <Route path="/security" element={<Layout><SecurityPage /></Layout>} />
                        <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
                        <Route path="/blog_details/:blogId" element={<Layout><BlogDetailsPage /></Layout>} />
                        <Route path="/shop-info" element={<Layout><ShopPageInfo /></Layout>} />
                        <Route path="/delivery-info" element={<Layout><DeliveryPageInfo /></Layout>} />

                        {/* Private Routes */}
                        <Route path="/dashboard" element={
                            <PrivateRoute>
                                <Layout><DashboardPage /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/permission" element={
                            <PrivateRoute>
                                <Layout><PermissionPage /></Layout>
                            </PrivateRoute>
                        } />

                        {/* Order Routes */}
                        <Route path="/order-details" element={
                            <PrivateRoute>
                                <Layout><OrderDetailsPage /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/order-details/:orderId" element={
                            <PrivateRoute>
                                <Layout><OrderDetailsByIdPage /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/order-details-with-shop-direction/:orderId" element={
                            <PrivateRoute>
                                <Layout><OrderDetailsWithShopDirectionPage /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/order-details-with-user-direction/:orderId" element={
                            <PrivateRoute>
                                <Layout><OrderDetailsWithUserDirectionPage /></Layout>
                            </PrivateRoute>
                        } />
                        <Route path="/order-with-user-details/:orderId" element={
                            <PrivateRoute>
                                <Layout><OrderWithUserDetailsPage /></Layout>
                            </PrivateRoute>
                        } />

                        <Route path="/delivery-person-bank-account" element={
                            <PrivateRoute>
                                <Layout><DeliveryPersonBankAccount /></Layout>
                            </PrivateRoute>
                        } />

                        {/* 404 Route */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </SnackbarProvider>
        </Suspense>
    );
};

export default DeliveryRoutes;
