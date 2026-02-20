import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface WizardLayoutProps {
  title: string;
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backPath?: string;
}

const WizardLayout = ({
  title,
  step,
  totalSteps,
  children,
  onNext,
  onBack,
  nextLabel = "Siguiente",
  nextDisabled = false,
  backPath,
}: WizardLayoutProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else if (backPath) navigate(backPath);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button onClick={handleBack} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">
              Paso {step} de {totalSteps}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mx-auto mt-2 max-w-md">
          <div className="h-1 w-full rounded-full bg-muted">
            <div
              className="h-1 rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-md animate-fade-in">{children}</div>
      </div>

      {/* Footer */}
      {onNext && (
        <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-4">
          <div className="mx-auto max-w-md">
            <Button onClick={onNext} disabled={nextDisabled} className="w-full" size="lg">
              {nextLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardLayout;
