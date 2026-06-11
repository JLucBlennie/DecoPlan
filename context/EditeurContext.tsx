// context/EditeurContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { DivePlan } from '../lib/dive/types';

// ── Types ─────────────────────────────────────────────────────────────────────

// 'pedagogical' ajouté : écran plein-écran sans BoutonRetour, géré à part dans App.tsx
type EditeurType =
  | 'gaz' | 'addgaz' | 'editgaz'
  | 'plongee' | 'addplongee' | 'editplongee'
  | 'segment' | 'runtime' | 'about'
  | 'pedagogical'
  | null;

type EditeurContextType = {
  editeurs:          EditeurType[];
  ouvrirEditeur:     (editeur: EditeurType) => void;
  fermerEditeur:     () => void;
  editeurActif:      EditeurType;
  aUnEditeurParent:  boolean;
  /** Plans construits par le bridge, passés à PedagogicalModeScreen */
  pedagogicalPlanA:  DivePlan | null;
  pedagogicalPlanB:  DivePlan | undefined;
  /** Appeler avant ouvrirEditeur('pedagogical') */
  setPedagogicalPlans: (planA: DivePlan, planB?: DivePlan) => void;
};

// ── Contexte ──────────────────────────────────────────────────────────────────

const EditeurContext = createContext<EditeurContextType>({
  editeurs:            [],
  ouvrirEditeur:       () => {},
  fermerEditeur:       () => {},
  editeurActif:        null,
  aUnEditeurParent:    false,
  pedagogicalPlanA:    null,
  pedagogicalPlanB:    undefined,
  setPedagogicalPlans: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function EditeurProvider({ children }: { children: ReactNode }) {
  const [editeurs, setEditeurs]               = useState<EditeurType[]>([]);
  const [pedagogicalPlanA, setPedagogicalA]   = useState<DivePlan | null>(null);
  const [pedagogicalPlanB, setPedagogicalB]   = useState<DivePlan | undefined>(undefined);

  const ouvrirEditeur = (editeur: EditeurType) => {
    if (editeur) setEditeurs(prev => [...prev, editeur]);
  };

  const fermerEditeur = () => {
    setEditeurs(prev => prev.slice(0, -1));
  };

  const setPedagogicalPlans = (planA: DivePlan, planB?: DivePlan) => {
    setPedagogicalA(planA);
    setPedagogicalB(planB);
  };

  useEffect(() => {
    console.log('Editeurs mis à jour :', editeurs);
  }, [editeurs]);

  const editeurActif     = editeurs[editeurs.length - 1] || null;
  const aUnEditeurParent = editeurs.length > 1;

  return (
    <EditeurContext.Provider value={{
      editeurs, ouvrirEditeur, fermerEditeur,
      editeurActif, aUnEditeurParent,
      pedagogicalPlanA, pedagogicalPlanB, setPedagogicalPlans,
    }}>
      {children}
    </EditeurContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useEditeur() {
  const context = useContext(EditeurContext);
  if (!context) throw new Error('useEditeur must be used within an EditeurProvider');
  return context;
}
