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
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="bg-background px-4 sm:px-6 pt-4 pb-3">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <button
            onClick={handleBack}
            aria-label="Volver"
            className="-ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted transition-colors tap-scale"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            {totalSteps > 1 && (
            <p className="text-xs text-muted-foreground">
              Paso {step} de {totalSteps}
            </p>
          )}
          </div>
        </div>
        {/* Progress bar — oculto cuando totalSteps === 1 */}
        {totalSteps > 1 && (
          <div className="mx-auto mt-3 max-w-md">
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        <div className="mx-auto max-w-md animate-fade-in">{children}</div>
      </div>

      {/* Footer */}
      {onNext && (
        <div className="bg-background border-t border-border px-4 sm:px-6 py-4 safe-bottom">
          <div className="mx-auto max-w-md">
            <Button onClick={onNext} disabled={nextDisabled} className="w-full h-12 rounded-xl text-sm font-semibold">
              {nextLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardLayout;
