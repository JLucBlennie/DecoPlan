// components/charts/ProfilePlot.tsx
// Zone de tracé : mesure la largeur disponible et la passe aux enfants.
//
// La largeur vient d'un conteneur dont la taille ne dépend PAS du SVG (sinon boucle de mesure :
// le SVG élargit la carte, qui élargit le SVG…). Le SVG est donc posé en absolu dedans.
import React, { useState, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { MIN_WIDTH } from './profileFrame';

type Props = {
    height: number;
    /** Style supplémentaire du conteneur (ex. `{ flex: 1 }` quand une légende est à côté). */
    style?: ViewStyle;
    children: (width: number) => ReactNode;
};

export default function ProfilePlot({ height, style, children }: Props) {
    const [width, setWidth] = useState(320);
    return (
        <View
            style={[{ alignSelf: 'stretch', height }, style]}
            onLayout={e => setWidth(Math.max(MIN_WIDTH, Math.floor(e.nativeEvent.layout.width)))}
        >
            <View style={StyleSheet.absoluteFill}>{children(width)}</View>
        </View>
    );
}
