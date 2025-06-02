import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchStringers, searchStringers } from '../../src/services/stringerService';
import { Stringer } from '../../src/types/stringer';

export default function FindStringer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stringers, setStringers] = useState<Stringer[]>([]);
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);

  const loadStringers = useCallback(async () => {
    try {
      setIsLoading(true);
      let data;
      if (searchQuery || selectedSpecialty) {
        data = await searchStringers(searchQuery, selectedSpecialty || undefined);
      } else {
        data = await fetchStringers();
      }
      setStringers(data);
      
      // Extract unique specialties from all stringers
      const specialties = new Set<string>();
      data.forEach(stringer => {
        stringer.specialties?.forEach(specialty => specialties.add(specialty));
      });
      setAllSpecialties(Array.from(specialties));
    } catch (error) {
      console.error('Failed to load stringers:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedSpecialty]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStringers();
  }, [loadStringers]);

  useEffect(() => {
    loadStringers();
  }, [loadStringers]);

  const handleStringerPress = (slug: string) => {
    router.push(`/(customer)/stringer/${slug}`);
  };

  const handleSearch = () => {
    loadStringers();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty(null);
  };
  
  const filteredStringers = stringers.filter(stringer => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      stringer.name.toLowerCase().includes(searchLower) ||
      stringer.location.toLowerCase().includes(searchLower) ||
      (stringer.specialties || []).some((s: string) => s.toLowerCase().includes(searchLower));
      
    const matchesSpecialty = !selectedSpecialty || 
      (stringer.specialties || []).includes(selectedSpecialty);
      
    return matchesSearch && matchesSpecialty;
  });

  const renderStringerItem = ({ item }: { item: Stringer }) => (
    <TouchableOpacity 
      style={styles.stringerCard}
      onPress={() => handleStringerPress(item.slug)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.stringerImage} 
          resizeMode="cover"
          onError={() => console.log('Error loading image')}
        />
      </View>
      <View style={styles.stringerInfo}>
        <View style={styles.stringerHeader}>
          <Text style={styles.stringerName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.rating} ({item.reviews} reviews)
            </Text>
          </View>
        </View>
        <Text style={styles.distance}>
          <Ionicons name="location" size={14} color="#666" /> {item.location} • {item.distance}
        </Text>
        <View style={styles.specialtiesContainer}>
          {item.specialties.map((specialty, index) => (
            <View key={index} style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Stringer</Text>
        <Text style={styles.subtitle}>Book services from professional stringers</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or specialty..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtiesScroll}
        >
          <TouchableOpacity 
            style={[
              styles.specialtyButton,
              !selectedSpecialty && styles.specialtyButtonActive
            ]}
            onPress={() => setSelectedSpecialty(null)}
          >
            <Text style={[
              styles.specialtyButtonText,
              !selectedSpecialty && styles.specialtyButtonTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {allSpecialties.map((specialty: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.specialtyButton,
                selectedSpecialty === specialty && styles.specialtyButtonActive
              ]}
              onPress={() => setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty)}
            >
              <Text style={[
                styles.specialtyButtonText,
                selectedSpecialty === specialty && styles.specialtyButtonTextActive
              ]}>
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {filteredStringers.length} {filteredStringers.length === 1 ? 'Stringer' : 'Stringers'} Found
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : filteredStringers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No stringers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStringers}
            renderItem={renderStringerItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  section: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  specialtiesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  specialtyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  specialtyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  specialtyButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  specialtyButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  stringerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden' as const,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  stringerImage: {
    width: '100%',
    height: '100%',
  },
  stringerInfo: {
    flex: 1,
    marginRight: 8,
  },
  stringerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stringerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
  },
  distance: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  specialtyBadge: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center' as const,
    paddingHorizontal: 20,
  },
});
