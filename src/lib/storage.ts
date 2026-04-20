// LocalStorage helpers for presets and recent history.
import type { Adjustments } from "./image-adjustments";
import type { DitherMode } from "./dithering";

export interface Preset {
  id: string;
  name: string;
  targetSuffix: string;
  dither: DitherMode;
  enabledColors: number[];
  adjustments: Adjustments;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  fileName: string;
  thumbnail: string; // data URL
  targetSuffix: string;
  width: number;
  height: number;
  createdAt: number;
}

const PRESETS_KEY = "ark-pnt:presets";
const HISTORY_KEY = "ark-pnt:history";
const HISTORY_MAX = 24;

export function getPresets(): Preset[] {
  try {
    return JSON.parse(localStorage.getItem(PRESETS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePreset(p: Preset) {
  const all = getPresets().filter((x) => x.id !== p.id);
  all.unshift(p);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(all));
}

export function deletePreset(id: string) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(getPresets().filter((p) => p.id !== id)));
}

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function pushHistory(entry: HistoryEntry) {
  const all = [entry, ...getHistory().filter((h) => h.id !== entry.id)].slice(0, HISTORY_MAX);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  } catch {
    // Likely quota — drop oldest half and retry once
    const trimmed = all.slice(0, Math.floor(HISTORY_MAX / 2));
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed)); } catch { /* give up */ }
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
