import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MeloLogo from "@/components/MeloLogo";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast({ title: "¡Cuenta creada!", description: "Ya podés iniciar sesión." });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/tablero");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 overflow-hidden">
      {/* Sierras decorativas — puntiagudas como el header */}
      <svg viewBox="0 0 1200 80" className="absolute bottom-0 left-0 w-full h-[80px]" preserveAspectRatio="none">
        <path
          d="M0 80 L0 52 L40 30 L70 50 L100 18 L130 42 L170 8 L210 38 L240 15 L275 45 L310 12 L350 40 L380 20 L420 48 L460 10 L500 35 L540 22 L580 50 L610 14 L650 42 L690 6 L730 38 L770 18 L810 45 L850 10 L890 36 L930 20 L970 48 L1010 8 L1050 40 L1090 22 L1130 46 L1170 16 L1200 35 L1200 80 Z"
          fill="hsl(var(--accent))"
          opacity="0.08"
        />
        <path
          d="M0 80 L0 62 L50 42 L80 58 L120 32 L155 52 L190 28 L230 50 L265 35 L300 55 L340 26 L380 48 L420 30 L460 54 L500 22 L540 46 L580 32 L620 56 L660 28 L700 50 L740 34 L780 55 L820 25 L860 48 L900 36 L940 56 L980 30 L1020 52 L1060 38 L1100 55 L1140 32 L1180 50 L1200 42 L1200 80 Z"
          fill="hsl(var(--accent))"
          opacity="0.05"
        />
      </svg>

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="mb-8 flex flex-col items-center gap-3">
          <MeloLogo className="h-40 w-auto" />
          <p className="text-center text-sm text-muted-foreground">
            Logística para tu comunidad
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" placeholder="Tu nombre" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Cargando..." : isSignUp ? "Crear cuenta" : "Iniciar sesión"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "¿Ya tenés cuenta?" : "¿No tenés cuenta?"}{" "}
          <button className="font-semibold text-primary hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Iniciar sesión" : "Registrate"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
