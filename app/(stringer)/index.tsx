import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';

export default function StringerIndex() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!session?.user?.id) return;

      try {
        const { data: stringerData, error } = await supabase
          .from('stringers')
          .select('id')
          .eq('id', session.user.id)
          .single();

        setNeedsOnboarding(!stringerData);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [session]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <Redirect href={needsOnboarding ? "/(stringer)/onboarding" : "/(stringer)/(tabs)"} />;
} 