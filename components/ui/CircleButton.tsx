import { View, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = {
    iconName: string;
    onPress: () => void;
    position?: string;
};

export default function CircleButton({ iconName, onPress, position }: Props) {
    return (
        <View style={position === 'Right' ? { paddingLeft: 50 } : position === 'Left' ? { paddingRight: 50 } : {}}>
            <View style={styles.circleButtonContainer}>
                <Pressable style={styles.circleButton} onPress={onPress}>
                    {
                        iconName === "check" &&
                        <MaterialIcons name="check" size={38} color="#25292e" />
                    }
                    {
                        iconName === "clear" &&
                        <MaterialIcons name="clear" size={38} color="#25292e" />
                    }
                    {
                        iconName === "camera" &&
                        <MaterialIcons name="camera-alt" size={38} color="#25292e" />
                    }
                    {
                        iconName === "cancel" &&
                        <MaterialIcons name="cancel" size={38} color="#25292e" />
                    }
                    {
                        iconName === "delete" &&
                        <MaterialIcons name="delete" size={38} color="#25292e" />
                    }
                    {
                        iconName === "image" &&
                        <MaterialIcons name="image" size={38} color="#25292e" />
                    }
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    circleButtonContainer: {
        width: 84,
        height: 84,
        borderWidth: 4,
        borderColor: '#ffd33d',
        borderRadius: 42,
        padding: 3,
    },
    circleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 42,
        backgroundColor: '#fff',
    },
});
