import { create } from 'zustand';
import { Dive } from '../lib/dive/dive';
import AsyncStorage from '@react-native-async-storage/async-storage';

const gazFond1 = Dive.gas("Tx2135", 0.21, 0.35);
const gazFond2 = Dive.gas("Tx2121", 0.21, 0.21);
const gazFond3 = Dive.gas("Tx2118", 0.21, 0.18);
const gazDeco1 = Dive.gas("Nx50", 0.5, 0);
const gazDeco2 = Dive.gas("Nx40", 0.4, 0);
const gazDeco3 = Dive.gas("Nx80", 0.8, 0);

const DEFAULT_GAZ_LIST: Dive.Gas[] = [gazFond1, gazFond2, gazFond3, gazDeco1, gazDeco2, gazDeco3];

// Sauvegarder les données à chaque modification
const saveGazList = async (list: Dive.Gas[]) => {
    await AsyncStorage.setItem('gazList', JSON.stringify(list));
};

type GazStore = {
    gazList: Dive.Gas[];
    addGaz: (gaz: Dive.Gas) => Promise<void>;
    updateGaz: (id: string, gaz: Partial<Dive.Gas>) => Promise<void>;
    deleteGaz: (id: string) => Promise<void>;
    setGazList: (list: Dive.Gas[]) => Promise<void>;
    initializeGazList: () => Promise<void>;
    resetGazList: () => Promise<void>;
};

export const useGazStore = create<GazStore>((set) => ({
    gazList: [],

    // Ajoute un gaz et sauvegarde
    addGaz: async (gaz) => {
        if (gaz.id) {
            const newList = [...useGazStore.getState().gazList, gaz];
            set({ gazList: newList });
            saveGazList(newList);
        }
    },

    // Met à jour un gaz et sauvegarde
    updateGaz: async (id, gaz) => {
        const newList = useGazStore.getState().gazList.map((g) =>
            g.id === id ? { ...g, ...gaz } : g
        );
        saveGazList(newList);
        set({ gazList: newList });
    },
    
    // Supprime un gaz et sauvegarde
    deleteGaz: async (id) => {
        const newList = useGazStore.getState().gazList.filter((g) => g.id !== id);
        saveGazList(newList);
        set({ gazList: newList });
    },
    
    setGazList: async (list) => {
        saveGazList(list);
        set({ gazList: list }
        )
    },
    
    // Charger les données au démarrage
    initializeGazList: async () => {
        try {
            const savedList = await AsyncStorage.getItem('gazList');
            if (savedList) {
                set({ gazList: JSON.parse(savedList) });
            } else {
                // Premier démarrage : utilise la liste par défaut
                saveGazList(DEFAULT_GAZ_LIST);
                set({ gazList: DEFAULT_GAZ_LIST });
            }
        } catch (error) {
            console.error("Erreur lors de l'initialisation des gaz :", error);
            set({ gazList: DEFAULT_GAZ_LIST });
        }
    },
    resetGazList: async () => {
        const savedList = await AsyncStorage.getItem('gazList');
        if (savedList) {
            await AsyncStorage.removeItem('gazList');
        }
        // Premier démarrage : utilise la liste par défaut
        saveGazList(DEFAULT_GAZ_LIST);
        set({ gazList: DEFAULT_GAZ_LIST });
    }
}));
