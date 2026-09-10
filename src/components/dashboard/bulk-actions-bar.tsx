"use client";

import * as React from "react";
import { Trash2, CheckCircle2, Download, X, Layers, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onDeleteSelected?: () => Promise<void>;
  onStatusChangeSelected?: (status: string) => Promise<void>;
  onExportSelected?: () => void;
  statusOptions?: Array<{ label: string; value: string }>;
  entityName?: string;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onDeleteSelected,
  onStatusChangeSelected,
  onExportSelected,
  statusOptions,
  entityName = "items",
}: BulkActionsBarProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  if (selectedCount === 0) return null;

  const handleDelete = async () => {
    if (!onDeleteSelected) return;
    setIsDeleting(true);
    try {
      await onDeleteSelected();
      setIsDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatus = async (status: string) => {
    if (!onStatusChangeSelected) return;
    setIsUpdatingStatus(true);
    try {
      await onStatusChangeSelected(status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[90%] sm:w-auto bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">
            {selectedCount}
          </span>
          <span className="font-medium text-slate-200">
            {selectedCount} of {totalCount} {entityName} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {statusOptions && onStatusChangeSelected && (
            <select
              onChange={(e) => {
                if (e.target.value) handleStatus(e.target.value);
              }}
              defaultValue=""
              disabled={isUpdatingStatus}
              className="h-8 px-2 rounded-lg bg-slate-800 dark:bg-slate-700 border border-slate-600 text-xs text-slate-200 focus:outline-none"
            >
              <option value="" disabled>
                Update Status...
              </option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Set: {opt.label}
                </option>
              ))}
            </select>
          )}

          {onExportSelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportSelected}
              className="h-8 text-xs gap-1 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          )}

          {onDeleteSelected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="h-8 text-xs gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          )}

          <button
            onClick={onClearSelection}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            title="Deselect all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title={`Confirm Delete ${selectedCount} ${entityName}`}
        description="This action cannot be undone. All selected records will be permanently removed from your workspace database."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Are you sure you want to delete <strong>{selectedCount}</strong> {entityName}?
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
