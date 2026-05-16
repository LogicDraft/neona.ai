export type ModelTag = {
  icon: "smart" | "reasoning" | "multimodal" | "balanced" | "fast" | "reliable" | "efficient" | "everyday" | "coding" | "math" | "technical" | "vision" | "ocr" | "images";
  label: string;
};

export type NeonaModel = {
  id: string;
  /** Gemini API model string */
  apiId: string;
  name: string;
  badge?: string;
  description: string;
  tags: ModelTag[];
  /** Tailwind gradient used for the avatar square */
  avatarGradient: string;
  avatarTextColor: string;
};

export const NEONA_MODELS: NeonaModel[] = [
  {
    id: "neona-3-5",
    apiId: "gemini-2.5-flash",
    name: "Neona 3.5",
    badge: "LATEST",
    description: "Our most powerful model. Excellent for complex tasks, reasoning, and creativity.",
    tags: [
      { icon: "smart", label: "Smart" },
      { icon: "reasoning", label: "Advanced reasoning" },
      { icon: "multimodal", label: "Multimodal" },
    ],
    avatarGradient: "from-violet-600 to-indigo-600",
    avatarTextColor: "text-white",
  },
  {
    id: "neona-3",
    apiId: "gemini-2.0-flash",
    name: "Neona 3",
    description: "Great for everyday tasks. Balanced speed, intelligence, and accuracy.",
    tags: [
      { icon: "balanced", label: "Balanced" },
      { icon: "fast", label: "Fast" },
      { icon: "reliable", label: "Reliable" },
    ],
    avatarGradient: "from-emerald-500 to-teal-600",
    avatarTextColor: "text-white",
  },
  {
    id: "neona-3-mini",
    apiId: "gemini-2.5-flash-lite",
    name: "Neona 3 Mini",
    description: "Faster responses for simple tasks. Ideal for quick answers and brainstorming.",
    tags: [
      { icon: "fast", label: "Fast" },
      { icon: "efficient", label: "Efficient" },
      { icon: "everyday", label: "Everyday use" },
    ],
    avatarGradient: "from-sky-400 to-blue-600",
    avatarTextColor: "text-white",
  },
  {
    id: "neona-3-pro",
    apiId: "gemini-2.5-pro",
    name: "Neona 3 Pro",
    description: "Best for advanced coding, math, and technical problem solving.",
    tags: [
      { icon: "coding", label: "Coding" },
      { icon: "math", label: "Math" },
      { icon: "technical", label: "Technical" },
    ],
    avatarGradient: "from-orange-500 to-amber-600",
    avatarTextColor: "text-white",
  },
  {
    id: "neona-vision",
    apiId: "gemini-2.0-flash",
    name: "Neona Vision",
    description: "Specialized in image understanding and visual analysis.",
    tags: [
      { icon: "vision", label: "Vision" },
      { icon: "ocr", label: "OCR" },
      { icon: "images", label: "Images" },
    ],
    avatarGradient: "from-pink-500 to-rose-600",
    avatarTextColor: "text-white",
  },
];

export const DEFAULT_MODEL_ID = "neona-3-5";
const STORAGE_KEY = "neona_selected_model";

export function getStoredModelId(): string {
  if (typeof window === "undefined") return DEFAULT_MODEL_ID;
  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_MODEL_ID;
}

export function setStoredModelId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function getModelById(id: string): NeonaModel {
  return NEONA_MODELS.find((m) => m.id === id) ?? NEONA_MODELS[0]!;
}
