import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = new Animated.Value(0);

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.delay(500),
        ])
      ).start();
    };

    animate();
    return () => shimmerAnim.stopAnimation();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View
      style={[
        styles.container,
        { width, height, borderRadius, overflow: 'hidden' },
        style,
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.lightGray, borderRadius }]} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { width: SCREEN_WIDTH }]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden',
  } as ViewStyle,
});

// Skeleton Card Component
export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <View style={skeletonStyles.card}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={skeletonStyles.item}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
          <SkeletonLoader width="70%" height={12} style={{ marginTop: 12 }} />
        </View>
      ))}
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  } as ViewStyle,
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  } as ViewStyle,
});
