import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { useEditeur } from '../context/EditeurContext';
import ButtonLine from './ui/ButtonLine';
import appJson from '../app.json';
import { mainStyles } from '../styles/mainStyles';

export default function MenuPrincipal() {
    const { ouvrirEditeur } = useEditeur();

    return (
        <View style={mainStyles.editorContainer}>
            <Text style={mainStyles.titre} >{appJson.expo.name} by JLuc - V{appJson.expo.version}</Text>
            <ButtonLine iconName={'gaz'} text={'Gestion des Gaz'} onPress={() => ouvrirEditeur('gaz')} />
            <ButtonLine iconName={'dive'} text={'Gestion des Plongées'} onPress={() => ouvrirEditeur('plongee')} />
            <ButtonLine iconName={'gear'} text={'Lancement Runtime'} onPress={() => ouvrirEditeur('runtime')} />
            <ButtonLine iconName={'help'} text={'A propos...'} onPress={() => ouvrirEditeur('about')} />
        </View>
    );
}