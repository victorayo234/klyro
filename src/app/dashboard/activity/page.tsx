"use client";

import * as React from "react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/export";
import {
  History,
  Search,
  Download,
  Filter,
  FileText,
  Package,
  BadgeDollarSign,
  Receipt,
  Users,
  Clock,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivityLog } from "@/types/database";
import { getActivityLogs } from "@/lib/actions/activity-logs";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default function ActivityLogsPage() {
  const [logs, setLogs] = React.useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [entityFilter, setEntityFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const data = await getActivityLogs();
        setLogs(data);
      } catch {
        toast.error("Failed to load activity trails");
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const handleExportCSV = async () => {
    if (logs.length === 0) return toast.error("No activity logs to export");
    const data = logs.map((l) => ({
      ID: l.id,
      Date: l.created_at,
      User: l.user_name || "System",
      EntityType: l.entity_type,
      Action: l.action,
      Details: JSON.stringify(l.details),
    }));
    await exportToCsv(data, `klyro-audit-logs-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Activity logs exported to CSV");
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "product":
        return <Package className="w-4 h-4 text-amber-500" />;
      case "sale":
        return <BadgeDollarSign className="w-4 h-4 text-emerald-500" />;
      case "expense":
        return <Receipt className="w-4 h-4 text-red-500" />;
      case "customer":
        return <Users className="w-4 h-4 text-indigo-500" />;
      case "staff":
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user_name && log.user_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Audit Trails & Activity Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable chronological record of business events, stock changes, and financial updates
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export Audit Trail
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action or staff member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
          {["all", "sale", "invoice", "product", "expense", "customer", "staff"].map((type) => (
            <button
              key={type}
              onClick={() => setEntityFilter(type)}
              className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                entityFilter === type
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Stream */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <EmptyState
            type="activity"
            title="No activity logs found"
            description="Operational events will automatically populate as your team creates invoices, modifies stock, or updates customer records."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:px-6 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 mt-0.5">
                    {getEntityIcon(log.entity_type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {log.action}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>Initiated by: <strong className="text-slate-600 dark:text-slate-300 font-medium">{log.user_name || "Alex Morgan"}</strong></span>
                      <span>•</span>
                      <span className="capitalize px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                        {log.entity_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 text-xs">
                  <span className="text-slate-400 font-mono block">
                    {formatRelativeTime(log.created_at)}
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-slate-600">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
