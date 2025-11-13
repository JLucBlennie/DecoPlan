import { View, StyleSheet, Text } from "react-native";
import CircleButton from "./ui/CircleButton";
import { Dive } from "../lib/dive/dive";
import { mainStyles } from "../styles/mainStyles";

type GazCardProps = {
    gaz: Dive.Gas;
    onPress: () => void;
    onDelete: () => void;
}

export default function GazCard({ gaz, onPress, onDelete }: GazCardProps) {

    return (
        <View style={styles.cardContainer}>
            <View style={styles.titreContainer}>
                <Text style={mainStyles.text}>{gaz.name} - ({gaz.fO2 * 100} / {gaz.fHe * 100})</Text>
            </View>
            <View style={styles.buttonContainer}>
                <CircleButton iconName={"edit"} onPress={onPress} size={24} />
                <CircleButton iconName={"delete"} onPress={onDelete} size={24} />
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
        alignSelf: 'stretch',
    },
    titreContainer: {
        flex: 5 / 8,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    buttonContainer: {
        flex: 3 / 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
}
);