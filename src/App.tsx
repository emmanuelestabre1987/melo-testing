import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Route-level code splitting: each page (and its heavy deps like Leaflet in the
// wizards) is fetched on demand instead of shipping in the initial bundle.
const Login = lazy(() => import("./pages/Login"));
const SeleccionarOperacion = lazy(() => import("./pages/SeleccionarOperacion"));
const Transportar = lazy(() => import("./pages/Transportar"));
const DarCarga = lazy(() => import("./pages/DarCarga"));
const Viajar = lazy(() => import("./pages/Viajar"));
const Publicado = lazy(() => import("./pages/Publicado"));
const Tablero = lazy(() => import("./pages/Tablero"));
const PublicacionDetalle = lazy(() => import("./pages/PublicacionDetalle"));
const MisMatches = lazy(() => import("./pages/MisMatches"));
const Perfil = lazy(() => import("./pages/Perfil"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/seleccionar-operacion" element={<ProtectedRoute><SeleccionarOperacion /></ProtectedRoute>} />
              <Route path="/transportar" element={<ProtectedRoute><Transportar /></ProtectedRoute>} />
              <Route path="/dar-carga" element={<ProtectedRoute><DarCarga /></ProtectedRoute>} />
              <Route path="/viajar" element={<ProtectedRoute><Viajar /></ProtectedRoute>} />
              <Route path="/publicado" element={<ProtectedRoute><Publicado /></ProtectedRoute>} />
              <Route path="/tablero" element={<ProtectedRoute><Tablero /></ProtectedRoute>} />
              <Route path="/publicacion/:id" element={<ProtectedRoute><PublicacionDetalle /></ProtectedRoute>} />
              <Route path="/mis-matches" element={<ProtectedRoute><MisMatches /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
