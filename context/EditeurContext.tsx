// context/EditeurContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type EditeurType = 'gaz' | 'addgaz' | 'editgaz' | 'plongee' | 'addplongee' | 'editplongee' | 'segment' | 'runtime' | 'about' | null;

type EditeurContextType = {
  editeurs: EditeurType[];  // Pile d'éditeurs (ex: ["plongee", "segment"])
  ouvrirEditeur: (editeur: EditeurType) => void;
  fermerEditeur: () => void;
  editeurActif: EditeurType;  // Éditeur courant (dernier de la pile)
  aUnEditeurParent: boolean;   // Vrai si un éditeur est imbriqué
};

const EditeurContext = createContext<EditeurContextType>({
  editeurs: [],
  ouvrirEditeur: () => { },
  fermerEditeur: () => { },
  editeurActif: null,
  aUnEditeurParent: false,
});

export function EditeurProvider({ children }: { children: ReactNode }) {
  const [editeurs, setEditeurs] = useState<EditeurType[]>([]);

  const ouvrirEditeur = (editeur: EditeurType) => {
    if (editeur) {
      setEditeurs([...editeurs, editeur]);
    }
  };

  useEffect(() => {
    console.log("Editeurs mis à jour :", editeurs);
  }, [editeurs]);

  const fermerEditeur = () => {
    console.log("FermerEditeur begin : ");
    console.log(editeurs);
    console.log("FermerEditeur slice : ");
    const nouvelleListe = editeurs.slice(0, -1);
    console.log(nouvelleListe);
    setEditeurs(nouvelleListe);
  };

  const editeurActif = editeurs[editeurs.length - 1] || null;
  const aUnEditeurParent = editeurs.length > 1;  // Vrai si imbriqué

  return (
    <EditeurContext.Provider value={{ editeurs, ouvrirEditeur, fermerEditeur, editeurActif, aUnEditeurParent }}>
      {children}
    </EditeurContext.Provider>
  );
}

export function useEditeur() {
  const context = useContext(EditeurContext);
  if (!context) throw new Error('useEditeur must be used within an EditeurProvider');
  return context;
}
