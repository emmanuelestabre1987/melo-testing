// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 safe-bottom">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
        <p className="text-xs font-semibold text-muted-foreground">MELO</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Bienvenido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Si llegaste acá por error, volvé al inicio o entrá al tablero.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <a className="text-sm font-semibold text-primary hover:underline" href="/">
            Ir a iniciar sesión
          </a>
          <a className="text-sm font-semibold text-foreground hover:underline" href="/tablero">
            Ir al tablero
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
