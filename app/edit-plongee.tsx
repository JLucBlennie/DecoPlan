import { useLocalSearchParams } from 'expo-router';
import PlongeeForm from '../components/PlongeeForm';
import { usePlongeeStore } from '../store/usePlongeeStore';

export default function EditPlongee() {
    const { plongeeId } = useLocalSearchParams<{ plongeeId: string }>();
    const plongee = usePlongeeStore(s => s.plongeeList.find(p => p.id === plongeeId));
    if (!plongee) return null;
    return <PlongeeForm plongee={plongee} />;
}
