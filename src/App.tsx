import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VersionChecker } from "@/components/VersionChecker";
import { StorageCompatibilityCheck } from "@/components/StorageCompatibilityCheck";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Test = lazy(() => import("./pages/Test"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Card Preloader component - handles initializing session cards
const CardPreloader = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Initialize session cards when app loads
    const initializeCards = async () => {
      setIsLoading(true);
      try {
        // Dynamic import to avoid issues with server-side rendering
        const { initializeSessionCards, getSessionStats, refreshSessionCards } = await import('@/services/sessionCardManager');
        
        // Check if we have cards in session already
        const stats = getSessionStats();
        console.log('[CardPreloader] Initial session stats:', stats);
        
        console.log('[CardPreloader] Session stats:', stats);
        
        // Always try to download cards on startup, even if we have some already
        console.log('[CardPreloader] Downloading cards now...');
        toast.info('Downloading cards for offline play...');
        
        try {
          // Force immediate download of cards for session
          const success = await refreshSessionCards();
          if (success) {
            // Check updated stats after download
            const updatedStats = getSessionStats();
            console.log('[CardPreloader] Updated session stats after download:', updatedStats);
            toast.success(`${updatedStats.availableCards} card images ready for use!`);
          } else {
            toast.error('Failed to download card images. Pack opening may not work properly.');
          }
        } catch (err) {
          console.error('[CardPreloader] Error downloading cards:', err);
          toast.error('Error downloading cards. Please try refreshing the page.');
        }
      } catch (error) {
        console.error('[CardPreloader] Failed to initialize session cards:', error);
        toast.error('Failed to load cards. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Run after a small delay to allow the UI to render first
    const timer = setTimeout(() => {
      initializeCards();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return null; // This component doesn't render anything visible
};

const queryClient = new QueryClient();

// Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] Service Worker registered successfully:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              toast.info('New version available! Refresh to update.');
            }
          });
        }
      });
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
    }
  }
};

const App = () => {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {/* Card preloader runs as soon as the app mounts */}
              <CardPreloader />
              {/* Version checker monitors for app updates */}
              <VersionChecker />
              {/* Storage compatibility checker */}
              <StorageCompatibilityCheck />
              <div className="flex-1 min-h-0">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/test" element={<Test />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
