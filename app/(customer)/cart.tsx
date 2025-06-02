import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Shopping Cart' }} />
      <Text style={styles.text}>Your cart is empty</Text>
    </View>
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
