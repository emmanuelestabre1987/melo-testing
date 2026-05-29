// Borra publicaciones (y matches asociados por cascade) para testear de cero.
//
// Uso A — borrar TODO (requiere service_role key, ignora RLS):
//   MELO_SERVICE_KEY="<service_role_key>" node scripts/wipe-publications.mjs
//
// Uso B — borrar solo las de tu usuario (login con tu cuenta):
//   MELO_EMAIL="tu@email.com" MELO_PASSWORD="tu-pass" node scripts/wipe-publications.mjs
//
// En PowerShell:
//   $env:MELO_EMAIL="tu@email.com"; $env:MELO_PASSWORD="tu-pass"; node scripts/wipe-publications.mjs
//
// (En Claude Code, corré con el prefijo "!" para que la contraseña no pase por el chat.)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Leer URL y anon key del .env
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "..", ".env"), "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([\w.]+)\s*=\s*"?([^"\n]*)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);

const URL = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.MELO_SERVICE_KEY;
const EMAIL = process.env.MELO_EMAIL;
const PASSWORD = process.env.MELO_PASSWORD;

if (!URL) {
  console.error("No encontré VITE_SUPABASE_URL en .env");
  process.exit(1);
}

const run = async () => {
  if (SERVICE) {
    // Service role: borra TODO ignorando RLS.
    const sb = createClient(URL, SERVICE, { auth: { persistSession: false } });
    const { count: mCount } = await sb.from("matches").delete({ count: "exact" }).not("id", "is", null);
    const { count: pCount } = await sb.from("publications").delete({ count: "exact" }).not("id", "is", null);
    console.log(`✓ Borradas ${pCount ?? "?"} publicaciones y ${mCount ?? "?"} matches (modo service_role).`);
    return;
  }

  if (!EMAIL || !PASSWORD) {
    console.error("Faltan credenciales. Definí MELO_SERVICE_KEY, o MELO_EMAIL + MELO_PASSWORD.");
    process.exit(1);
  }

  const sb = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data: auth, error: authErr } = await sb.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (authErr) {
    console.error("Error de login:", authErr.message);
    process.exit(1);
  }
  const uid = auth.user.id;
  // Borra las publicaciones del usuario; los matches sobre ellas caen por ON DELETE CASCADE.
  const { count, error } = await sb
    .from("publications")
    .delete({ count: "exact" })
    .eq("user_id", uid);
  if (error) {
    console.error("Error al borrar:", error.message);
    process.exit(1);
  }
  console.log(`✓ Borradas ${count ?? 0} publicaciones de tu usuario (y sus matches por cascade).`);
};

run();
