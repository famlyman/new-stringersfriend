import { Stack } from 'expo-router';

export default function StringerLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="jobs" 
        options={{ 
          title: 'Jobs',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="clients" 
        options={{ 
          title: 'Clients',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="inventory" 
        options={{ 
          title: 'Inventory',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerShown: true 
        }} 
      />
    </Stack>
  );
} 