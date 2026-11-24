// components/charts/ProfileLevelZones.tsx
// Zones grisées sous le fond et les paliers, avec leur étiquette « 9m·3' » (comme le mode pédagogique).
import React from 'react';
import { Rect, Text as SvgText } from 'react-native-svg';

import { PT, type ProfileScale } from './profileFrame';
import type { FlatLevel } from './flatLevels';

type Props = { scale: ProfileScale; levels: FlatLevel[] };

export default function ProfileLevelZones({ scale: { tx, ty, ph }, levels }: Props) {
    return (
        <>
            {levels.map((l, i) => (
                <Rect
                    key={`z${i}`}
                    x={tx(l.startMin)} y={ty(l.depthM)}
                    width={tx(l.endMin) - tx(l.startMin)}
                    height={ph - (ty(l.depthM) - PT)}
                    fill="rgba(250,199,117,0.10)"
                />
            ))}
            {levels.map((l, i) => (
                <SvgText
                    key={`l${i}`}
                    x={tx((l.startMin + l.endMin) / 2)} y={ty(l.depthM) - 5}
                    textAnchor="middle" fontSize={8} fill="#BA7517"
                >
                    {l.depthM}m·{Math.round(l.endMin - l.startMin)}'
                </SvgText>
            ))}
        </>
    );
}
