import React, { useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { X, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface TagSelectorProps {
  value: string[]; // Array of selected tags
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  suggestedTags?: string[]; // Pre-populated common tags
}

/**
 * TagSelector - Multi-select tag component with suggested tags
 *
 * Replaces the confusing "comma-separated string" input with an intuitive
 * multi-select interface that shows tags as badges.
 *
 * Features:
 * - Visual badge display of selected tags
 * - Click to remove tags
 * - Suggested tags (common options)
 * - Add custom tags with "+Add Tag" button
 * - No need to understand comma-separated format
 */
export function TagSelector({
  value = [],
  onChange,
  label = "Tags",
  placeholder = "Add tags to organize and filter...",
  helperText,
  suggestedTags = [
    "texas-native",
    "drought-tolerant",
    "full-sun",
    "partial-shade",
    "shade",
    "perennial",
    "annual",
    "flowering",
    "evergreen",
    "deciduous",
    "fruit-bearing",
    "wildlife-friendly",
    "low-maintenance",
    "deer-resistant",
  ],
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (normalizedTag && !value.includes(normalizedTag)) {
      onChange([...value, normalizedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag);
      setCustomTag("");
    }
  };

  const availableSuggestedTags = suggestedTags.filter(tag => !value.includes(tag));

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Selected Tags Display */}
      <div className="min-h-[42px] p-2 border rounded-md bg-white flex flex-wrap gap-2 items-start">
        {value.length === 0 && (
          <span className="text-sm text-gray-400 py-1">{placeholder}</span>
        )}
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            <span className="capitalize">{tag.replace(/-/g, ' ')}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add Tags Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Suggested Tags */}
            {availableSuggestedTags.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Suggested Tags</div>
                <div className="flex flex-wrap gap-2">
                  {availableSuggestedTags.slice(0, 12).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100 capitalize"
                      onClick={() => {
                        addTag(tag);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tag.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Tag Input */}
            <div>
              <div className="text-sm font-medium mb-2">Add Custom Tag</div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. heat-tolerant"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Spaces will be converted to hyphens
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {helperText && (
        <div className="text-sm text-gray-500">{helperText}</div>
      )}
    </div>
  );
}
