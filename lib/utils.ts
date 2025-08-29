import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Haptic feedback utilities
export type HapticPattern = "light" | "medium" | "heavy" | "success" | "error";

export const hapticPatterns = {
  light: [10], // Short, light vibration
  medium: [30], // Medium vibration
  heavy: [50], // Strong vibration
  success: [20, 20, 20], // Success pattern: short-short-short
  error: [100, 50, 100], // Error pattern: long-short-long
} as const;

export function triggerHapticFeedback(pattern: HapticPattern = "light") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const vibrationPattern = hapticPatterns[pattern];
    navigator.vibrate(vibrationPattern);
  }
}

// React hook for haptic feedback
export function useHapticFeedback() {
  return {
    light: () => triggerHapticFeedback("light"),
    medium: () => triggerHapticFeedback("medium"),
    heavy: () => triggerHapticFeedback("heavy"),
    success: () => triggerHapticFeedback("success"),
    error: () => triggerHapticFeedback("error"),
    custom: (pattern: number[]) => {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    },
  };
}
