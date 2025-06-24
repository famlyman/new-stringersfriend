import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import CustomHeader from '../../src/components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Shopping Cart" />
      <Text style={styles.text}>Your cart is empty</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
