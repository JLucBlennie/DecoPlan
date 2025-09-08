import { View, Text } from "react-native";
import { mainStyles } from "../App";

export default function RuntimeScreen() {
    return (
        <View style={mainStyles.editorContainer}>
            <Text style={mainStyles.text}>Lancement du calul du Runtime...</Text>

            {/* Partie de paramétrage pour les GF et vitesses ... */}
            {/* Liste des plongée avec 1 seul choix */}
            {/* Bouton de lancement du calcul */}
            {/* Affichage du tableau de résultat */}
        </View>
    ) ;
}