import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SeleccionarOperacion from "./pages/SeleccionarOperacion";
import Transportar from "./pages/Transportar";
import DarCarga from "./pages/DarCarga";
import Viajar from "./pages/Viajar";
import Publicado from "./pages/Publicado";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/seleccionar-operacion" element={<SeleccionarOperacion />} />
          <Route path="/transportar" element={<Transportar />} />
          <Route path="/dar-carga" element={<DarCarga />} />
          <Route path="/viajar" element={<Viajar />} />
          <Route path="/publicado" element={<Publicado />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
