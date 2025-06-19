import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../src/components/ui/Text';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import { UI_KIT } from '../../../src/styles/uiKit';
import { DashboardCard } from '../../../src/components/dashboard/DashboardCard';
import { InventoryItem as DashboardInventoryItem } from '../../../src/components/dashboard/DashboardItems';

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
  const router = useRouter();

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
    const brandName = item.string_brand?.name || 'Unknown Brand';
    const modelName = item.string_model?.name;
    const truncatedModel = modelName ? 
      (modelName.length > 12 ? modelName.substring(0, 12) + '...' : modelName) 
      : item.string_model?.id || 'Unknown Model';
    
    return (
      <Card variant="elevated" style={styles.inventoryItem}>
        <View style={styles.itemHeader}>
          <View>
            <Text variant="h4">{`${brandName} ${truncatedModel}`}</Text>
            <Text variant="bodySmall" style={{ color: UI_KIT.colors.gray }}>{item.gauge} - {item.color}</Text>
          </View>
          <View style={styles.headerActions}>
            <Badge 
              variant={item.stock_quantity <= item.min_stock_level ? "warning" : "primary"}
              label={`${item.stock_quantity} ${item.stock_quantity === 1 ? 'set' : 'sets'}`}
            />
            <Link href={`/(stringer)/inventory/${item.id}/edit`} asChild>
              <TouchableOpacity>
                <Button 
                  variant="text" 
                  icon="pencil"
                  size="small"
                  title="Edit"
                  onPress={() => {}}
                />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text variant="label">Length:</Text>
            <Text variant="body">{item.length_feet} ft</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="label">Cost:</Text>
            <Text variant="body">${item.cost_per_set?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={styles.header}>
          <Text variant="h2" style={styles.headerTitle}>String Inventory</Text>
          <View style={styles.addButtonPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={UI_KIT.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={styles.header}>
          <Text variant="h2" style={styles.headerTitle}>String Inventory</Text>
          <View style={styles.addButtonPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={UI_KIT.colors.error} />
          <Text variant="body" style={{ color: UI_KIT.colors.error, textAlign: 'center', marginVertical: UI_KIT.spacing.md }}>
            {error}
          </Text>
          <Button 
            variant="primary"
            title="Try Again"
            onPress={fetchInventory}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.headerTitle}>String Inventory</Text>
        <Link href="/(stringer)/inventory/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={UI_KIT.colors.white} />
          </TouchableOpacity>
        </Link>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        <DashboardCard
          title="Items in Stock"
          icon="cube-outline"
          style={{ marginHorizontal: 0, marginBottom: 0 }}
        >
          {inventory.length > 0 ? (
            inventory.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 2,
                  elevation: 1,
                  marginBottom: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                    {item.string_brand?.name || 'Unknown Brand'} {item.string_model?.name || 'Unknown Model'}
                  </Text>
                  <Text style={{ color: '#666', marginBottom: 4, fontSize: 13 }}>
                    {item.gauge} - {item.color}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ color: '#888', fontSize: 13, marginRight: 16 }}>
                      Length: {item.length_feet} ft
                    </Text>
                    <Text style={{ color: '#888', fontSize: 13 }}>
                      Cost: ${item.cost_per_set?.toFixed(2) || '0.00'}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 16 }}>
                  <TouchableOpacity onPress={() => router.push(`/(stringer)/inventory/${item.id}/edit`)} style={{ marginBottom: 8 }}>
                    <Ionicons name="pencil" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <View style={{
                    backgroundColor: item.stock_quantity <= item.min_stock_level ? '#FFEBEE' : '#E3F2FD',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1976d2' }}>
                      {item.stock_quantity} {item.stock_quantity === 1 ? 'set' : 'sets'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={UI_KIT.colors.gray} />
              <Text variant="h4" style={styles.emptyStateText}>No inventory items yet</Text>
              <Text variant="body" style={styles.emptyStateSubtext}>
                Add your first string to get started
              </Text>
              <Link href="/(stringer)/inventory/new" asChild>
                <TouchableOpacity>
                  <Button
                    variant="primary"
                    title="Add String"
                    onPress={() => {}}
                    style={{ minWidth: 160 }}
                  />
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </DashboardCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_KIT.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UI_KIT.spacing.md,
    paddingTop: UI_KIT.spacing.md,
    paddingBottom: UI_KIT.spacing.sm,
    backgroundColor: UI_KIT.colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: UI_KIT.colors.primary,
  },
  headerTitle: {
    color: UI_KIT.colors.gray,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: UI_KIT.colors.gray,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButtonPlaceholder: {
    width: 36,
    height: 36,
    marginLeft: 8,
  },
  listContent: {
    paddingTop: UI_KIT.spacing.md,
    paddingBottom: UI_KIT.spacing.md,
  },
  inventoryItem: {
    marginBottom: UI_KIT.spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: UI_KIT.spacing.sm,
  },
  itemDetails: {
    marginTop: UI_KIT.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_KIT.spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UI_KIT.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: UI_KIT.spacing.xxl,
  },
  emptyStateText: {
    marginTop: UI_KIT.spacing.md,
    marginBottom: UI_KIT.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: UI_KIT.colors.gray,
    textAlign: 'center',
    marginBottom: UI_KIT.spacing.xl,
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
    padding: UI_KIT.spacing.lg,
  },
});