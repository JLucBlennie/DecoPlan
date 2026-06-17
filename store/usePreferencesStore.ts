// store/usePreferencesStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Preferences {
    /** Gradient Factor Low par défaut (0.10 – 0.85) */
    gfLow: number;
    /** Gradient Factor High par défaut (0.50 – 1.00) */
    gfHigh: number;
    /** RMV surface au fond (L/min) */
    rmvFond: number;
    /** RMV surface aux paliers déco (L/min) — plus faible : effort réduit */
    rmvDeco: number;
    /** Vitesse de descente (m/min) */
    descentRateMMin: number;
    /** Vitesse de remontée (m/min) — norme FFESSM : 9–15 m/min */
    ascentRateMMin: number;
}

type PreferencesStore = Preferences & {
    isLoaded: boolean;
    load: () => Promise<void>;
    update: (patch: Partial<Preferences>) => Promise<void>;
    reset: () => Promise<void>;
};

// ── Valeurs par défaut ────────────────────────────────────────────────────────

export const DEFAULT_PREFERENCES: Preferences = {
    gfLow: 0.30,
    gfHigh: 0.85,
    rmvFond: 20,
    rmvDeco: 15,
    descentRateMMin: 20,
    ascentRateMMin: 10,
};

const STORAGE_KEY = 'decoplan_preferences';

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
    ...DEFAULT_PREFERENCES,
    isLoaded: false,

    load: async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed: Partial<Preferences> = JSON.parse(saved);
                // Merge avec les defaults (protège contre les clés manquantes)
                set({ ...DEFAULT_PREFERENCES, ...parsed, isLoaded: true });
            } else {
                set({ isLoaded: true });
            }
        } catch {
            set({ isLoaded: true });
        }
    },

    update: async (patch) => {
        const next = { ...get(), ...patch };
        set(patch);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
            gfLow: next.gfLow,
            gfHigh: next.gfHigh,
            rmvFond: next.rmvFond,
            rmvDeco: next.rmvDeco,
            descentRateMMin: next.descentRateMMin,
            ascentRateMMin: next.ascentRateMMin,
        }));
    },

    reset: async () => {
        set({ ...DEFAULT_PREFERENCES });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
    },
}));