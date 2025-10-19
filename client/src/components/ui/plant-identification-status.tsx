import React from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Loader2, Sparkles, HelpCircle, CheckCircle2 } from "lucide-react";

interface PlantIdentificationStatusProps {
  isIdentified: boolean;
  isIdentifying?: boolean;
  commonName?: string | null;
  onIdentify?: () => void;
  variant?: "badge" | "button";
}

/**
 * PlantIdentificationStatus - Visual feedback for AI plant identification
 *
 * Problem solved: Previously, clicking "Identify Plant" gave no visual feedback,
 * making users think nothing happened. This component shows clear status:
 * - "Identify Plant" button when not identified
 * - "Identifying..." with spinner during processing
 * - "✓ Identified: [Name]" when complete
 * - "? Unknown" when AI couldn't identify
 */
export function PlantIdentificationStatus({
  isIdentified,
  isIdentifying = false,
  commonName,
  onIdentify,
  variant = "badge",
}: PlantIdentificationStatusProps) {
  // Status: Identifying (in progress)
  if (isIdentifying) {
    if (variant === "button") {
      return (
        <Button type="button" disabled size="sm" variant="outline">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Identifying...
        </Button>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Identifying...</span>
      </Badge>
    );
  }

  // Status: Identified (success)
  if (isIdentified && commonName && commonName !== "unknown") {
    if (variant === "button") {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Identified: {commonName}</span>
          </Badge>
          {onIdentify && (
            <Button
              type="button"
              onClick={onIdentify}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              Re-identify
            </Button>
          )}
        </div>
      );
    }
    return (
      <Badge variant="default" className="bg-green-600 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        <span>{commonName}</span>
      </Badge>
    );
  }

  // Status: Unknown (AI couldn't identify)
  if (isIdentified && (!commonName || commonName === "unknown")) {
    if (variant === "button") {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Unknown Plant</span>
          </Badge>
          {onIdentify && (
            <Button
              type="button"
              onClick={onIdentify}
              size="sm"
              variant="outline"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <HelpCircle className="w-3 h-3" />
        <span>Unknown</span>
      </Badge>
    );
  }

  // Status: Not identified yet (default)
  if (variant === "button" && onIdentify) {
    return (
      <Button
        type="button"
        onClick={onIdentify}
        size="sm"
        variant="outline"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Identify Plant
      </Button>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <Sparkles className="w-3 h-3" />
      <span>Not Identified</span>
    </Badge>
  );
}
