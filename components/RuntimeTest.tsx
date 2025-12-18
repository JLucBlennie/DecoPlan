import { View, Text } from "react-native";
import { Dive } from "../lib/dive/dive";
import { Buhlmann } from "../lib/dive/buhlmann";

type Props = {
    plongee: Dive.Plongee;
    gfBas?: number;
    gfHaut?: number;
};

export default function RuntimeTest({ plongee: plongee, gfBas: gfBas, gfHaut: gfHaut }: Props) {

    function computeDive(selectedPlongee: Dive.Plongee, gfBas: number, gfHaut: number): Dive.Segment[] {
        console.log("Chargement de l'algo...");
        var deco = new Buhlmann.Plan(Buhlmann.ZH16CTissues);
        console.log("Definition des gaz Fond");
        for (let gaz of selectedPlongee.gazFond) {
            deco.addBottomGas(gaz);
        }
        console.log("Definition des gaz Deco");
        for (let gaz of selectedPlongee.gazDeco) {
            deco.addDecoGas(gaz);
        }

        var isFirstSegment = true;
        for (let segment of selectedPlongee.segments) {
            console.log("Descente avec le Tx");
            if (isFirstSegment && segment.startDepth === segment.endDepth) {
                deco.addDepthChange(0, segment.endDepth, segment.gasName, (segment.endDepth - 0) / 20);
            } else if (segment.startDepth < segment.endDepth) {
                deco.addDepthChange(segment.startDepth, segment.endDepth, segment.gasName, (segment.endDepth - segment.startDepth) / 20);
            } else if (segment.startDepth === segment.endDepth) {
                console.log("On fait une plongee de 25 min");
                deco.addFlat(segment.startDepth, segment.gasName, segment.time);
            }
        }
        console.log("Calcul de la deco...");
        var decoPlan = deco.calculateDecompression(false, gfBas / 100, gfHaut / 100, 1.6, 30, undefined);
        console.log("Resultat de la deco :");
        console.log(decoPlan);
        return decoPlan;
    }

    const decoPlan = computeDive(plongee, gfBas ?? 50, gfHaut ?? 70);

    return (
        <View>
            <Text>Runtime Test Component</Text>
            <Text>Profondeur : {plongee.segments[0].endDepth} m</Text>
            <Text>Temps Fond : {plongee.segments[0].time} s</Text>
            <Text>GFBas : {gfBas}</Text>
            <Text>GFHaut : {gfHaut}</Text>
            <Text>Déco Plan : {JSON.stringify(decoPlan)}</Text>
        </View>
    );
}
