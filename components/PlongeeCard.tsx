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
                <Text style={mainStyles.text}>{plongee.name}</Text>
                <Text style={mainStyles.text}>({Dive.calculProfondeurMax(plongee)} / {Dive.calculTemps(plongee)})</Text>
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