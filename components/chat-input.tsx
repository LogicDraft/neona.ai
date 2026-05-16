"use client";

import { useEffect, useRef } from "react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function ChatInput({ value, onChange, onSubmit, disabled = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    const nextHeight = Math.min(textareaRef.current.scrollHeight, 180);
    textareaRef.current.style.height = `${nextHeight}px`;
  }, [value]);

  return (
    <div className="w-full rounded-3xl border border-zinc-300 bg-white/95 p-3 shadow-sm backdrop-blur md:p-4 dark:border-white/10 dark:bg-zinc-800/90">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          rows={1}
          placeholder="Message Neona"
          className="max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px] leading-6 text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          disabled={disabled}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="m22 2-7 20-4-9-9-4 20-7Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
