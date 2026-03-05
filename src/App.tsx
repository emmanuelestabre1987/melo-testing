import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import SeleccionarOperacion from "./pages/SeleccionarOperacion";
import Transportar from "./pages/Transportar";
import DarCarga from "./pages/DarCarga";
import Viajar from "./pages/Viajar";
import Publicado from "./pages/Publicado";
import Tablero from "./pages/Tablero";
import PublicacionDetalle from "./pages/PublicacionDetalle";
import MisMatches from "./pages/MisMatches";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
