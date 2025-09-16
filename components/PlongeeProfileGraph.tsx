import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Button, TextInput, Pressable } from 'react-native';
import Svg, { Line, G, Text as SvgText } from 'react-native-svg';
import { Dive } from '../lib/dive/dive';

type PlongeeProfileGraphProps = {
    segments: Dive.Segment[];
    onUpdateSegment: (index: number, updatedSegment: Dive.Segment) => void;
};

export default function PlongeeProfileGraph({ segments, onUpdateSegment }: PlongeeProfileGraphProps) {
    const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
    const [editedSegment, setEditedSegment] = useState<Dive.Segment | null>(null);

    // Ajoute un segment fictif pour partir de la surface
    const segmentsWithSurface = [
        {
            startDepth: 0,
            endDepth: segments.length > 0 ? segments[0].startDepth : 0,
            time: 1,
            gasName: '',
        },
        ...segments,
    ];

    // Trouver la profondeur maximale pour l'échelle du graphique
    const maxDepth = Math.max(...segmentsWithSurface.flatMap(segment => [segment.startDepth, segment.endDepth]), 0) + 10;
    // Temps total pour l'échelle du graphique
    const totalTime = segmentsWithSurface.reduce((sum, segment) => sum + segment.time, 0);

    // Ouvrir le modal d'édition d'un segment
    const handleSegmentPress = (index: number) => {
        console.log("Click sur le segment : " + index);
        setSelectedSegmentIndex(index);
        setEditedSegment({ ...segments[index] });
    };

    // Mettre à jour un segment
    const handleUpdateSegment = () => {
        if (selectedSegmentIndex !== null && editedSegment) {
            onUpdateSegment(selectedSegmentIndex, editedSegment);
            setSelectedSegmentIndex(null);
        }
    };

    // Calculer les coordonnées SVG pour un segment
    const getSegmentCoordinates = (segment: Dive.Segment, cumulativeTime: number) => {
        const x1 = (cumulativeTime / totalTime) * 300; // Échelle X (temps)
        const y1 = (segment.startDepth / maxDepth) * 200; // Échelle Y corrigée : 0 en haut
        const x2 = ((cumulativeTime + segment.time) / totalTime) * 300;
        const y2 = (segment.endDepth / maxDepth) * 200; // Échelle Y corrigée : 0 en haut
        return { x1, y1, x2, y2 };
    };

    return (
        <View style={styles.container}>
            {/* Graphique SVG */}
            <View style={styles.graphContainer}>
                <Svg height="200" width="320" viewBox="0 0 320 220">
                    {/* Axe des profondeurs (inversé) */}
                    <Line x1="10" y1="10" x2="10" y2="210" stroke="black" strokeWidth="1" />
                    {/* Axe des temps (en haut) */}
                    <Line x1="10" y1="10" x2="310" y2="10" stroke="black" strokeWidth="1" />
                    {/* Labels des axes */}
                    <SvgText x="5" y="110" fontSize="10" fill="black" textAnchor="middle" transform="rotate(-90, 5, 110)">Profondeur (m)</SvgText>
                    <SvgText x="160" y="25" fontSize="10" fill="black" textAnchor="middle">Temps (min)</SvgText>

                    {/* // Graduations pour la profondeur (tous les 5m) */}
                    {Array.from({ length: Math.floor(maxDepth / 5) }, (_, i) => i * 5).map(depth => (
                        <G key={`depth-${depth}`}>
                            <Line x1="5" y1={(depth / maxDepth) * 200 + 10} x2="15" y2={(depth / maxDepth) * 200 + 10} stroke="black" strokeWidth="1" />
                            <SvgText x="0" y={(depth / maxDepth) * 200 + 10} fontSize="8" fill="black" textAnchor="end">{depth}</SvgText>
                        </G>
                    ))}

                    {/* // Graduations pour le temps (toutes les 5min) */}
                    {Array.from({ length: Math.floor(totalTime / 5) }, (_, i) => i * 5).map(time => (
                        <G key={`time-${time}`}>
                            <Line x1={(time / totalTime) * 300 + 10} y1="5" x2={(time / totalTime) * 300 + 10} y2="15" stroke="black" strokeWidth="1" />
                            <SvgText x={(time / totalTime) * 300 + 10} y="0" fontSize="8" fill="black" textAnchor="middle">{time}</SvgText>
                        </G>
                    ))}

                    {/* Segments */}
                    {segmentsWithSurface.map((segment, index) => {
                        const cumulativeTime = segmentsWithSurface.slice(0, index).reduce((sum, s) => sum + s.time, 0);
                        const { x1, y1, x2, y2 } = getSegmentCoordinates(segment, cumulativeTime);
                        return (
                            <React.Fragment key={index}>
                                <G>
                                    <Line
                                        x1={x1 + 10}
                                        y1={y1 + 10}
                                        x2={x2 + 10}
                                        y2={y2 + 10}
                                        stroke={index === 0 ? "gray" : selectedSegmentIndex === index - 1 ? "red" : "blue"}
                                        strokeWidth="2"
                                    />
                                </G>
                            </React.Fragment>
                        );
                    })}
                </Svg>
                {/* Les Pressable doivent être ici, après le SVG */}
                {segmentsWithSurface.map((segment, index) => {
                    const cumulativeTime = segmentsWithSurface.slice(0, index).reduce((sum, s) => sum + s.time, 0);
                    const { x1, y1, x2, y2 } = getSegmentCoordinates(segment, cumulativeTime);
                    return (
                        index > 0 && (
                            <Pressable
                                key={index}
                                style={({ pressed }) => ({
                                    position: 'absolute',
                                    left: Math.min(x1, x2) + 10 - 20,
                                    top: Math.min(y1, y2) + 10 - 20,
                                    width: Math.abs(x2 - x1) + 40,
                                    height: Math.abs(y2 - y1) + 40,
                                    backgroundColor: pressed ? 'rgba(0, 0, 255, 0.3)' : 'rgba(0, 0, 255, 0.1)',
                                    zIndex: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                })}
                                onPress={() => {
                                    console.log("Segment cliqué : ", index - 1);
                                    handleSegmentPress(index - 1);
                                }}
                            >
                                <Text>Seg-{index}</Text>
                            </Pressable>
                        )
                    )
                })}
            </View>

            {/* Modal pour éditer un segment */}
            <Modal visible={selectedSegmentIndex !== null} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Éditer le segment</Text>
                    {editedSegment && (
                        <>
                            <Text>Profondeur de début (m)</Text>
                            <TextInput
                                style={styles.input}
                                value={editedSegment.startDepth.toString()}
                                onChangeText={(text) => setEditedSegment({ ...editedSegment, startDepth: parseFloat(text) || 0 })}
                                keyboardType="numeric"
                            />
                            <Text>Profondeur de fin (m)</Text>
                            <TextInput
                                style={styles.input}
                                value={editedSegment.endDepth.toString()}
                                onChangeText={(text) => setEditedSegment({ ...editedSegment, endDepth: parseFloat(text) || 0 })}
                                keyboardType="numeric"
                            />
                            <Text>Temps (min)</Text>
                            <TextInput
                                style={styles.input}
                                value={editedSegment.time.toString()}
                                onChangeText={(text) => setEditedSegment({ ...editedSegment, time: parseFloat(text) || 0 })}
                                keyboardType="numeric"
                            />
                            <View style={styles.modalButtons}>
                                <Button title="Annuler" onPress={() => setSelectedSegmentIndex(null)} />
                                <Button title="Enregistrer" onPress={handleUpdateSegment} />
                            </View>
                        </>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    graphContainer: {
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#f9f9f9',
        position: 'relative'
    },
    modalContainer: {
        padding: 20,
        flex: 1,
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 4,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
});
