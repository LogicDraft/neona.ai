"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  NEONA_MODELS,
  DEFAULT_MODEL_ID,
  getStoredModelId,
  setStoredModelId,
  getModelById,
  type ModelTag,
  type NeonaModel,
} from "@/lib/model-config";

/* ─────────────────────────────────────────────────────────────────────────
   Tag icon map
───────────────────────────────────────────────────────────────────────── */
function TagIcon({ icon }: { icon: ModelTag["icon"] }) {
  const cls = "h-3.5 w-3.5 flex-shrink-0";
  switch (icon) {
    case "smart":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26A7 7 0 0 1 12 2Z"/><path d="M9 21h6"/></svg>;
    case "reasoning":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
    case "multimodal":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>;
    case "balanced":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22V12"/><path d="m5 12 7-10 7 10"/><path d="M5 17H3a1 1 0 0 0-1 1v2h20v-2a1 1 0 0 0-1-1h-2"/><path d="M6 17h12"/></svg>;
    case "fast":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case "reliable":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>;
    case "efficient":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case "everyday":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "coding":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
    case "math":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
    case "technical":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>;
    case "vision":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "ocr":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
    case "images":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Model avatar
───────────────────────────────────────────────────────────────────────── */
function ModelAvatar({ model }: { model: NeonaModel }) {
  return (
    <span
      className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${model.avatarGradient} ${model.avatarTextColor} select-none text-lg font-bold shadow-sm`}
      aria-hidden
    >
      N
      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/20 text-[9px] font-black leading-none">
        +
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Single model row
───────────────────────────────────────────────────────────────────────── */
function ModelRow({
  model,
  selected,
  onSelect,
}: {
  model: NeonaModel;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(model.id)}
      aria-pressed={selected}
      className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 active:scale-[0.99] ${
        selected
          ? "border-violet-500/60 bg-violet-500/10 dark:border-violet-400/50 dark:bg-violet-500/10"
          : "border-white/8 bg-white/5 hover:bg-white/8 dark:border-zinc-700/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70"
      }`}
    >
      <ModelAvatar model={model} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {model.name}
          </span>
          {model.badge && (
            <span className="rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-400">
              {model.badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {model.description}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
          {model.tags.map((tag) => (
            <span
              key={tag.icon}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400"
            >
              <TagIcon icon={tag.icon} />
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Radio indicator */}
      <div
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          selected
            ? "border-violet-500 bg-violet-500"
            : "border-zinc-600 bg-transparent"
        }`}
        aria-hidden
      >
        {selected && (
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Sheet / modal
───────────────────────────────────────────────────────────────────────── */
interface ModelSelectorSheetProps {
  /** Controlled — pass open state from parent */
  open: boolean;
  onClose: () => void;
  /** Called when user confirms a model. Receives the selected model id. */
  onSelect?: (modelId: string) => void;
}

export function ModelSelectorSheet({ open, onClose, onSelect }: ModelSelectorSheetProps) {
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_MODEL_ID);
  const [autoSelect, setAutoSelect] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync with localStorage on open
  useEffect(() => {
    if (open) setSelectedId(getStoredModelId());
  }, [open]);

  // Trap focus inside panel
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleConfirm() {
    setStoredModelId(selectedId);
    onSelect?.(selectedId);
    onClose();
  }

  if (!open) return null;

  const selectedModel = getModelById(selectedId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close model selector"
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="
          relative flex max-h-[92dvh] w-full max-w-lg flex-col
          overflow-hidden rounded-t-3xl
          bg-[#1a1a1a] shadow-2xl ring-1 ring-white/10
          outline-none
          sm:rounded-3xl
        "
      >
        {/* Drag handle (mobile) */}
        <div className="mx-auto mt-3 h-1 w-10 flex-shrink-0 rounded-full bg-zinc-700 sm:hidden" aria-hidden />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-2 pt-4 sm:pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/8 hover:text-zinc-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className="text-center">
            <h2
              id={titleId}
              className="text-base font-semibold text-zinc-100"
            >
              Select AI Model
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Choose the model that best fits your task.
            </p>
          </div>

          {/* Spacer to keep title centred */}
          <div className="h-8 w-8 flex-shrink-0" aria-hidden />
        </div>

        {/* Scrollable model list */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2.5">
            {NEONA_MODELS.map((model) => (
              <ModelRow
                key={model.id}
                model={model}
                selected={selectedId === model.id}
                onSelect={setSelectedId}
              />
            ))}
          </div>

          {/* Auto-select toggle */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-700/60 bg-zinc-800/40 px-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-zinc-100">Auto-select model</p>
              <p className="mt-0.5 text-xs text-zinc-500">Let Neona.ai choose the best model for you.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoSelect}
              onClick={() => setAutoSelect((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                autoSelect ? "bg-violet-600" : "bg-zinc-600"
              }`}
            >
              <span
                className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  autoSelect ? "translate-x-5.5" : "translate-x-0.5"
                }`}
                style={{ width: "18px", height: "18px", transform: autoSelect ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
          </div>

          {/* Help hint */}
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-between rounded-2xl border border-zinc-700/60 bg-zinc-800/40 px-4 py-3.5 text-left transition-colors hover:bg-zinc-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm-1-4h2v2h-2zm1.07-1.75c-.9.37-1.57 1.12-1.57 2.05h1v-.2c0-1.1.63-2.07 1.6-2.6.7-.39 1.2-1.03 1.2-1.79 0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2H9c0-1.8 1.5-3.2 3.5-3.2s3.5 1.4 3.5 3.2c0 1.25-.74 2.15-1.78 2.8Z"/>
                </svg>
              </span>
              <div>
                <p className="text-xs font-medium text-zinc-300">Not sure which model to choose?</p>
                <p className="text-xs text-violet-400">Learn more about our models</p>
              </div>
            </div>
            <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* Bottom padding for safe area */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>

        {/* Sticky confirm bar */}
        <div className="border-t border-white/8 bg-[#1a1a1a] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
          <button
            id="model-confirm-btn"
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-violet-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            Use {selectedModel.name}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Convenience trigger button (used in Settings rows etc.)
───────────────────────────────────────────────────────────────────────── */
interface ModelSelectorButtonProps {
  className?: string;
}

export default function ModelSelectorButton({ className = "" }: ModelSelectorButtonProps) {
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string>(DEFAULT_MODEL_ID);

  useEffect(() => {
    setCurrentId(getStoredModelId());
  }, []);

  const model = getModelById(currentId);

  return (
    <>
      <button
        id="model-selector-btn"
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between text-left ${className}`}
      >
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{model.name}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <ModelSelectorSheet
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(id) => setCurrentId(id)}
      />
    </>
  );
}
