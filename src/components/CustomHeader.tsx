import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu } from 'react-native-paper';
import { UI_KIT } from '../styles/uiKit';

interface CustomHeaderProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  menuVisible?: boolean;
  closeMenu?: () => void;
  rightContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  job?: any;
  router?: any;
  deleteJob?: () => void;
  children?: React.ReactNode;
  titleStyle?: any;
  grayNav?: boolean;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  onBack,
  onMenu,
  menuVisible,
  closeMenu,
  rightContent,
  leftContent,
  job,
  router,
  deleteJob,
  children,
  grayNav = false,
  titleStyle,
}) => {
  const headerBg = grayNav ? UI_KIT.colors.gray : UI_KIT.colors.navy;
  const titleColor = grayNav ? UI_KIT.colors.navy : UI_KIT.colors.white;
  const iconColor = grayNav ? UI_KIT.colors.navy : UI_KIT.colors.primary;
  return (
    <View style={[styles.container, { backgroundColor: headerBg }] }>
      <StatusBar 
        barStyle={grayNav ? 'dark-content' : 'light-content'}
        backgroundColor={headerBg}
        translucent={false}
      />
      <View style={[styles.header, { backgroundColor: headerBg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }] }>
        {leftContent ? leftContent : onBack ? (
          <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
        <Text style={[styles.title, { color: titleColor }, titleStyle]} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        {rightContent ? rightContent : onMenu ? (
          <Menu
            visible={!!menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={onMenu} style={{ padding: 8 }}>
                <Ionicons name="ellipsis-vertical" size={20} color={iconColor} />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                closeMenu && closeMenu();
                if (job?.id && router) {
                  router.push(`/(stringer)/(tabs)/jobs/${job.id}/edit`);
                }
              }}
              title="Edit Job"
            />
            <Menu.Item
              onPress={() => {
                closeMenu && closeMenu();
                if (job && deleteJob) deleteJob();
              }}
              title="Delete Job"
            />
          </Menu>
        ) : (
          <View style={{ width: 32 }} />
        )}
        {children}
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: UI_KIT.colors.navy,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: UI_KIT.colors.navy,
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 0,
  },
  title: {
    color: UI_KIT.colors.white,
    fontWeight: '600' as const,
    fontSize: 18,
    flex: 1,
    textAlign: 'center' as const,
    marginLeft: 0,
  } as const,
};

export { CustomHeader };
export default CustomHeader;