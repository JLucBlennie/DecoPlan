import { View, StyleSheet, Text } from "react-native";
import CircleButton from "./ui/CircleButton";
import { mainStyles } from "../App";

type Props = {
    titre: string;
    pourcentO2: number;
    pourcentHe: number;
    setShowOpenGaz: (showOpenGaz: boolean) => void;
    setShowDeleteGaz: (showDeleteGaz: boolean) => void;
    setGazName: (name: string) => void;
}

export default function GazCard({ titre, pourcentO2, pourcentHe, setShowOpenGaz, setShowDeleteGaz, setGazName }: Props) {

    function openItem() {
        setGazName(titre);
        setShowOpenGaz(true);
    }

    function deleteItem() {
        setGazName(titre);
        setShowDeleteGaz(true);
    }

    return (
        <View style={styles.cardContainer}>
            <View style={styles.titreContainer}>
                <Text style={mainStyles.text}>{titre}</Text>
                <Text style={mainStyles.text}>({pourcentO2} / {pourcentHe})</Text>
            </View>
            <View style={styles.buttonContainer}>
                <CircleButton iconName={"edit"} onPress={openItem} size={24} />
                <CircleButton iconName={"delete"} onPress={deleteItem} size={24} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 55,
    },
    titreContainer: {
        flex: 3 / 7,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flex: 4 / 7,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    }
}
);