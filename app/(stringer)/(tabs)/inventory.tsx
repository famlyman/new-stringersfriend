import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

type StringInventory = {
  id: string;
  gauge: string;
  color: string;
  length_feet: number;
  stock_quantity: number;
  min_stock_level: number;
  cost_per_set: number;
  created_at: string;
  updated_at: string;
  string_brand: {
    id: number;
    name: string;
  } | null;
  string_model: {
    id: number;
    name: string;
  } | null;
};

export default function InventoryScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<StringInventory[]>([]);

  const fetchInventory = useCallback(async () => {
    if (!session?.user?.id) {
      setError('No active session');
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('string_inventory')
        .select(`
          id,
          gauge,
          color,
          length_feet,
          stock_quantity,
          min_stock_level,
          cost_per_set,
          created_at,
          updated_at,
          string_brand!brand_id (
            id,
            name
          ),
          string_model!model_id (
            id,
            name
          )
        `)
        .eq('stringer_id', session.user.id)
        .order('created_at', { ascending: false })
        .returns<StringInventory[]>();

      if (fetchError) throw fetchError;
      console.log('Inventory data:', data);
      setInventory(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchInventory();
  }, [fetchInventory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInventory();
  }, [fetchInventory]);

  const renderItem = ({ item }: { item: StringInventory }) => {
    console.log('Rendering item:', item);
    const brandName = item.string_brand?.name || 'Unknown Brand';
    const modelName = item.string_model?.name;
    const truncatedModel = modelName ? 
      (modelName.length > 12 ? modelName.substring(0, 12) + '...' : modelName) 
      : item.string_model?.id || 'Unknown Model';
    
    return (
      <View style={styles.inventoryItem}>
        <View style={styles.itemHeader}>
          <View>
            <Text style={styles.itemTitle}>{`${brandName} ${truncatedModel}`}</Text>
            <Text style={styles.itemSubtitle}>{item.gauge} - {item.color}</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={[
              styles.stockBadge,
              item.stock_quantity <= item.min_stock_level && styles.lowStockBadge
            ]}>
              <Text style={styles.stockText}>
                {item.stock_quantity} {item.stock_quantity === 1 ? 'set' : 'sets'}
              </Text>
            </View>
            <Link href={`/(stringer)/inventory/${item.id}/edit`} asChild>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={20} color="#007AFF" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Length:</Text>
            <Text style={styles.detailValue}>{item.length_feet} ft</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cost:</Text>
            <Text style={styles.detailValue}>${item.cost_per_set?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchInventory}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>String Inventory</Text>
        <Link href="/(stringer)/inventory/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Link>
      </View>
      
      {inventory.length > 0 ? (
        <FlatList
          data={inventory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>
              {inventory.length} {inventory.length === 1 ? 'Item' : 'Items'} in Stock
            </Text>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No inventory items yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add your first string to get started
          </Text>
          <Link href="/(stringer)/inventory/new" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Add String</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  inventoryItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemDetails: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  lowStock: {
    backgroundColor: '#ffebee',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
  },
  stockBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowStockBadge: {
    backgroundColor: '#ffebee',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});