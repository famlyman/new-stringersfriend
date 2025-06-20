import { Stack } from 'expo-router';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Portal } from 'react-native-paper';

export default function StringerLayout() {
  return (
    <PaperProvider>
      <Portal.Host>
        <SafeAreaProvider>
          <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTitleStyle: {
                  fontSize: 17,
                  fontWeight: '600',
                  color: '#000',
                },
                headerBackTitleStyle: {
                  fontSize: 17,
                },
                headerTitleAlign: 'center',
                contentStyle: { backgroundColor: '#fff' },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  contentStyle: { backgroundColor: '#f8f8f8' },
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="clients/new" 
                options={{ 
                  headerShown: true,
                  title: 'Add New Client',
                  headerBackTitle: 'Back',
                  headerRight: () => null,
                }} 
              />
              <Stack.Screen 
                name="inventory/new" 
                options={{ 
                  headerShown: true,
                  title: 'Add New String',
                  headerBackTitle: 'Back',
                }} 
              />
            </Stack>
          </View>
        </SafeAreaProvider>
      </Portal.Host>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});