"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ── SpeechRecognition type shim ── */
interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: { readonly transcript: string } | undefined;
}
interface ISpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: { readonly [index: number]: ISpeechRecognitionResult | undefined; readonly length: number };
}
interface ISpeechRecognitionErrorEvent { readonly error: string }
interface ISpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
interface ISpeechRecognitionConstructor { new(): ISpeechRecognition }

function getSpeechRecognitionClass(): ISpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as ISpeechRecognitionConstructor | null ?? null;
}

type VoiceState = "idle" | "listening" | "denied";
type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export default function ChatInput({ value, onChange, onSubmit, disabled = false }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const speechSupported = typeof window !== "undefined" && !!getSpeechRecognitionClass();
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [interimText, setInterimText] = useState("");

  /* Auto-resize */
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    const h = Math.min(textareaRef.current.scrollHeight, 180);
    textareaRef.current.style.height = `${h}px`;
  }, [value]);

  useEffect(() => { return () => { recognitionRef.current?.abort() }; }, []);

  const startListening = useCallback(() => {
    const SR = getSpeechRecognitionClass();
    if (!SR) return;
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = navigator.language || "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    let accumulated = value;
    rec.onstart = () => setVoiceState("listening");
    rec.onresult = (event: ISpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (!res) continue;
        const transcript = res[0]?.transcript ?? "";
        if (res.isFinal) { accumulated += (accumulated ? " " : "") + transcript; onChange(accumulated); }
        else { interim += transcript; }
      }
      setInterimText(interim);
    };
    rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
      setVoiceState(event.error === "not-allowed" || event.error === "service-not-allowed" ? "denied" : "idle");
      setInterimText("");
    };
    rec.onend = () => { setVoiceState("idle"); setInterimText(""); };
    try { rec.start(); } catch { setVoiceState("idle"); }
  }, [value, onChange]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setVoiceState("idle");
    setInterimText("");
  }, []);

  function handleMicClick() {
    if (voiceState === "listening") stopListening();
    else startListening();
  }

  const isListening = voiceState === "listening";
  const hasValue = !!value.trim();
  const micTitle = isListening
    ? "Stop recording"
    : voiceState === "denied"
    ? "Microphone permission denied"
    : "Use voice input";

  return (
    <div className={`chat-input-bar ${isListening ? "listening" : ""}`}>
      {/* Voice listening strip */}
      {isListening && (
        <div className="flex items-center gap-2 px-1 mb-2" aria-live="polite" aria-atomic="true">
          <span className="flex items-end gap-[3px]" aria-hidden>
            {[1, 2, 3, 4].map((i) => <span key={i} className="voice-bar" />)}
          </span>
          <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>
            {interimText ? "Speaking…" : "Listening…"}
          </span>
          {interimText && (
            <span className="min-w-0 truncate text-xs italic" style={{ color: "var(--text-muted)" }}>
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
          placeholder={isListening ? (interimText || "Listening… speak now") : "Message Neona…"}
          className="chat-textarea"
          disabled={disabled}
          aria-label="Message input"
        />

        {/* Mic button (when field is empty) */}
        {!hasValue && speechSupported && (
          <button
            id="voice-input-btn"
            type="button"
            onClick={handleMicClick}
            disabled={disabled || voiceState === "denied"}
            title={micTitle}
            aria-label={micTitle}
            aria-pressed={isListening}
            className={`icon-btn relative ${isListening ? "mic-btn-active" : "mic-btn-idle"}`}
          >
            {isListening && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(220,38,38,0.4)",
                  animation: "ping-ring 1s ease-out infinite",
                }}
              />
            )}
            {isListening ? (
              <svg viewBox="0 0 24 24" className="relative h-4 w-4" fill="currentColor" aria-hidden>
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            )}
          </button>
        )}

        {/* Send button */}
        {(hasValue || !speechSupported) && (
          <button
            id="send-message-btn"
            type="button"
            onClick={() => { if (isListening) stopListening(); onSubmit(); }}
            disabled={disabled || !hasValue}
            className="icon-btn send-btn"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" />
            </svg>
          </button>
        )}
      </div>

      {/* Permission denied banner */}
      {voiceState === "denied" && (
        <p role="alert" className="mt-2 px-1 text-xs" style={{ color: "#ef4444" }}>
          Microphone access was blocked. Enable it in browser site settings and refresh.
        </p>
      )}
    </div>
  );
}
