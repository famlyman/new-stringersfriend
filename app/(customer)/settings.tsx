import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Text, Button, UI_KIT, SPACING } from '@/src/components';
import CustomHeader from '../../src/components/CustomHeader';

export default function CustomerSettings() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Force a hard refresh of the app to clear all states
      router.replace('/(auth)');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
      <CustomHeader title="Settings" />
      <View style={{ padding: SPACING.md }}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="primary"
          style={{ backgroundColor: UI_KIT.colors.error }}
        />
      </View>
    </View>
  );
}
