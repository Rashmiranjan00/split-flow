import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from 'styled-components/native';
import { Plus } from 'lucide-react-native';
import { Spacing } from '@/shared/constants/spacing';

interface GlobalFABProps {
  onPress: () => void;
}

export const GlobalFAB: React.FC<GlobalFABProps> = ({ onPress }) => {
  const theme = useTheme();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.brandAccent,
            shadowColor: theme.colors.brandAccent,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Add expense">
        <Plus size={26} color={theme.colors.onPrimary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.fabBottom,
    right: Spacing.fabRight,
    zIndex: 100,
  },
  button: {
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: Spacing.fabSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
