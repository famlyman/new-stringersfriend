import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
  titleStyle,
}) => {
  // Always use navy for header, gray for title and icons
  const headerBg = UI_KIT.colors.navy;
  const titleColor = UI_KIT.colors.gray;
  const iconColor = UI_KIT.colors.gray;
  return (
    <View style={[styles.container, { backgroundColor: headerBg }] }>
      <View style={styles.headerContainer}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={UI_KIT.colors.gray} />
          </TouchableOpacity>
        )}
        <Text
          style={[
            styles.title,
            titleStyle,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI_KIT.colors.navy,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_KIT.colors.navy,
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    minHeight: 64,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: UI_KIT.colors.gray,
    fontSize: 28,
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
});

export { CustomHeader };
export default CustomHeader;