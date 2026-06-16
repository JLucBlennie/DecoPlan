import { useLocalSearchParams } from 'expo-router';
import GazForm from '../components/GazForm';
import { useGazStore } from '../store/useGazStore';

export default function EditGaz() {
    const { gazId } = useLocalSearchParams<{ gazId: string }>();
    const gaz = useGazStore(s => s.gazList.find(g => g.id === gazId));
    if (!gaz) return null;
    return <GazForm gaz={gaz} />;
}
