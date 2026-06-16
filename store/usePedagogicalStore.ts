// store/usePedagogicalStore.ts
import { create } from 'zustand';
import type { DivePlan } from '../lib/dive/types';

type PedagogicalStore = {
  planA: DivePlan | null;
  planB: DivePlan | undefined;
  setPlans: (planA: DivePlan, planB?: DivePlan) => void;
  clear:    () => void;
};

export const usePedagogicalStore = create<PedagogicalStore>((set) => ({
  planA:    null,
  planB:    undefined,
  setPlans: (planA, planB) => set({ planA, planB }),
  clear:    () => set({ planA: null, planB: undefined }),
}));
