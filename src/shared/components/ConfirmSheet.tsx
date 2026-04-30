import React, { useCallback, useEffect } from 'react';
import { Dimensions, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import styled, { useTheme } from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';

const isWeb = Platform.OS === 'web';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;
const ANIMATION_DURATION = 300;
const DISMISS_THRESHOLD = 0.3;
const DISMISS_VELOCITY = 500;

export type ConfirmSheetActionStyle = 'default' | 'destructive' | 'cancel';

export interface ConfirmSheetAction {
  label: string;
  style?: ConfirmSheetActionStyle;
  onPress: () => void;
}

export interface ConfirmSheetConfig {
  title: string;
  message?: string;
  actions: ConfirmSheetAction[];
}

interface ConfirmSheetProps {
  visible: boolean;
  config: ConfirmSheetConfig | null;
  onDismiss: () => void;
}

// ---- Styled Components ----

const HandleBar = styled.View`
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.outlineVariant};
  align-self: center;
  margin-top: ${Spacing.sm}px;
  margin-bottom: ${Spacing.md}px;
`;

const Title = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 18px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
  text-align: center;
  margin-bottom: ${Spacing.xs}px;
`;

const Message = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-align: center;
  line-height: 21px;
  margin-bottom: ${Spacing.lg}px;
  padding: 0 ${Spacing.sm}px;
`;

const ActionsContainer = styled.View`
  gap: ${Spacing.sm}px;
  margin-top: ${Spacing.sm}px;
`;

const ActionBtn = styled.TouchableOpacity<{ btnStyle: ConfirmSheetActionStyle }>`
  padding: 14px ${Spacing.md}px;
  border-radius: ${Radius.buttonRadius}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, btnStyle }) => {
    if (btnStyle === 'destructive') return theme.colors.danger;
    if (btnStyle === 'cancel') return theme.colors.surfaceContainerLow;
    return theme.colors.primary;
  }};
`;

const ActionLabel = styled.Text<{ btnStyle: ConfirmSheetActionStyle }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 16px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme, btnStyle }) => {
    if (btnStyle === 'cancel') return theme.colors.onSurfaceVariant;
    return theme.colors.onPrimary;
  }};
`;

// ---- Component ----

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({ visible, config, onDismiss }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(MAX_SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const open = useCallback(() => {
    if (isWeb) {
      scale.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = withTiming(0, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    }
    backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
  }, [translateY, backdropOpacity, scale]);

  const close = useCallback(() => {
    Keyboard.dismiss();
    if (isWeb) {
      scale.value = withTiming(0.9, {
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
      });
    } else {
      translateY.value = withTiming(MAX_SHEET_HEIGHT, {
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
      });
    }
    backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION }, () => {
      runOnJS(onDismiss)();
    });
  }, [translateY, backdropOpacity, scale, onDismiss]);

  useEffect(() => {
    if (visible && config) {
      open();
    }
  }, [visible, config, open]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (
        event.translationY > MAX_SHEET_HEIGHT * DISMISS_THRESHOLD ||
        event.velocityY > DISMISS_VELOCITY
      ) {
        runOnJS(close)();
      } else {
        translateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() =>
    isWeb
      ? { transform: [{ scale: scale.value }], opacity: (scale.value - 0.9) / 0.1 }
      : { transform: [{ translateY: translateY.value }] }
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.5,
  }));

  const handleAction = useCallback(
    (action: ConfirmSheetAction) => {
      close();
      // Delay callback slightly to allow animation to start
      setTimeout(() => action.onPress(), 50);
    },
    [close]
  );

  if (!visible || !config) return null;

  // Sort actions: non-cancel first, cancel last
  const sortedActions = [...config.actions].sort((a, b) => {
    if (a.style === 'cancel') return 1;
    if (b.style === 'cancel') return -1;
    return 0;
  });

  const sheetContent = (
    <View style={styles.content}>
      <Title>{config.title}</Title>
      {config.message ? <Message>{config.message}</Message> : null}
      <ActionsContainer>
        {sortedActions.map((action) => (
          <ActionBtn
            key={action.label}
            btnStyle={action.style ?? 'default'}
            activeOpacity={0.7}
            onPress={() => handleAction(action)}>
            <ActionLabel btnStyle={action.style ?? 'default'}>{action.label}</ActionLabel>
          </ActionBtn>
        ))}
      </ActionsContainer>
    </View>
  );

  // Web: centered modal with scale animation
  if (isWeb) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={close} />
        </Animated.View>

        <View style={styles.modalCenterWrap} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.modalContainer,
              sheetStyle,
              { backgroundColor: theme.colors.surfaceContainerLowest },
            ]}>
            {sheetContent}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    );
  }

  // Mobile: bottom sheet with swipe-to-dismiss
  return (
    <GestureHandlerRootView style={styles.root}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={close} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor: theme.colors.surfaceContainerLowest,
              paddingBottom: insets.bottom + Spacing.md,
            },
          ]}>
          <HandleBar />
          {sheetContent}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: MAX_SHEET_HEIGHT,
    borderTopLeftRadius: Radius.sheetRadius,
    borderTopRightRadius: Radius.sheetRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  modalCenterWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: Radius.sheetRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
    paddingVertical: Spacing.lg,
  },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
});
