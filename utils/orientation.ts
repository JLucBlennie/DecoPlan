import * as ScreenOrientation from 'expo-screen-orientation';
import { Platform } from 'react-native';

const isSupported = Platform.OS !== 'web';

export async function lockPortrait(): Promise<void> {
    if (!isSupported) return;
    try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (e) {
        console.warn('Verrouillage d’orientation impossible', e);
    }
}

export async function unlockOrientation(): Promise<void> {
    if (!isSupported) return;
    try {
        await ScreenOrientation.unlockAsync();
    } catch (e) {
        console.warn('Déverrouillage d’orientation impossible', e);
    }
}