import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../../src/components/CustomHeader';
import { Text } from '../../../src/components/ui/Text';
import { UI_KIT, SPACING } from '../../../src/styles/uiKit';

export default function HelpScreen() {
  const router = useRouter();
  const handleEmailPress = () => {
    Linking.openURL('mailto:stringersfriend@gmail.com');
  };
  return (
    <View style={styles.container}>
      <CustomHeader
        title="Help & Support"
        onBack={() => router.replace('/(stringer)/(tabs)/settings')}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Ionicons name="help-circle-outline" size={64} color={UI_KIT.colors.gray} style={{ alignSelf: 'center', marginBottom: SPACING.lg }} />
        <Text variant="h3" style={{ textAlign: 'center', marginBottom: SPACING.md }}>We're here to help!</Text>
        <Text variant="body" style={{ textAlign: 'center', marginBottom: SPACING.lg }}>
          If you have any questions, concerns, or feature requests, please reach out to us. We value your feedback and aim to respond as quickly as possible.
        </Text>
        <Text variant="body" style={{ textAlign: 'center' }}>
          Contact us at{' '}
          <Text variant="link" onPress={handleEmailPress}>
            stringersfriend@gmail.com
          </Text>.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_KIT.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
}); 