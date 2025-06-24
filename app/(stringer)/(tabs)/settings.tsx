import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../../../src/components/ui/Text';
import { Button } from '../../../src/components/ui/Button';
import { UI_KIT, SPACING, listStyles, cardStyles } from '../../../src/styles/uiKit';
import CustomHeader from '../../../src/components/CustomHeader';
import { Card } from '../../../src/components/ui/Card';
import { useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabase';

export default function SettingsScreen() {
  const { signOut, session } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const fetchName = async () => {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();
      if (!error && data?.full_name) {
        setFullName(data.full_name);
      }
    };
    fetchName();
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { title: 'Profile', icon: 'user', route: '/(stringer)/(tabs)/profile' },
    { title: 'Notifications', icon: 'bell', route: '/(stringer)/(tabs)/notifications' },
    { title: 'Privacy & Security', icon: 'lock', route: '/(stringer)/(tabs)/privacy' },
    { title: 'Help & Support', icon: 'question-circle', route: '/(stringer)/(tabs)/help' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: UI_KIT.colors.background }}>
      <CustomHeader title="Settings" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: SPACING.md,
          paddingBottom: insets.bottom + SPACING.md,
        }}
      >
        <Card variant="base" style={{ marginBottom: SPACING.lg }}>
          <Text variant="body" style={{ color: UI_KIT.colors.textLight }}>Signed in as</Text>
          <Text variant="h4">{fullName || session?.user?.email}</Text>
        </Card>

        <View style={[listStyles.container, { paddingVertical: SPACING.xs }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === 0 && styles.firstMenuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => router.push(item.route as `http${string}` | `/${string}`)}
            >
              <FontAwesome name={item.icon as React.ComponentProps<typeof FontAwesome>['name']} size={20} color={UI_KIT.colors.gray} style={styles.icon} />
              <Text variant="body" style={styles.menuItemText}>
                {item.title}
              </Text>
              <FontAwesome name="chevron-right" size={16} color={UI_KIT.colors.gray} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: SPACING.xxl }}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="primary"
            style={{ backgroundColor: UI_KIT.colors.error }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: UI_KIT.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: UI_KIT.colors.lightGray,
  },
  firstMenuItem: {
    borderTopLeftRadius: UI_KIT.borderRadius.lg,
    borderTopRightRadius: UI_KIT.borderRadius.lg,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: UI_KIT.borderRadius.lg,
    borderBottomRightRadius: UI_KIT.borderRadius.lg,
  },
  icon: {
    width: 20,
    textAlign: 'center',
  },
  menuItemText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
}); 