"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BadgeDollarSign,
  UserCheck,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Notification } from "@/types/database";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/notifications";
import { formatRelativeTime } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All alerts marked as read");
  };

  const handleToggleRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "stock_alert":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "invoice_overdue":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "new_sale":
        return <BadgeDollarSign className="w-4 h-4 text-emerald-500" />;
      case "team":
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Notification Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational alerts, inventory threshold notifications, and overdue bills
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === "unread"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Unread Alerts ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            type="search"
            title="You're all caught up!"
            description="There are no unread notifications requiring immediate attention."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:px-6 flex items-start justify-between gap-4 transition-colors ${
                  !notif.is_read
                    ? "bg-blue-50/30 dark:bg-blue-950/20"
                    : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline pt-1"
                      >
                        View in workspace <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {formatRelativeTime(notif.created_at)}
                  </span>
                  {!notif.is_read && (
                    <button
                      onClick={() => handleToggleRead(notif.id)}
                      className="text-[11px] text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
