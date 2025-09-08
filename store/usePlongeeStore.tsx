import { create } from 'zustand';
import { Dive } from '../lib/dive/dive';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_PLONGEE_LIST: Dive.Plongee[] = [];

// Charger les données au démarrage
const loadplongeeList = async () => {
    const savedList = await AsyncStorage.getItem('plongeeList');
    return savedList ? JSON.parse(savedList) : [];
};

// Sauvegarder les données à chaque modification
const saveplongeeList = async (list: Dive.Plongee[]) => {
    await AsyncStorage.setItem('plongeeList', JSON.stringify(list));
};

type PlongeeStore = {
    plongeeList: Dive.Plongee[];
    addPlongee: (plongee: Dive.Plongee) => Promise<void>;
    updatePlongee: (id: string, plongee: Partial<Dive.Plongee>) => Promise<void>;
    deletePlongee: (id: string) => Promise<void>;
    setplongeeList: (list: Dive.Plongee[]) => Promise<void>;
    initialize: () => Promise<void>;
    resetList: () => Promise<void>;
};

export const usePlongeeStore = create<PlongeeStore>((set) => ({
    plongeeList: [],

    // Ajoute un plongee et sauvegarde
    addPlongee: async (plongee) => {
        if (plongee.id) {
            const newList = [...usePlongeeStore.getState().plongeeList, plongee];
            await AsyncStorage.setItem('plongeeList', JSON.stringify(newList));
            set({ plongeeList: newList });
        }
    },

    // Met à jour un plongee et sauvegarde
    updatePlongee: async (id, plongee) => {
        const newList = usePlongeeStore.getState().plongeeList.map((p) =>
            p.id === id ? { ...p, ...plongee } : p
        );
        await AsyncStorage.setItem('plongeeList', JSON.stringify(newList));
        set({ plongeeList: newList });
    },

    // Supprime un plongee et sauvegarde
    deletePlongee: async (id) => {
        const newList = usePlongeeStore.getState().plongeeList.filter((p) => p.id !== id);
        await AsyncStorage.setItem('plongeeList', JSON.stringify(newList));
        set({ plongeeList: newList });
    },

    setplongeeList: async (list) => {
        saveplongeeList(list);
        set({ plongeeList: list }
        )
    },

    // Charger les données au démarrage
    initialize: async () => {
        try {
            const savedList = await AsyncStorage.getItem('plongeeList');
            if (savedList) {
                set({ plongeeList: JSON.parse(savedList) });
            } else {
                // Premier démarrage : utilise la liste par défaut
                await AsyncStorage.setItem('plongeeList', JSON.stringify(DEFAULT_PLONGEE_LIST));
                set({ plongeeList: DEFAULT_PLONGEE_LIST });
            }
        } catch (error) {
            console.error("Erreur lors de l'initialisation des plongees :", error);
            set({ plongeeList: DEFAULT_PLONGEE_LIST });
        }
    },
    resetList: async () => {
        const savedList = await AsyncStorage.getItem('plongeeList');
        if (savedList) {
            await AsyncStorage.removeItem('plongeeList');
        }
        // Premier démarrage : utilise la liste par défaut
        await AsyncStorage.setItem('plongeeList', JSON.stringify(DEFAULT_PLONGEE_LIST));
        set({ plongeeList: DEFAULT_PLONGEE_LIST });
    }
}));
