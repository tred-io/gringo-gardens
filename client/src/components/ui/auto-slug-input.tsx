import React, { useEffect } from "react";
import { Input } from "./input";
import { FormControl, FormItem, FormLabel, FormMessage, FormDescription } from "./form";

interface AutoSlugInputProps {
  sourceValue: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

/**
 * AutoSlugInput - Automatically generates URL-friendly slugs from a source value
 *
 * Features:
 * - Converts text to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Allows manual override if user wants custom slug
 * - Updates automatically when source changes (unless user has manually edited)
 */
export function AutoSlugInput({
  sourceValue,
  value,
  onChange,
  label = "URL Slug",
  description,
  disabled = false,
}: AutoSlugInputProps) {
  const [isManuallyEdited, setIsManuallyEdited] = React.useState(false);

  // Generate slug from source value
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Auto-generate slug when source changes (unless manually edited)
  useEffect(() => {
    if (!isManuallyEdited && sourceValue) {
      const newSlug = generateSlug(sourceValue);
      onChange(newSlug);
    }
  }, [sourceValue, isManuallyEdited, onChange]);

  // Track manual edits
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsManuallyEdited(true);
    onChange(e.target.value);
  };

  // Reset to auto-generation
  const handleReset = () => {
    setIsManuallyEdited(false);
    if (sourceValue) {
      onChange(generateSlug(sourceValue));
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex gap-2">
        <FormControl>
          <Input
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder="auto-generated-from-title"
            className="font-mono text-sm"
          />
        </FormControl>
        {isManuallyEdited && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            Reset
          </button>
        )}
      </div>
      {description && <FormDescription>{description}</FormDescription>}
      {!description && (
        <FormDescription>
          Auto-generated from the title. You can edit this if needed.
        </FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
}
