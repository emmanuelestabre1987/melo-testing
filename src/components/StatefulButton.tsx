import { Check, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ButtonStatus = "idle" | "loading" | "success";

interface StatefulButtonProps extends Omit<ButtonProps, "children"> {
  status: ButtonStatus;
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
}

/**
 * CTA that morphs idle → spinner → check, à la Revolut/Stripe.
 * Parent owns the `status`; flip it to "success" briefly before navigating.
 */
const StatefulButton = ({
  status,
  children,
  loadingText,
  successText = "Listo",
  className,
  disabled,
  ...props
}: StatefulButtonProps) => (
  <Button
    {...props}
    disabled={disabled || status !== "idle"}
    aria-busy={status === "loading"}
    className={cn(
      "relative overflow-hidden transition-colors",
      status === "success" && "bg-[hsl(142_60%_40%)] text-white hover:bg-[hsl(142_60%_40%)]",
      className
    )}
  >
    {status === "loading" && (
      <span className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingText}
      </span>
    )}
    {status === "success" && (
      <span className="flex items-center gap-2 animate-scale-in">
        <Check className="h-5 w-5" />
        {successText}
      </span>
    )}
    {status === "idle" && children}
  </Button>
);

export default StatefulButton;
