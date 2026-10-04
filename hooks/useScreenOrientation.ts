// hooks/useScreenOrientation.ts
import { useEffect } from 'react';
import { lockPortrait, unlockOrientation } from '../utils/orientation';

/** Verrouille l'écran en portrait et restaure au démontage */
export function useLockPortrait() {
    useEffect(() => {


        lockPortrait();  // verrouille le portrait
        return () => {
            lockPortrait();  // on restaure le portrait au démontage
        };
    }, []);
}

/** Autorise portrait + paysage et restaure le portrait au démontage */
export function useAllowLandscape() {
    useEffect(() => {
        unlockOrientation();   // suit la rotation physique du device
        return () => {
            lockPortrait();  // on restaure le portrait au démontage
        };
    }, []);
}