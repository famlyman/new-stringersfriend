// app/(customer)/index.tsx
import { View, Text, Button } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext'; // Adjust path if needed

export default function CustomerDashboard() {
  const { signOut } = useAuth(); // Assuming signOut is available

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome, Customer!</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}