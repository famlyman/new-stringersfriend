import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../../../src/components/CustomHeader';
import { Text } from '../../../src/components/ui/Text';
import { UI_KIT, SPACING } from '../../../src/styles/uiKit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEmailPress = () => {
    Linking.openURL('mailto:stringersfriend@gmail.com');
  };

  const renderSection = (title: string, content: string) => (
    <View style={{ marginBottom: SPACING.lg }}>
      <Text variant="h4" style={{ marginBottom: SPACING.sm }}>{title}</Text>
      <Text variant="body">{content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Privacy & Security"
        onBack={() => router.replace('/(stringer)/(tabs)/settings')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xxl }]} showsVerticalScrollIndicator={false}>
        <Text variant="h3" style={{ marginBottom: SPACING.sm, textAlign: 'center' }}>Privacy & Security Policy</Text>
        <Text variant="caption" style={{ marginBottom: SPACING.lg, textAlign: 'center' }}>Effective Date: June 18, 2025</Text>
        
        {renderSection('1. Introduction', 'We value your privacy and are committed to protecting your personal information. This Privacy & Security Policy explains how we collect, use, and safeguard your data when you use our app.')}
        {renderSection('2. Information We Collect', '- Personal Information: Name, email, phone number, and other information you provide.\n- Usage Data: Information about how you use the app, such as features accessed and device information.')}
        {renderSection('3. How We Use Your Information', '- To provide and improve our services\n- To communicate with you about your account or updates\n- To ensure the security and integrity of our app')}
        {renderSection('4. How We Share Your Information', 'We do not sell your personal information. We may share data with trusted third parties only as necessary to provide our services or comply with legal obligations.')}
        {renderSection('5. Data Security', 'We use industry-standard security measures to protect your data. However, no method of transmission or storage is 100% secure.')}
        {renderSection('6. Your Choices', 'You can review and update your personal information in the app. You may also contact us to request deletion of your data.')}
        {renderSection('7. Changes to This Policy', 'We may update this policy from time to time. We will notify you of any significant changes.')}

        <View style={{ marginBottom: SPACING.lg }}>
          <Text variant="h4" style={{ marginBottom: SPACING.sm }}>8. Contact Us</Text>
          <Text variant="body">
            If you have any questions about this policy, please contact us at{' '}
            <Text variant="link" onPress={handleEmailPress}>
              stringersfriend@gmail.com
            </Text>.
          </Text>
        </View>
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
    padding: SPACING.lg,
  },
}); 