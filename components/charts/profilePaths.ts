// components/charts/profilePaths.ts
// Tracés SVG d'un profil : ligne brisée et surface remplie jusqu'à la surface (0 m).
import type { ProfilePoint } from '../../lib/dive';
import type { ProfileScale } from './profileFrame';

export function polylineOf(points: ProfilePoint[], { tx, ty }: ProfileScale): string {
    return points.map(p => `${tx(p.timeMin).toFixed(1)},${ty(p.depthM).toFixed(1)}`).join(' ');
}

export function fillPathOf(points: ProfilePoint[], { tx, ty }: ProfileScale): string {
    const line = points.map(p => `L ${tx(p.timeMin).toFixed(1)} ${ty(p.depthM).toFixed(1)}`).join(' ');
    const first = points[0];
    const last = points[points.length - 1];
    return `M ${tx(first.timeMin).toFixed(1)} ${ty(0).toFixed(1)} ${line} L ${tx(last.timeMin).toFixed(1)} ${ty(0).toFixed(1)} Z`;
}
