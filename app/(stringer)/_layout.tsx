import React from "react";
import { Stack } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Portal } from 'react-native-paper';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

export default function StringerLayout() {
  return (
    <>
      <ExpoStatusBar style="dark" />
      <PaperProvider>
        <Portal.Host>
          <SafeAreaProvider>
            <View style={styles.container}>
              <Stack
                screenOptions={{
                  headerShown: false,
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
              </Stack>
            </View>
          </SafeAreaProvider>
        </Portal.Host>
      </PaperProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});