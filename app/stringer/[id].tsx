import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppNavigation } from '../../src/hooks/useAppNavigation';
import { supabase } from '../../src/lib/supabase';

export default function StringerStorefront() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { navigate } = useAppNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [stringer, setStringer] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStringerData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .eq('role', 'stringer')
          .single();

        if (error) throw error;
        setStringer(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStringerData();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !stringer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Stringer not found'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: stringer.avatar_url || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text style={styles.businessName}>{stringer.business_name}</Text>
        <Text style={styles.location}>{stringer.business_address}</Text>
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigate('/stringer/[id]/services', { id })}
        >
          <Text style={styles.navButtonText}>Services</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigate('/stringer/[id]/gallery', { id })}
        >
          <Text style={styles.navButtonText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigate('/stringer/[id]/reviews', { id })}
        >
          <Text style={styles.navButtonText}>Reviews</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.about}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {stringer.bio || 'No description available'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigate('/(auth)/register', { role: 'customer', stringerId: id })}
      >
        <Text style={styles.bookButtonText}>Book a Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  about: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 