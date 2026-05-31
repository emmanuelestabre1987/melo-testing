import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

/**
 * App-wide error boundary. Without this, any uncaught render/commit error
 * unmounts the React root and leaves a blank white screen. Here we catch it,
 * show the real message + stack on screen (so it can be read without DevTools),
 * and offer a reload.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to the console with the full component stack for debugging.
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.setState({ info });
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-5 py-8">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-card">
          <h1 className="mb-2 text-lg font-bold text-foreground">Algo salió mal</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Ocurrió un error inesperado. Podés recargar la página. Si el problema
            persiste, copiá el detalle de abajo.
          </p>
          <pre className="mb-4 max-h-64 overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-foreground whitespace-pre-wrap break-words">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ""}
            {info?.componentStack ? `\n\nComponent stack:${info.componentStack}` : ""}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
