/**
 * Christmas Effects State Management
 *
 * Nanostores-based state for Christmas effects (snowfall, color scheme, hat, etc.)
 * Supports runtime toggle with localStorage persistence.
 */

import { atom } from 'nanostores';

const STORAGE_KEY = 'christmas-enabled';

/**
 * Christmas effects enabled state
 *
 * Controls visibility of all Christmas effects (snowfall, color scheme, hat).
 * Persists to localStorage for user preference.
 */
export const christmasEnabled = atom<boolean>(true);

/**
 * Initialize christmas state from localStorage
 * Should be called on client-side only
 */
export function initChristmasState(): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    christmasEnabled.set(stored === 'true');
  }

  // Apply initial class
  syncChristmasClass(christmasEnabled.get());
}

/**
 * Sync christmas class on html element
 */
function syncChristmasClass(enabled: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('christmas', enabled);
}

/**
 * Toggle christmas effects on/off
 */
export function toggleChristmas(): void {
  const newValue = !christmasEnabled.get();
  christmasEnabled.set(newValue);

  // Persist to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(newValue));
  }

  // Sync class
  syncChristmasClass(newValue);
}

/**
 * Enable christmas effects
 */
export function enableChristmas(): void {
  christmasEnabled.set(true);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, 'true');
  }
  syncChristmasClass(true);
}

/**
 * Disable christmas effects
 */
export function disableChristmas(): void {
  christmasEnabled.set(false);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, 'false');
  }
  syncChristmasClass(false);
}
