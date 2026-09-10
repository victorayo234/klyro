"use client";

import * as React from "react";
import { Bookmark, Plus, X, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { SavedFilter } from "@/types/database";
import { getSavedFilters, createSavedFilter, deleteSavedFilter } from "@/lib/actions/saved-filters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SavedFiltersProps {
  tableName: "customers" | "inventory" | "invoices" | "sales";
  currentFilter: Record<string, unknown>;
  activeSavedFilterId: string | null;
  onSelectSavedFilter: (filter: SavedFilter | null) => void;
}

export function SavedFilters({
  tableName,
  currentFilter,
  activeSavedFilterId,
  onSelectSavedFilter,
}: SavedFiltersProps) {
  const [filters, setFilters] = React.useState<SavedFilter[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newFilterName, setNewFilterName] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    getSavedFilters(tableName).then(setFilters).catch(() => {});
  }, [tableName]);

  const handleSaveFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;

    setIsSaving(true);
    try {
      const created = await createSavedFilter(tableName, newFilterName.trim(), currentFilter);
      setFilters((prev) => [created, ...prev]);
      onSelectSavedFilter(created);
      setIsModalOpen(false);
      setNewFilterName("");
      toast.success(`Filter view "${created.name}" saved!`);
    } catch {
      toast.error("Failed to save filter view");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFilter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSavedFilter(id);
      setFilters((prev) => prev.filter((f) => f.id !== id));
      if (activeSavedFilterId === id) onSelectSavedFilter(null);
      toast.success("Saved view deleted");
    } catch {
      toast.error("Failed to delete view");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {/* Default 'All' view */}
      <button
        type="button"
        onClick={() => onSelectSavedFilter(null)}
        className={cn(
          "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
          activeSavedFilterId === null
            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
            : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        )}
      >
        <Filter className="w-3 h-3" /> All
      </button>

      {/* Saved Views Pills */}
      {filters.map((sf) => {
        const isSelected = activeSavedFilterId === sf.id;
        return (
          <button
            key={sf.id}
            type="button"
            onClick={() => onSelectSavedFilter(sf)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 group",
              isSelected
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <Bookmark className="w-3 h-3 text-indigo-300" />
            <span>{sf.name}</span>
            <span
              onClick={(e) => handleDeleteFilter(sf.id, e)}
              className="p-0.5 rounded-sm hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              title="Delete view"
            >
              <X className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
            </span>
          </button>
        );
      })}

      {/* Save current view button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="px-2 py-1 rounded-md text-xs font-medium border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
      >
        <Plus className="w-3 h-3" /> Save view
      </button>

      {/* Save Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Save Current Filter View"
        description="Name this view for instant one-click access across future sessions."
      >
        <form onSubmit={handleSaveFilter} className="space-y-4">
          <Input
            label="View Name"
            placeholder="e.g. Overdue Invoices > $500, Low Stock VIPs"
            value={newFilterName}
            onChange={(e) => setNewFilterName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} className="gap-1.5">
              <Check className="w-3.5 h-3.5" /> Save Filter View
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
