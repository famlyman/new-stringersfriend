import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Racquet {
  id: string;
  name: string;
  brand: string;
  stringType: string;
  tension: string;
  lastStrung: string;
  image: string;
}

// Mock data - replace with actual API call
const racquets: Racquet[] = [
  {
    id: '1',
    name: 'Pro Staff RF97',
    brand: 'Wilson',
    stringType: 'Luxilon ALU Power',
    tension: '50 lbs',
    lastStrung: '2 weeks ago',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    name: 'AeroPro Drive',
    brand: 'Babolat',
    stringType: 'RPM Blast',
    tension: '52 lbs',
    lastStrung: '1 month ago',
    image: 'https://via.placeholder.com/150',
  },
];

export default function MyRacquets() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, fetch racquets from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderRacquetItem = ({ item }: { item: Racquet }) => (
    <TouchableOpacity 
      style={styles.racquetCard}
      onPress={() => router.push(`/(customer)/racquet/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.racquetImage} />
      <View style={styles.racquetInfo}>
        <Text style={styles.racquetName}>{item.name}</Text>
        <Text style={styles.racquetBrand}>{item.brand}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="tennisball" size={16} color="#666" />
          <Text style={styles.detailText}>{item.stringType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="speedometer" size={16} color="#666" />
          <Text style={styles.detailText}>Tension: {item.tension}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.detailText}>Last strung: {item.lastStrung}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={racquets}
        renderItem={renderRacquetItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="tennisball-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No racquets added yet</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Racquet</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {racquets.length > 0 && (
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  racquetCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  racquetImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  racquetInfo: {
    flex: 1,
  },
  racquetName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  racquetBrand: {
    color: '#666',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginVertical: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
