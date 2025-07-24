import { View, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
    iconName: string;
    onPress: () => void;
    position?: string;
    size?: number;
};

export default function CircleButton({ iconName, onPress, position, size }: Props) {
    const tailleBouton: number = (size === undefined ? 38 : size);
    const tailleBorder: number = (size === undefined ? 84 : tailleBouton * 2.2);
    const tailleBorderRaduis: number = (size === undefined ? 42 : tailleBorder / 2);

    return (
        <View style={position === 'Right' ? { paddingLeft: 50 } : position === 'Left' ? { paddingRight: 50 } : {}}>
            <View style={{
                width: tailleBorder,
                height: tailleBorder,
                borderWidth: 4,
                borderColor: '#022353ff',
                borderRadius: tailleBorderRaduis,
                padding: 3,
            }}>
                <Pressable style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: tailleBorderRaduis,
                    backgroundColor: '#fff',
                }} onPress={onPress}>
                    {
                        iconName === "check" &&
                        <MaterialIcons name="check" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "clear" &&
                        <MaterialIcons name="clear" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "camera" &&
                        <MaterialIcons name="camera-alt" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "cancel" &&
                        <MaterialIcons name="cancel" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "delete" &&
                        <MaterialIcons name="delete" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "image" &&
                        <MaterialIcons name="image" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "dive" &&
                        <MaterialIcons name="scuba-diving" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "add" &&
                        <MaterialIcons name="add" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "gaz" &&
                        <MaterialCommunityIcons name="diving-scuba-tank" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "palmes" &&
                        <MaterialCommunityIcons name="diving-flippers" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "help" &&
                        <Entypo name="help" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "gear" &&
                        <FontAwesome name="gear" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "edit" &&
                        <FontAwesome5 name="edit" size={tailleBouton} color="#25292e" />
                    }
                    {
                        iconName === "back" &&
                        <FontAwesome5 name="backspace" size={tailleBouton} color="#25292e" />
                    }
                </Pressable>
            </View>
        </View >
    );
}