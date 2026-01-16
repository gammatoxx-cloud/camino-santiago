import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { TrainingPage } from './pages/TrainingPage';
import { ProfilePage } from './pages/ProfilePage';
import { TrailLibraryPage } from './pages/TrailLibraryPage';
import { VideoLibraryPage } from './pages/VideoLibraryPage';
import { TeamPage } from './pages/TeamPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { RecommendedBooksPage } from './pages/RecommendedBooksPage';
import { RecommendedProductsPage } from './pages/RecommendedProductsPage';
import { GalleryPage } from './pages/GalleryPage';
import { AlbumView } from './components/gallery/AlbumView';
import { MagnoliasHikesPage } from './pages/MagnoliasHikesPage';
import { InsigniasPage } from './pages/InsigniasPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { MobileNav } from './components/layout/MobileNav';
import { DesktopNav } from './components/layout/DesktopNav';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <ScrollToTop />
      <DesktopNav />
      <div className={`${user ? 'md:ml-64' : ''}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              ) : (
                <HomePage />
              )
            } 
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <TrainingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/magnolias-hikes"
            element={
              <ProtectedRoute>
                <MagnoliasHikesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insignias"
            element={
              <ProtectedRoute>
                <InsigniasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trails"
            element={
              <ProtectedRoute>
                <TrailLibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <GalleryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gallery/:month"
            element={
              <ProtectedRoute>
                <AlbumView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/videos"
            element={
              <ProtectedRoute>
                <VideoLibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/books"
            element={
              <ProtectedRoute>
                <RecommendedBooksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources/products"
            element={
              <ProtectedRoute>
                <RecommendedProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <VideoLibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <MobileNav />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

