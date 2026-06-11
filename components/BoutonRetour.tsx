import ButtonLine from './ui/ButtonLine';

type BoutonRetourProps = {
  onPress: () => void;
};
export default function BoutonRetour({onPress}:BoutonRetourProps) {

  return (
    <ButtonLine iconName={'back'} text={'Retour au menu...'} onPress={onPress} buttonSize={24} />
  );
}