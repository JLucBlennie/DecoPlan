import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Gas } from '../lib/dive/gas';
import type { GasData } from '../lib/dive/types';

// ── Gaz par défaut ────────────────────────────────────────────────────────────
const DEFAULT_GAZ_LIST: Gas[] = [
    Gas.create('Tx2135', 0.21, 0.35),
    Gas.create('Tx2121', 0.21, 0.21),
    Gas.create('Tx2118', 0.21, 0.18),
    Gas.create('Nx50', 0.50, 0),
    Gas.create('Nx40', 0.40, 0),
    Gas.create('Nx80', 0.80, 0),
];

// ── Persistence ───────────────────────────────────────────────────────────────

/**
 * Sauvegarde la liste. Gas.toJSON() est appelé implicitement par JSON.stringify
 * car la classe Gas implémente toJSON() → ce qui est stocké est du GasData pur.
 */
const saveGazList = async (list: Gas[]): Promise<void> => {
    await AsyncStorage.setItem('gazList', JSON.stringify(list));
};

// ── Types du store ────────────────────────────────────────────────────────────

type GazStore = {
    gazList: Gas[];
    /**
     * Gaz en cours d'édition dans GazForm.
     * `null` = aucun gaz sélectionné (état initial ou après fermeture du formulaire).
     */
    selectedGaz: Gas | null;

    setSelectedGaz: (gaz: Gas | null) => void;
    addGaz: (gaz: Gas) => Promise<void>;
    /**
     * Met à jour un gaz existant à partir de données partielles.
     * Reconstruit une instance `Gas` propre (avec méthodes) en interne.
     */
    updateGaz: (id: string, data: Pick<GasData, 'name' | 'fO2' | 'fHe'>) => Promise<void>;
    deleteGaz: (id: string) => Promise<void>;
    setGazList: (list: Gas[]) => Promise<void>;
    initializeGazList: () => Promise<void>;
    resetGazList: () => Promise<void>;
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useGazStore = create<GazStore>((set) => ({
    gazList: [],
    selectedGaz: null,

    // ── Sélection ──────────────────────────────────────────────────────────────
    setSelectedGaz: (gaz) => {
        set({ selectedGaz: gaz });
    },

    // ── Ajout ─────────────────────────────────────────────────────────────────
    addGaz: async (gaz) => {
        if (!gaz.id) return;
        const newList = [...useGazStore.getState().gazList, gaz];
        set({ gazList: newList });
        await saveGazList(newList);
    },

    // ── Mise à jour ────────────────────────────────────────────────────────────
    /**
     * Reconstruit une instance Gas à partir des données modifiées.
     * On conserve le même `id` et on recrée les méthodes de classe proprement.
     * ⚠️  Le spread `{ ...g, ...data }` NE FONCTIONNE PAS sur des classes :
     *     il perd le prototype et donc toutes les méthodes.
     */
    updateGaz: async (id, data) => {
        const current = useGazStore.getState().gazList;
        const newList = current.map(g =>
            g.id === id
                ? new Gas(id, data.name, data.fO2, data.fHe)  // ← instance propre
                : g
        );
        set({ gazList: newList });
        await saveGazList(newList);
    },

    // ── Suppression ────────────────────────────────────────────────────────────
    deleteGaz: async (id) => {
        const newList = useGazStore.getState().gazList.filter(g => g.id !== id);
        set({ gazList: newList });
        await saveGazList(newList);
    },

    // ── Remplacement complet ───────────────────────────────────────────────────
    setGazList: async (list) => {
        set({ gazList: list });
        await saveGazList(list);
    },

    // ── Initialisation (chargement AsyncStorage) ───────────────────────────────
    initializeGazList: async () => {
        try {
            const saved = await AsyncStorage.getItem('gazList');
            if (saved) {
                /**
                 * JSON.parse retourne des objets plats (GasData) sans méthodes.
                 * Gas.fromJSON() restaure une instance Gas avec son prototype complet.
                 * Sans cet appel, gaz.modInMeters() plante dans GazCard et partout ailleurs.
                 */
                const data: GasData[] = JSON.parse(saved);
                set({ gazList: data.map(Gas.fromJSON) });
            } else {
                await saveGazList(DEFAULT_GAZ_LIST);
                set({ gazList: DEFAULT_GAZ_LIST });
            }
        } catch (error) {
            console.error("Erreur lors de l'initialisation des gaz :", error);
            set({ gazList: DEFAULT_GAZ_LIST });
        }
    },

    // ── Reset ──────────────────────────────────────────────────────────────────
    resetGazList: async () => {
        await AsyncStorage.removeItem('gazList');
        await saveGazList(DEFAULT_GAZ_LIST);
        set({ gazList: DEFAULT_GAZ_LIST });
    },
}));