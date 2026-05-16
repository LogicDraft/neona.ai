"use client";

import { useState, useCallback, useId } from "react";
import { clearOfflineData } from "@/lib/cache-utils";

/* ─── Types ───────────────────────────────────────────────────────────── */
type Variant = "neutral" | "destructive";

interface ClearOfflineCacheButtonProps {
  className?: string;
  variant?: Variant;
}

/* ─── Spinner ─────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ─── Trash icon ──────────────────────────────────────────────────────── */
function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

/* ─── Inline confirmation dialog ──────────────────────────────────────── */
interface ConfirmDialogProps {
  dialogId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ dialogId, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      id={dialogId}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${dialogId}-title`}
      aria-describedby={`${dialogId}-desc`}
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900">
        {/* Warning stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-400" />

        <div className="p-6">
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h2
            id={`${dialogId}-title`}
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Clear all offline data?
          </h2>
          <p
            id={`${dialogId}-desc`}
            className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
          >
            This will delete all cached files, local storage, and unregister the
            service worker. You&apos;ll need to re-download assets on your next
            visit.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 sm:w-auto"
            >
              Cancel
            </button>
            <button
              id="confirm-clear-cache-btn"
              type="button"
              onClick={onConfirm}
              className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:w-auto"
            >
              Yes, clear everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export default function ClearOfflineCacheButton({
  className = "",
  variant = "destructive",
}: ClearOfflineCacheButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogId = useId();

  const handleConfirm = useCallback(async () => {
    setShowConfirm(false);
    setIsClearing(true);
    setError(null);

    try {
      await clearOfflineData({ reload: true });
      // The page will reload — state beyond this point is ephemeral.
    } catch {
      setIsClearing(false);
      setError("Something went wrong. Please try again.");
    }
  }, []);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
  }, []);

  /* ── Style variants ── */
  const base =
    "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

  const styles: Record<Variant, string> = {
    destructive:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:outline-red-500 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50",
    neutral:
      "border-gray-200 bg-white text-zinc-700 hover:bg-gray-50 focus-visible:outline-zinc-400 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  };

  return (
    <>
      <div className="space-y-2">
        <button
          id="clear-offline-cache-btn"
          type="button"
          className={`${base} ${styles[variant]} ${className}`}
          onClick={() => setShowConfirm(true)}
          disabled={isClearing}
          aria-busy={isClearing}
          aria-live="polite"
        >
          {isClearing ? <Spinner /> : <TrashIcon />}
          {isClearing ? "Clearing cache…" : "Clear offline cache"}
        </button>

        {error && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          dialogId={dialogId}
          onConfirm={() => void handleConfirm()}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
