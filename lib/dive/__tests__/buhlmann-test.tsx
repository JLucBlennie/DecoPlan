import { render } from '@testing-library/react-native';
import RuntimeTest from '../../../components/RuntimeTest';
import { Dive } from '../dive';

describe('buhlmann', () => {
    test('Text renders correctly on buhlmann', () => {
        const plongee1: Dive.Plongee = {
            id: "uuid_=-01", name: "Plongee 1", segments: [{
                startDepth: 0, endDepth: 50, gasName: "Tx2020", time: 15
            }] as Dive.Segment[], gazFond: [{
                id: "uuid-g-1", name: "Tx2020", fO2: 0.2, fHe: 0.2, fN2: 0.6
            }] as Dive.Gas[], gazDeco: [{
                id: "uuid-g-2", name: "Nx40", fO2: 0.40, fHe: 0, fN2: 0.60
            }] as Dive.Gas[]
        };
        const decoplan = JSON.parse(`[{"gasName":"Tx2020","startDepth":0,"endDepth":50,"time":2.5},{"gasName":"Tx2020","startDepth":50,"endDepth":50,"time":12.5},{"gasName":"Tx2020","startDepth":50,"endDepth":30,"time":2},{"gasName":"Nx40","startDepth":30,"endDepth":15,"time":1.5},{"gasName":"Nx40","startDepth":15,"endDepth":15,"time":0.5},{"gasName":"Nx40","startDepth":15,"endDepth":12,"time":0.5},{"gasName":"Nx40","startDepth":12,"endDepth":12,"time":1},{"gasName":"Nx40","startDepth":12,"endDepth":9,"time":0.5},{"gasName":"Nx40","startDepth":9,"endDepth":9,"time":2},{"gasName":"Nx40","startDepth":9,"endDepth":6,"time":0.5},{"gasName":"Nx40","startDepth":6,"endDepth":6,"time":5},{"gasName":"Nx40","startDepth":6,"endDepth":3,"time":0.5},{"gasName":"Nx40","startDepth":3,"endDepth":3,"time":9}]`);

        const { getByText } = render(<RuntimeTest plongee={plongee1} gfBas={50} gfHaut={70} />);
        getByText('Runtime Test Component');
        getByText('Profondeur : ' + plongee1.segments[0].endDepth + ' m');
        getByText('Temps Fond : ' + plongee1.segments[0].time + ' s');
        getByText('GFBas : ' + 50);
        getByText('GFHaut : ' + 70);
        getByText('Déco Plan : ' + JSON.stringify(decoplan));
    });
});
