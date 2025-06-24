// app/index.tsx
import React, { useState } from 'react';
import { ScrollView, View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';
import { Card, Button, Text, UI_KIT, SPACING } from '../src/components';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [selectingRole, setSelectingRole] = useState(false);
  const insets = useSafeAreaInsets();

  const selectRole = async (role: 'stringer' | 'customer') => {
    if (!session?.user?.id) {
      router.push({
        pathname: '/(auth)/register',
        params: { selectedRole: role, _t: Date.now() }
      });
      return;
    }
    if (selectingRole) return;
    setSelectingRole(true);
    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: session.user.id,
            role: role,
            updated_at: new Date().toISOString(),
            full_name: session.user.email?.split('@')[0] || 'User',
          },
          { onConflict: 'id', count: 'exact' }
        );
      if (upsertError) throw upsertError;
      await new Promise(resolve => setTimeout(resolve, 100));
      const redirectPath = role === 'stringer' ? '/(stringer)/onboarding' : '/(customer)';
      router.replace(redirectPath);
    } catch (error: any) {
      Alert.alert('Error', `Failed to set role: ${error.message}. Please try again.`);
    } finally {
      setSelectingRole(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSelectingRole(false);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: UI_KIT.colors.background }}>
        <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
        <Text variant="body" style={{ marginTop: SPACING.md }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: UI_KIT.colors.background }} edges={['top', 'bottom']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}
        contentContainerStyle={{
          padding: SPACING.lg,
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: insets.bottom + SPACING.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
          <Text variant="h1" style={{ color: UI_KIT.colors.primary, marginBottom: SPACING.sm, textAlign: 'center' }}>Welcome to Stringer's Friend</Text>
          <Text variant="bodyLarge" style={{ color: UI_KIT.colors.text, textAlign: 'center' }}>
            Your all-in-one racquet stringing management solution
          </Text>
        </View>
        <View style={{ gap: SPACING.lg }}>
          <Card variant="elevated" style={{ borderColor: UI_KIT.colors.primary, borderWidth: 2, marginBottom: SPACING.md, backgroundColor: UI_KIT.colors.navy }}>
            <Text variant="h3" style={{ color: UI_KIT.colors.white, marginBottom: SPACING.sm }}>For Stringers</Text>
            <Text variant="body" style={{ color: UI_KIT.colors.white, marginBottom: SPACING.md }}>
              • Manage your stringing business efficiently{"\n"}
              • Track jobs, clients, and inventory{"\n"}
              • Set up your stringing shop profile{"\n"}
              • Handle payments and scheduling
            </Text>
            <Button
              title={selectingRole ? 'Loading...' : 'Get Started'}
              variant="primary"
              size="large"
              onPress={() => selectRole('stringer')}
              disabled={selectingRole}
              style={{ marginTop: SPACING.sm }}
              loading={selectingRole}
            />
          </Card>
          <Card variant="outlined" style={{ borderColor: UI_KIT.colors.gray, marginBottom: SPACING.md }}>
            <Text variant="h4" style={{ color: UI_KIT.colors.navy, marginBottom: SPACING.sm }}>For Customers</Text>
            <Text variant="body" style={{ color: UI_KIT.colors.text, marginBottom: SPACING.md }}>
              • Find local stringers{"\n"}
              • Track your racquets{"\n"}
              • Manage stringing preferences{"\n"}
              • Get status updates on your jobs
            </Text>
            <Button
              title={selectingRole ? 'Loading...' : 'Get Started'}
              variant="secondary"
              size="large"
              onPress={() => selectRole('customer')}
              disabled={selectingRole}
              style={{ marginTop: SPACING.sm }}
              loading={selectingRole}
            />
          </Card>
        </View>
        <View style={{ marginTop: SPACING.xl, alignItems: 'center' }}>
          {session ? (
            <Button
              title="Sign Out"
              variant="outline"
              onPress={handleSignOut}
              style={{ width: 200 }}
            />
          ) : (
            <Button
              title="Already have an account? Sign In"
              variant="text"
              onPress={() => router.push('/(auth)/login')}
              style={{ width: 250 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}