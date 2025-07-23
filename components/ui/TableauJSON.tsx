import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Dive } from "../../lib/dive/dive";

type Props = {
    data: Dive.Segment[];
};

export default function TableauJSON({ data }: Props) {
    return (
        <ScrollView >
            <View style={styles.table}>
                {/* En-têtes */}
                <View style={[styles.row, styles.header]}>
                    <View style={[styles.cell, styles.flexCell1]}><Text style={styles.textHeader}>Profondeur</Text></View>
                    <View style={[styles.cell, styles.flexCell2]}><Text style={styles.textHeader}>Durée</Text></View>
                    <View style={[styles.cell, styles.flexCell3]}><Text style={styles.textHeader}>TpsTot</Text></View>
                    <View style={[styles.cell, styles.flexCell4]}><Text style={styles.textHeader}>Gaz</Text></View>
                    <View style={[styles.cell, styles.flexCell5]}><Text style={styles.textHeader}>END</Text></View>
                </View>

                {data.map((item, index) => (
                    <View key={index} style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                        <View style={[styles.cell, styles.flexCell1]}><Text style={styles.text}>{item.startDepth}</Text></View>
                        <View style={[styles.cell, styles.flexCell2]}><Text style={styles.text}>{item.time}</Text></View>
                        <View style={[styles.cell, styles.flexCell3]}><Text style={styles.text}>0</Text></View>
                        <View style={[styles.cell, styles.flexCell4]}><Text style={styles.text}>{item.gasName}</Text></View>
                        <View style={[styles.cell, styles.flexCell5]}><Text style={styles.text}>{item.endDepth}</Text></View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    table: {
        margin: 10,
        borderWidth: 1,
        borderColor: '#022353ff',
    },
    row: {
        flexDirection: 'row',
    },
    rowEven: {
        backgroundColor: '#ffffff',
    },
    rowOdd: {
        backgroundColor: '#f2f2f2',
    },
    cell: {
        borderWidth: 1,
        borderColor: '#022353ff',
        justifyContent: 'center',
        padding: 2,
    },
    text: {
        textAlign: 'center',
    },
    textHeader: {
        textAlign: 'center',
        color: '#ffffffff'
    },
    header: {
        backgroundColor: '#0b4972ff',
    },

    // Ta logique de colonnes reste la même
    flexCell1: { width: '20%' },
    flexCell2: { width: '20%' },
    flexCell3: { width: '20%' },
    flexCell4: { width: '20%' },
    flexCell5: { width: '20%' },
});