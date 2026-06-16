import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontSize, ocean } from '../../styles/theme';
import CircleButton from './CircleButton';

type Props = {
    iconName: string;
    text: string;
    buttonSize?: number;
    onPress: () => void;
};

export default function ButtonLine({ iconName, text, buttonSize, onPress }: Props) {
    return (
        <View style={styles.lineButtonContainer}>
            {
                buttonSize === undefined ?
                    <CircleButton iconName={iconName} onPress={onPress} />
                    :
                    <CircleButton iconName={iconName} onPress={onPress} size={buttonSize} />
            }
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
        fontSize: fontSize.xs,
        color: ocean.text.muted
    },
    textContainer: {
        width: '70%',
        paddingLeft: 10
    }
});
