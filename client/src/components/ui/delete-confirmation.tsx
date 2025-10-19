import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationProps {
  title: string;
  description: string;
  itemName: string;
  impact?: string; // e.g., "This will affect 12 products"
  onConfirm: () => void | Promise<void>;
  trigger?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * DeleteConfirmation - Safe deletion with impact preview
 *
 * Problem solved: Users could accidentally delete items without understanding
 * the consequences. This component:
 * - Shows clear warning before deletion
 * - Explains what will be deleted
 * - Shows impact (e.g., "12 products use this category")
 * - Requires explicit confirmation
 * - Prevents accidental clicks with distinct color coding
 */
export function DeleteConfirmation({
  title,
  description,
  itemName,
  impact,
  onConfirm,
  trigger,
  isLoading = false,
}: DeleteConfirmationProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      // Error handling done by parent component via toast
      console.error("Delete failed:", error);
    }
  };

  const defaultTrigger = (
    <Button variant="destructive" size="sm" disabled={isLoading}>
      Delete
    </Button>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3 pt-4">
            <p>{description}</p>

            {itemName && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-sm text-gray-600">You are about to delete:</div>
                <div className="font-medium text-gray-900 mt-1">{itemName}</div>
              </div>
            )}

            {impact && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">{impact}</div>
                </div>
              </div>
            )}

            <p className="text-sm font-medium text-red-600">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? "Deleting..." : "Yes, Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
