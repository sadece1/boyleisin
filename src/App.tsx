import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useThemeStore } from '@/store/themeStore';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SecurityProvider } from '@/components/SecurityProvider';
import { ContactToolbar } from '@/components/ContactToolbar';
import { FastNavigation } from '@/components/FastNavigation';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { routes } from '@/config';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const BlogPage = lazy(() => import('@/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogDetailsPage = lazy(() => import('@/pages/BlogDetailsPage').then(m => ({ default: m.BlogDetailsPage })));
const GearPage = lazy(() => import('@/pages/GearPage').then(m => ({ default: m.GearPage })));
const GearDetailsPage = lazy(() => import('@/pages/GearDetailsPage').then(m => ({ default: m.GearDetailsPage })));
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const CategoryPage = lazy(() => import('@/pages/CategoryPage').then(m => ({ default: m.CategoryPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ReferencesPage = lazy(() => import('@/pages/ReferencesPage').then(m => ({ default: m.ReferencesPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Admin Pages - Lazy loaded
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminCampsitesPage = lazy(() => import('@/pages/admin/AdminCampsitesPage').then(m => ({ default: m.AdminCampsitesPage })));
const AddCampsitePage = lazy(() => import('@/pages/admin/AddCampsitePage').then(m => ({ default: m.AddCampsitePage })));
const EditCampsitePage = lazy(() => import('@/pages/admin/EditCampsitePage').then(m => ({ default: m.EditCampsitePage })));
const AdminGearPage = lazy(() => import('@/pages/admin/AdminGearPage').then(m => ({ default: m.AdminGearPage })));
const AddGearPage = lazy(() => import('@/pages/admin/AddGearPage').then(m => ({ default: m.AddGearPage })));
const EditGearPage = lazy(() => import('@/pages/admin/EditGearPage').then(m => ({ default: m.EditGearPage })));
const AdminBlogsPage = lazy(() => import('@/pages/admin/AdminBlogsPage').then(m => ({ default: m.AdminBlogsPage })));
const AddBlogPage = lazy(() => import('@/pages/admin/AddBlogPage').then(m => ({ default: m.AddBlogPage })));
const EditBlogPage = lazy(() => import('@/pages/admin/EditBlogPage').then(m => ({ default: m.EditBlogPage })));
const AdminMessagesPage = lazy(() => import('@/pages/admin/AdminMessagesPage').then(m => ({ default: m.AdminMessagesPage })));
const AdminNewslettersPage = lazy(() => import('@/pages/admin/AdminNewslettersPage').then(m => ({ default: m.AdminNewslettersPage })));
const AdminAppointmentsPage = lazy(() => import('@/pages/admin/AdminAppointmentsPage').then(m => ({ default: m.AdminAppointmentsPage })));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AddCategoryPage = lazy(() => import('@/pages/admin/AddCategoryPage').then(m => ({ default: m.AddCategoryPage })));
const EditCategoryPage = lazy(() => import('@/pages/admin/EditCategoryPage').then(m => ({ default: m.EditCategoryPage })));
const AdminBrandsPage = lazy(() => import('@/pages/admin/AdminBrandsPage').then(m => ({ default: m.AdminBrandsPage })));
const AdminReferencesPage = lazy(() => import('@/pages/admin/AdminReferencesPage').then(m => ({ default: m.AdminReferencesPage })));
const AdminColorsPage = lazy(() => import('@/pages/admin/AdminColorsPage').then(m => ({ default: m.AdminColorsPage })));
const AdminChangePasswordPage = lazy(() => import('@/pages/admin/AdminChangePasswordPage').then(m => ({ default: m.AdminChangePasswordPage })));
const AdminUserOrdersPage = lazy(() => import('@/pages/admin/AdminUserOrdersPage').then(m => ({ default: m.AdminUserOrdersPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <SecurityProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppContent />
          </BrowserRouter>
        </SecurityProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path={routes.home} element={<HomePage />} />
                <Route path={routes.blog} element={<BlogPage />} />
                <Route path={routes.blogDetails} element={<BlogDetailsPage />} />
                <Route path={routes.gear} element={<GearPage />} />
                <Route path={routes.gearDetails} element={<GearDetailsPage />} />
                <Route path={routes.category} element={<CategoryPage />} />
                <Route path={routes.search} element={<SearchResultsPage />} />
                <Route path={routes.about} element={<AboutPage />} />
                <Route path={routes.references} element={<ReferencesPage />} />
                <Route path={routes.contact} element={<ContactPage />} />
                <Route path={routes.faq} element={<FAQPage />} />
                <Route path={routes.favorites} element={<FavoritesPage />} />
                <Route path={routes.login} element={<LoginPage />} />
                <Route path={routes.register} element={<RegisterPage />} />
                <Route path={routes.forgotPassword} element={<ForgotPasswordPage />} />
                <Route
                  path={routes.profile}
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path={routes.admin}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminCampsites}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminCampsitesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminAddCampsite}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AddCampsitePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminEditCampsite}
                  element={
                    <ProtectedRoute requireAdmin>
                      <EditCampsitePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminGear}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminGearPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminAddGear}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AddGearPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminEditGear}
                  element={
                    <ProtectedRoute requireAdmin>
                      <EditGearPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminBlogs}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminBlogsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminAddBlog}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AddBlogPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminEditBlog}
                  element={
                    <ProtectedRoute requireAdmin>
                      <EditBlogPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminMessages}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminMessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminNewsletters}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminNewslettersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminAppointments}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminAppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminCategories}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminCategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminAddCategory}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AddCategoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminEditCategory}
                  element={
                    <ProtectedRoute requireAdmin>
                      <EditCategoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminBrands}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminBrandsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminReferences}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminReferencesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminColors}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminColorsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminChangePassword}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminChangePasswordPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminUserOrders}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminUserOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={routes.adminUsers}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to={routes.home} replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdmin && (
        <>
          <Footer />
          <ContactToolbar />
          <FastNavigation />
        </>
      )}
    </div>
  );
}

export default App;

