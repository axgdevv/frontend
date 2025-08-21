"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface BaseModalProps {
  open: boolean;
  type?: "delete";
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BaseModal({
  open,
  type = "delete",
  title,
  message,
  onConfirm,
  onCancel,
}: BaseModalProps) {
  const modalConfig = {
    delete: {
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      confirmText: "Delete",
      confirmClass: "bg-red-600 hover:bg-red-700 text-white",
    },
  };

  const config = modalConfig[type];

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-2">
          {config.icon}
          <DialogTitle>{title || "Are you sure?"}</DialogTitle>
        </DialogHeader>

        <p className="text-center text-sm text-muted-foreground">{message}</p>

        <DialogFooter className="flex justify-center gap-3 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button className={config.confirmClass} onClick={onConfirm}>
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
