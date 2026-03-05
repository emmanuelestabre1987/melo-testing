import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoMelo from "@/assets/logo-melo.png";

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
      {/* Sierras decorativas */}
      <svg viewBox="0 0 400 80" className="absolute bottom-0 left-0 w-full h-[100px] opacity-[0.08]" preserveAspectRatio="none">
        <path d="M0 80 L0 50 Q30 30 60 42 Q90 20 120 32 Q150 10 180 24 Q210 8 240 20 Q270 12 300 28 Q330 10 360 22 Q380 16 400 26 L400 80 Z" fill="hsl(var(--accent))" />
        <path d="M0 80 L0 58 Q40 44 70 52 Q100 36 130 44 Q160 28 190 38 Q220 22 250 34 Q280 28 310 40 Q340 24 370 36 L400 32 L400 80 Z" fill="hsl(var(--accent))" />
      </svg>

      <div className="relative z-10 w-full max-w-sm animate-slide-up" style={{ isolation: "auto" }}>
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="bg-background rounded-xl p-2">
            <img src={logoMelo} alt="MELO Logo" className="h-28 object-contain mix-blend-multiply" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Logística compartida para las sierras
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
