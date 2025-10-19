import React from "react";
import { Switch } from "./switch";
import { Label } from "./label";
import { Loader2 } from "lucide-react";

interface InlineToggleProps {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * InlineToggle - Quick toggle switch without opening dialogs
 *
 * Problem solved: Users had to open full edit dialogs just to toggle
 * Featured/Published status
 *
 * Solution: Inline switches that update immediately with visual feedback
 */
export function InlineToggle({
  label,
  checked,
  onToggle,
  disabled = false,
  loading = false,
  size = "sm",
}: InlineToggleProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleToggle = async (newValue: boolean) => {
    setIsUpdating(true);
    try {
      await onToggle(newValue);
    } finally {
      setIsUpdating(false);
    }
  };

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      {(loading || isUpdating) && (
        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
      )}
      <Switch
        checked={checked}
        onCheckedChange={handleToggle}
        disabled={disabled || loading || isUpdating}
        className={size === "sm" ? "scale-90" : ""}
      />
      <Label
        className={`${sizeClasses[size]} ${disabled ? "text-gray-400" : "text-gray-700"} cursor-pointer`}
        onClick={() => !disabled && !loading && !isUpdating && handleToggle(!checked)}
      >
        {label}
      </Label>
    </div>
  );
}
