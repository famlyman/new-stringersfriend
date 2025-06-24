import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../../src/components/CustomHeader';
import { UI_KIT } from '../../../src/styles/uiKit';
import { Text as UIText } from '../../../src/components/ui/Text';

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Notifications"
        onBack={() => router.replace('/(stringer)/(tabs)/settings')}
      />
      <View style={styles.content}>
        <Ionicons name="notifications-outline" size={64} color={UI_KIT.colors.gray} style={{ marginBottom: 16 }} />
        <UIText variant="h3" style={{ color: UI_KIT.colors.textLight }}>Coming Soon</UIText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_KIT.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
}); 