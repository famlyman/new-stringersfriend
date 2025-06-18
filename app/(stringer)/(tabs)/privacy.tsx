import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:stringersfriend@gmail.com');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(stringer)/(tabs)/settings')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Privacy & Security Policy</Text>
        <Text style={styles.text}><Text style={styles.bold}>Effective Date:</Text> June 18, 2025</Text>
        <Text style={styles.text}><Text style={styles.bold}>1. Introduction</Text>{'\n'}We value your privacy and are committed to protecting your personal information. This Privacy & Security Policy explains how we collect, use, and safeguard your data when you use our app.</Text>
        <Text style={styles.text}><Text style={styles.bold}>2. Information We Collect</Text>{'\n'}- Personal Information: Name, email, phone number, and other information you provide.{"\n"}- Usage Data: Information about how you use the app, such as features accessed and device information.</Text>
        <Text style={styles.text}><Text style={styles.bold}>3. How We Use Your Information</Text>{'\n'}- To provide and improve our services{"\n"}- To communicate with you about your account or updates{"\n"}- To ensure the security and integrity of our app</Text>
        <Text style={styles.text}><Text style={styles.bold}>4. How We Share Your Information</Text>{'\n'}We do not sell your personal information. We may share data with trusted third parties only as necessary to provide our services or comply with legal obligations.</Text>
        <Text style={styles.text}><Text style={styles.bold}>5. Data Security</Text>{'\n'}We use industry-standard security measures to protect your data. However, no method of transmission or storage is 100% secure.</Text>
        <Text style={styles.text}><Text style={styles.bold}>6. Your Choices</Text>{'\n'}You can review and update your personal information in the app. You may also contact us to request deletion of your data.</Text>
        <Text style={styles.text}><Text style={styles.bold}>7. Changes to This Policy</Text>{'\n'}We may update this policy from time to time. We will notify you of any significant changes.</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>8. Contact Us</Text>{'\n'}If you have any questions about this policy, please contact us at 
          <Text style={styles.emailLink} onPress={handleEmailPress}> stringersfriend@gmail.com</Text>.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  emailLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
}); 