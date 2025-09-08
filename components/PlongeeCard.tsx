import { View, Text, StyleSheet } from "react-native";
import { Dive } from "../lib/dive/dive";
import { mainStyles } from "../App";
import CircleButton from "./ui/CircleButton";

type PlongeeCardProps = {
    plongee: Dive.Plongee;
    onPress: () => void;
    onDelete: () => void;
}

export default function PlongeeCard({ plongee, onPress, onDelete }: PlongeeCardProps) {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.titreContainer}>
                <Text style={mainStyles.text}>{plongee.name} - ({Dive.calculProfondeurMax(plongee)} / {Dive.calculTemps(plongee)})</Text>
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