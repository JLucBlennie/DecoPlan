import React, { useContext } from 'react';
import { EditeurContext } from '../context/EditeurContext';
import ButtonLine from './ui/ButtonLine';

export default function BoutonRetour() {
  const { setEditeurActif } = useContext(EditeurContext);

  return (
    <ButtonLine iconName={'back'} text={'Retour au menu...'} onPress={() => setEditeurActif(null)} buttonSize={24} />
  );
}