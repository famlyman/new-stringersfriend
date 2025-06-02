// app/(auth)/role-select.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RoleSelectScreen() {
  const router = useRouter();
  const { session, isLoading } = useAuth();
  const [selectingRole, setSelectingRole] = React.useState(false);

  // Check if we have a valid session
  useEffect(() => {
    if (!isLoading && !session) {
      console.log("RoleSelect: No session found, redirecting to login");
      router.replace('/(auth)/login');
    }
  }, [session, isLoading]);

  const selectRole = async (role: 'stringer' | 'customer') => {
    if (!session?.user?.id) {
      Alert.alert("Error", "No user session found. Please sign in again.");
      router.replace('/(auth)/login');
      return;
    }

    if (selectingRole) return;
    setSelectingRole(true);

    try {
      // First, check if a profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If a profile exists with a different role, delete it
      if (existingProfile && existingProfile.role !== role) {
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', session.user.id);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Create new profile with selected role
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          { 
            id: session.user.id,
            role: role,
            updated_at: new Date().toISOString(),
            username: session.user.email || session.user.id,
            full_name: session.user.email?.split('@')[0] || 'User'
          }, 
          { onConflict: 'id' }
        );

      if (upsertError) {
        console.error("Error creating profile:", upsertError);
        throw upsertError;
      }

      console.log(`Role set to: ${role}`);

      // Redirect based on selected role
      if (role === 'stringer') {
        router.replace('/(stringer)/onboarding');
      } else {
        router.replace('/(customer)');
      }
    } catch (error: any) {
      console.error("Error setting role:", error.message);
      Alert.alert(
        "Error",
        `Failed to set role: ${error.message}. Please try again or contact support.`,
        [{ text: "OK", onPress: () => router.replace('/(auth)/login') }]
      );
    } finally {
      setSelectingRole(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>Select how you'll use Stringer's Friend</Text>

      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleCard, styles.stringerCard]}
          onPress={() => selectRole('stringer')}
          disabled={selectingRole}
        >
          <Text style={styles.roleTitle}>I'm a Stringer</Text>
          <Text style={styles.roleDescription}>
            I string racquets and want to manage my stringing business
          </Text>
          <Text style={styles.recommended}>Recommended</Text>
          {selectingRole && <ActivityIndicator color="#28A745" style={styles.roleLoading} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, styles.customerCard]}
          onPress={() => selectRole('customer')}
          disabled={selectingRole}
        >
          <Text style={styles.roleTitle}>I'm a Customer</Text>
          <Text style={styles.roleDescription}>
            I want to find stringers and manage my racquets
          </Text>
          {selectingRole && <ActivityIndicator color="#666" style={styles.roleLoading} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  roleContainer: {
    width: '100%',
    gap: 20,
  },
  roleCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stringerCard: {
    borderWidth: 2,
    borderColor: '#28A745',
  },
  customerCard: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  roleDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  recommended: {
    color: '#28A745',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  roleLoading: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
});