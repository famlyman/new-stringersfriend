import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../src/constants/colors';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

export default function StringerTabsLayout() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  if (!session) {
    return null;
  }
  
  const tabBarHeight = Platform.OS === 'ios' ? 85 : 60;
  const bottomInset = insets.bottom || 0;

  return (
    <View style={styles.container}>
      <ExpoStatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.white,
          tabBarInactiveTintColor: '#c7cbe6',
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: COLORS.primary,
              borderTopColor: COLORS.primary,
              height: tabBarHeight + bottomInset,
              paddingBottom: bottomInset,
            }
          ],
          tabBarLabelStyle: styles.labelStyle,
          tabBarItemStyle: styles.itemStyle,
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            fontWeight: '600',
            color: '#c7cbe6',
          },
          headerTitleAlign: 'center',
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="home" size={24} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="jobs"
          options={{
            title: 'Jobs',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="list" size={24} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            title: 'Inventory',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="cube" size={24} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="cog" size={24} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="inventory/[id]/edit"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="inventory/new"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="privacy"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="help"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="clients/new"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="clients/[id]/index"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
    </View>
  );
}

// Keep the tab bar visible for nested routes (like clients/[id])
export const unstable_settings = {
  initialRouteName: 'dashboard',
  // This tells expo-router to keep the tab bar visible for all nested routes
  // See: https://docs.expo.dev/router/advanced/tab-bar-visibility/
  tabBarVisible: true,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabBar: {
    backgroundColor: COLORS.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  labelStyle: {
    fontSize: 12,
    marginTop: -4,
    marginBottom: 4,
  },
  itemStyle: {
    paddingVertical: 4,
  },
});