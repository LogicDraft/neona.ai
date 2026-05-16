"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   SpeechRecognition type shim
   The Web Speech API is not in TypeScript's default lib — we define
   just enough to use it safely without installing extra packages.
───────────────────────────────────────────────────────────────────────── */
interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: { readonly transcript: string } | undefined;
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResult[];
}

interface ISpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: {
    readonly [index: number]: ISpeechRecognitionResult | undefined;
    readonly length: number;
  };
}

interface ISpeechRecognitionErrorEvent {
  readonly error: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

function getSpeechRecognitionClass(): ISpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as ISpeechRecognitionConstructor | null ?? null;
}

/* ─────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────── */
type VoiceState = "idle" | "listening" | "denied";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

/* ─────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────── */
export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Detect support at render time (safe — only runs on client)
  const speechSupported = typeof window !== "undefined" && !!getSpeechRecognitionClass();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [interimText, setInterimText] = useState("");

  /* Auto-resize textarea */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    const nextHeight = Math.min(textareaRef.current.scrollHeight, 180);
    textareaRef.current.style.height = `${nextHeight}px`;
  }, [value]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  /* ── Start recording ── */
  const startListening = useCallback(() => {
    const SR = getSpeechRecognitionClass();
    if (!SR) return;

    const rec = new SR();
    recognitionRef.current = rec;

    rec.lang = navigator.language || "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    // Keep track of accumulated final text so we can append correctly
    let accumulated = value;

    rec.onstart = () => setVoiceState("listening");

    rec.onresult = (event: ISpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (!res) continue;
        const transcript = res[0]?.transcript ?? "";
        if (res.isFinal) {
          accumulated += (accumulated ? " " : "") + transcript;
          onChange(accumulated);
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
    };

    rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceState("denied");
      } else {
        setVoiceState("idle");
      }
      setInterimText("");
    };

    rec.onend = () => {
      setVoiceState("idle");
      setInterimText("");
    };

    try {
      rec.start();
    } catch {
      setVoiceState("idle");
    }
  }, [value, onChange]);

  /* ── Stop recording ── */
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setVoiceState("idle");
    setInterimText("");
  }, []);

  function handleMicClick() {
    if (voiceState === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }

  const isListening = voiceState === "listening";
  const hasValue = !!value.trim();

  const micTitle = isListening
    ? "Stop recording"
    : voiceState === "denied"
      ? "Microphone permission denied — check browser settings"
      : "Use voice input";

  return (
    <div
      className={`w-full rounded-3xl border bg-white/95 p-3 shadow-sm backdrop-blur transition-all duration-200 md:p-4 dark:bg-zinc-800/90 ${
        isListening
          ? "border-violet-500/70 ring-2 ring-violet-500/20 dark:border-violet-400/60 dark:ring-violet-400/15"
          : "border-zinc-300 dark:border-white/10"
      }`}
    >
      {/* ── Listening strip ── */}
      {isListening && (
        <div className="mb-2 flex items-center gap-2 px-3" aria-live="polite" aria-atomic="true">
          {/* Animated sound-wave bars */}
          <span className="flex items-end gap-[3px]" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-violet-500 dark:bg-violet-400"
                style={{
                  height: "12px",
                  animation: `voice-bar ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </span>
          <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
            {interimText ? "Speaking…" : "Listening…"}
          </span>
          {interimText && (
            <span className="min-w-0 truncate text-xs italic text-zinc-500 dark:text-zinc-400">
              &ldquo;{interimText}&rdquo;
            </span>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="chat-message-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (isListening) stopListening();
              onSubmit();
            }
          }}
          rows={1}
          placeholder={
            isListening
              ? interimText || "Listening… speak now"
              : "Message Neona"
          }
          className="max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px] leading-6 text-zinc-900 outline-none placeholder:italic placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          disabled={disabled}
          aria-label="Message input"
        />

        {/* ── Mic button: shown while field is empty ── */}
        {!hasValue && speechSupported && (
          <button
            id="voice-input-btn"
            type="button"
            onClick={handleMicClick}
            disabled={disabled || voiceState === "denied"}
            title={micTitle}
            aria-label={micTitle}
            aria-pressed={isListening}
            className={`relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-40 ${
              isListening
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:bg-violet-700"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            {/* Pulse ring while recording */}
            {isListening && (
              <span
                className="absolute inset-0 animate-ping rounded-full bg-violet-500 opacity-25"
                aria-hidden
              />
            )}

            {isListening ? (
              /* Stop square */
              <svg viewBox="0 0 24 24" className="relative h-4 w-4" fill="currentColor" aria-hidden>
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              /* Mic */
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            )}
          </button>
        )}

        {/* ── Send button: shown when text is present (or voice unsupported) ── */}
        {(hasValue || !speechSupported) && (
          <button
            id="send-message-btn"
            type="button"
            onClick={() => {
              if (isListening) stopListening();
              onSubmit();
            }}
            disabled={disabled || !hasValue}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 2 11 13" />
              <path d="m22 2-7 20-4-9-9-4 20-7Z" />
            </svg>
          </button>
        )}
      </div>

      {/* Mic permission denied banner */}
      {voiceState === "denied" && (
        <p role="alert" className="mt-1.5 px-3 text-xs text-red-500 dark:text-red-400">
          Microphone access was blocked. Enable it in your browser&apos;s site settings and refresh.
        </p>
      )}
    </div>
  );
}
