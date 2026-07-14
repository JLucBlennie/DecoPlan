// hooks/useScreenOrientation.ts
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';

/** Verrouille l'écran en portrait et restaure au démontage */
export function useLockPortrait() {
    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
    }, []);
}

/** Autorise portrait + paysage et restaure le portrait au démontage */
export function useAllowLandscape() {
    useEffect(() => {
        ScreenOrientation.unlockAsync();   // suit la rotation physique du device
        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
    }, []);
}