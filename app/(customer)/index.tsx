// app/(customer)/index.tsx
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.email?.split('@')[0] || 'Customer'}!</Text>
      <Text style={styles.subtitle}>You're logged in as a customer.</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Account</Text>
        <Text style={styles.cardText}>Email: {user?.email || 'Not available'}</Text>
      </View>
      
      <Text style={styles.instructions}>
        Navigate to the Settings tab to sign out or manage your account.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#666',
  },
  instructions: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});