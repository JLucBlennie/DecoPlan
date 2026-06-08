import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Plongee } from '../lib/dive';

const DEFAULT_PLONGEE_LIST: Plongee[] = [];

// Sauvegarder les données à chaque modification
const savePlongeeList = async (list: Plongee[]) => {
    await AsyncStorage.setItem('plongeeList', JSON.stringify(list));
};

type PlongeeStore = {
    plongeeList: Plongee[];
    selectedPlongee: Plongee;
    setSelectedPlongee: (plongee: Plongee) => Promise<void>;
    addPlongee: (plongee: Plongee) => Promise<void>;
    updatePlongee: (id: string, plongee: Partial<Plongee>) => Promise<void>;
    deletePlongee: (id: string) => Promise<void>;
    setplongeeList: (list: Plongee[]) => Promise<void>;
    initializePlongeeList: () => Promise<void>;
    resetPlongeeList: () => Promise<void>;
};

export const usePlongeeStore = create<PlongeeStore>((set) => ({
    plongeeList: [],
    selectedPlongee: {
        name: '',
        id: '',
        segments: [],
        gazFond: [],
        gazDeco: []
    },
    setSelectedPlongee: async (plongee) => {
        set({ selectedPlongee: plongee });
    },
    // Ajoute un plongee et sauvegarde
    addPlongee: async (plongee) => {
        if (plongee.id) {
            const newList = [...usePlongeeStore.getState().plongeeList, plongee];
            savePlongeeList(newList);
            set({ plongeeList: newList });
        }
    },

    // Met à jour un plongee et sauvegarde
    updatePlongee: async (id, plongee) => {
        const newList = usePlongeeStore.getState().plongeeList.map((p) =>
            p.id === id ? { ...p, ...plongee } : p
        );
        savePlongeeList(newList);
        set({ plongeeList: newList });
    },

    // Supprime un plongee et sauvegarde
    deletePlongee: async (id) => {
        const newList = usePlongeeStore.getState().plongeeList.filter((p) => p.id !== id);
        savePlongeeList(newList);
        set({ plongeeList: newList });
    },

    setplongeeList: async (list) => {
        savePlongeeList(list);
        set({ plongeeList: list }
        )
    },

    // Charger les données au démarrage
    initializePlongeeList: async () => {
        try {
            const savedList = await AsyncStorage.getItem('plongeeList');
            if (savedList) {
                set({ plongeeList: JSON.parse(savedList) });
            } else {
                // Premier démarrage : utilise la liste par défaut
                savePlongeeList(DEFAULT_PLONGEE_LIST);
                set({ plongeeList: DEFAULT_PLONGEE_LIST });
            }
        } catch (error) {
            console.error("Erreur lors de l'initialisation des plongees :", error);
            set({ plongeeList: DEFAULT_PLONGEE_LIST });
        }
    },
    resetPlongeeList: async () => {
        const savedList = await AsyncStorage.getItem('plongeeList');
        if (savedList) {
            await AsyncStorage.removeItem('plongeeList');
        }
        // Premier démarrage : utilise la liste par défaut
        savePlongeeList(DEFAULT_PLONGEE_LIST);
        set({ plongeeList: DEFAULT_PLONGEE_LIST });
    }
}));
