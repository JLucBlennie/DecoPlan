import { createContext, Dispatch, SetStateAction } from 'react';

type EditeurActif = 'gaz' | 'plongee' | 'about' | null;

type EditeurContextType = {
  editeurActif: EditeurActif;
  setEditeurActif: Dispatch<SetStateAction<EditeurActif>>;
};

export const EditeurContext = createContext<EditeurContextType>({
  editeurActif: null,
  setEditeurActif: () => {},
});
