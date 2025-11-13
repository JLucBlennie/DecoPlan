import { Platform, StyleSheet } from "react-native";

export const mainStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#b4e3e98c',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        alignSelf: 'stretch',
        ...Platform.select({
            web: {
                maxWidth: '100%',  // Force la largeur maximale sur le web
            },
        })
    },
    editorContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'flex-start',
        alignSelf: 'stretch',
        padding: 5
    },
    text: {
        fontSize: 24,
        color: '#0428f1ff',
    },
    titre: {
        fontSize: 30,
        color: '#0428f1ff',
    },
    attentionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
        padding: 2
    }
});