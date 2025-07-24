import { View, StyleSheet, Text } from "react-native";
import CircleButton from "./ui/CircleButton";

type Props = {
    titre: string;
    pourcentO2: number;
    pourcentHe: number;
    openGaz: (name: string) => void;
    deleteGaz: (name: string) => void;
}

export default function GazCard({ titre, pourcentO2, pourcentHe, openGaz, deleteGaz }: Props) {
    function openItem() {
        openGaz(titre);
    }

    function deleteItem() {
        deleteGaz(titre);
    }
    
    return (
        <View style={styles.cardContainer}>
            <View style={styles.titreContainer}>
                <Text>{titre} {pourcentO2} / {pourcentHe}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <CircleButton iconName={"edit"} onPress={openItem} />
                <CircleButton iconName={"delete"} onPress={deleteItem} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    titreContainer: {
        flex: 2 / 3,
    },
    buttonContainer: {
        flex: 1 / 3,
        flexDirection: 'row'
    }
}
);