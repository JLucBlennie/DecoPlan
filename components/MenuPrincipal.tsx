import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { EditeurContext } from '../context/EditeurContext';
import { mainStyles } from '../App';
import ButtonLine from './ui/ButtonLine';
import appJson from '../app.json';

export default function MenuPrincipal() {
    const { setEditeurActif } = useContext(EditeurContext);

    return (
        <View style={mainStyles.editorContainer}>
            <Text style={mainStyles.titre} >{appJson.expo.name} by JLuc - V{appJson.expo.version}</Text>
            <ButtonLine iconName={'gaz'} text={'Gestion des Gaz'} onPress={() => setEditeurActif('gaz')} />
            <ButtonLine iconName={'dive'} text={'Gestion des Plongées'} onPress={() => setEditeurActif('plongee')} />
            <ButtonLine iconName={'gear'} text={'Lancement Runtime'} onPress={() => setEditeurActif('runtime')} />
            <ButtonLine iconName={'help'} text={'A propos...'} onPress={() => setEditeurActif('about')} />
        </View>
    );
}