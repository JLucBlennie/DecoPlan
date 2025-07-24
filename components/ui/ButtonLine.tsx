import { View, StyleSheet, Text, Pressable } from 'react-native';
import CircleButton from './CircleButton';

type Props = {
    iconName: string;
    text: string;
    onPress: () => void;
};

export default function ButtonLine({ iconName, text, onPress }: Props) {
    return (
        <View style={styles.lineButtonContainer}>
            <CircleButton iconName={iconName} onPress={onPress} />
            <Pressable style={styles.textContainer} onPress={onPress}>
                <Text style={styles.textDesc}>{text}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    lineButtonContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
        height: 100,
        padding: 3
    },
    textDesc: {
        fontSize: 24,
        color: '#0428f1ff'
    },
    textContainer: {
        width: '70%',
        paddingLeft: 10
    }
});
