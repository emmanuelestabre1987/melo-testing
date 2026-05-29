import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LogOut, Sun, Moon, Monitor, Loader2, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

const Perfil = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Perfil actualizado", description: "Tus cambios se guardaron." });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const userInitial = (fullName[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Sub-header */}
        <div className="sticky top-0 z-20 glass px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <button
              onClick={() => navigate("/tablero")}
              aria-label="Volver"
              className="-ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted transition-colors tap-scale"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h2 className="text-base font-bold text-foreground">Perfil</h2>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-lg space-y-5">
            {/* Identity */}
            <div className="flex flex-col items-center gap-3 py-2 text-center animate-fade-in">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-card-hover">
                {userInitial}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </div>
            </div>

            {/* Editable data */}
            <Card className="rounded-3xl border-border shadow-card">
              <CardContent className="space-y-4 p-5">
                <p className="text-sm font-bold text-foreground">Datos personales</p>
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-12 animate-pulse rounded-xl bg-muted" />
                    <div className="h-12 animate-pulse rounded-xl bg-muted" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Nombre completo</Label>
                      <Input
                        id="fullName"
                        className="h-12 rounded-xl"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre"
                        autoCapitalize="words"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        className="h-12 rounded-xl"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej: 351 123 4567"
                      />
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="h-12 w-full rounded-xl font-semibold">
                      {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Check className="mr-2 h-4 w-4" /> Guardar cambios</>}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="rounded-3xl border-border shadow-card">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm font-bold text-foreground">Apariencia</p>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((opt) => {
                    const active = mounted && theme === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all tap-scale",
                          active ? "border-primary bg-accent" : "border-border bg-card"
                        )}
                      >
                        <opt.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                        <span className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-12 w-full rounded-2xl border-destructive/40 font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Perfil;
