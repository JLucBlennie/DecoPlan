# MIGRATION_GUIDE
---
Guide de migration EditeurContext → React Navigation  
Chaque section montre le AVANT et l'APRÈS pour chaque composant.

## 1. INSTALLATION 

```
  npx expo install @react-navigation/native @react-navigation/native-stack 
  npx expo install react-native-screens react-native-safe-area-context 
```

Ajouter dans app.json (si pas déjà présent) :  
`  "experiments": { "typedRoutes": true }   ← optionnel mais recommandé `

## 2. MenuPrincipal 
### AVANT :
```typescript
  const { ouvrirEditeur } = useEditeur();
  <TouchableOpacity onPress={() => ouvrirEditeur('gaz')}>
 ```
### APRÈS :
```typescript
  const navigation = useNavigation<AppNavProp>();
  <TouchableOpacity onPress={() => navigation.navigate('GestionGaz')}>
```
### Aucun autre changement.  
Le bouton "À propos" devient `navigation.navigate('About')`.

## 3. GestionGaz

### AVANT :
```typescript
  const { ouvrirEditeur } = useEditeur();
  ouvrirEditeur('addgaz')
  setSelectedGaz(gaz); ouvrirEditeur('editgaz')
```
### APRÈS :
```typescript
  const navigation = useNavigation<AppNavProp>();
  navigation.navigate('AddGaz')
  navigation.navigate('EditGaz', { gazId: gaz.id })   ← id seulement
```
## 4. GazForm 

### AVANT :
```typescript
  type GazFormProps = { gaz: Gas; onClose: () => void }
  gaz passé via le store (selectedGaz) depuis App.tsx
  const { fermerEditeur } = useEditeur();
  fermerEditeur(); onClose();
```
### APRÈS :
```typescript
  import { useRoute, useNavigation } from '@react-navigation/native';
  import type { AppRouteProp, AppNavProp } from '../navigation/types';

  export default function GazForm() {          ← plus de props
    const navigation = useNavigation<AppNavProp>();
    const { gazId }  = useRoute<AppRouteProp<'EditGaz'>>().params;
    const { gazList, updateGaz } = useGazStore();
    const gaz = gazList.find(g => g.id === gazId)!;

    const handleSubmit = () => {
      updateGaz(gaz.id, { name: nom, fO2, fHe });
      navigation.goBack();    ← ferme la modale, pas besoin de callback onClose
    };
  }
```
BoutonRetour → disparaît, la modale se ferme avec le swipe ↓ ou le ← du header.  
onClose → disparaît, plus besoin de réinitialiser selectedGaz.

## 5. GestionPlongee 

### AVANT :
```typescript
  setSelectedPlongee(plongee); ouvrirEditeur('editplongee')
  ouvrirEditeur('addplongee')
```
### APRÈS :
```typescript
  navigation.navigate('EditPlongee', { plongeeId: plongee.id })
  navigation.navigate('AddPlongee')
```
## 6. PlongeeForm 

Même pattern que GazForm :
```typescript
  const { plongeeId } = useRoute<AppRouteProp<'EditPlongee'>>().params;
  const plongee = plongeeList.find(p => p.id === plongeeId)!;
```
  Fin du submit → `navigation.goBack()`

## 7. RuntimeScreen

### AVANT :
```typescript
  const { ouvrirEditeur, setPedagogicalPlans } = useEditeur();
  setPedagogicalPlans(planA, planB);
  ouvrirEditeur('pedagogical');
```
### APRÈS :
```typescript
  const navigation = useNavigation<AppNavProp>();
  const { setPlans } = usePedagogicalStore();
  setPlans(planA, planB);
  navigation.navigate('Pedagogical');
```
## 8. Ce qui disparaît complètement 
| Fichier | Statut |
|:--------|-------|
| context/EditeurContext.tsx    | → supprimé |
| components/BoutonRetour.tsx   | → supprimé (ou gardé si utilisé ailleurs) |
|  store : selectedGaz          | → supprimé (remplacé par route.params.gazId) |
|  store : selectedPlongee      | → supprimé (remplacé par route.params.plongeeId) |
|  App.tsx handleCloseGazForm   | → supprimé |
|  App.tsx handleClosePlongeeForm | → supprimé |

## 9. Ce qui ne change PAS 
* Toute la logique métier des composants (calculs, stores, etc.)  
* Les styles et le thème  
* Les composants "feuille" (`GazCard`, `TankConfigRow`, `ManometerGauge`, etc.)
`useGazStore`, `usePlongeeStore` (sauf suppression de `selectedGaz`/`selectedPlongee`),`PedagogicalModeScreen`, `PedagogicalConfigSheet`, etc.
