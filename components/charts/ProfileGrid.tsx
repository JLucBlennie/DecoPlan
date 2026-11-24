// components/charts/ProfileGrid.tsx
// Grille et graduations d'un graphique de profil, à placer dans un <Svg>.
import React from 'react';
import { Line, Text as SvgText } from 'react-native-svg';

import { depthTicks, PL, PT, type ProfileScale } from './profileFrame';

export interface TimeTick {
    /** Position sur l'axe des abscisses, en minutes. */
    atMin: number;
    label: string;
}

type Props = {
    scale: ProfileScale;
    height: number;
    timeTicks: TimeTick[];
};

const GRID = 'rgba(255,255,255,0.07)';
const GRID_TIME = 'rgba(255,255,255,0.05)';
const SURFACE = 'rgba(255,255,255,0.2)';
const LABEL = '#5F5E5A';

export default function ProfileGrid({ scale, height, timeTicks }: Props) {
    const { pw, ph, tx, ty, axisMaxM } = scale;
    return (
        <>
            {depthTicks(axisMaxM).map(d => (
                <React.Fragment key={`d${d}`}>
                    <Line x1={PL} y1={ty(d)} x2={PL + pw} y2={ty(d)} stroke={GRID} strokeWidth={0.5} />
                    <SvgText x={PL - 4} y={ty(d) + 3.5} textAnchor="end" fontSize={9} fill={LABEL}>{d}m</SvgText>
                </React.Fragment>
            ))}
            <Line x1={PL} y1={ty(0)} x2={PL + pw} y2={ty(0)} stroke={SURFACE} strokeWidth={0.5} />
            {timeTicks.map(t => (
                <React.Fragment key={`t${t.atMin}`}>
                    <Line x1={tx(t.atMin)} y1={PT} x2={tx(t.atMin)} y2={PT + ph} stroke={GRID_TIME} strokeWidth={0.5} />
                    <SvgText x={tx(t.atMin)} y={height - 4} textAnchor="middle" fontSize={9} fill={LABEL}>{t.label}</SvgText>
                </React.Fragment>
            ))}
        </>
    );
}
