import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from 'styled-components/native';
import { Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { ContextListItem } from './ContextListItem';
import type { Group, User } from '@/shared/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;
const ANIMATION_DURATION = 300;

interface ContextPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectGroup: (groupId: string) => void;
  onSelectFriend: (friendId: string) => void;
}

export const ContextPickerSheet: React.FC<ContextPickerSheetProps> = ({
  visible,
  onClose,
  onSelectGroup,
  onSelectFriend,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { groups } = useGroups();
  const { friends } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');

  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const open = useCallback(() => {
    translateY.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
  }, [translateY, backdropOpacity]);

  const close = useCallback(() => {
    Keyboard.dismiss();
    translateY.value = withTiming(SHEET_HEIGHT, {
      duration: ANIMATION_DURATION,
      easing: Easing.in(Easing.cubic),
    });
    backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION }, () => {
      runOnJS(onClose)();
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      open();
    }
  }, [visible, open]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SHEET_HEIGHT * 0.3 || event.velocityY > 500) {
        runOnJS(close)();
      } else {
        translateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.5,
  }));

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter((g: Group) => g.name.toLowerCase().includes(q));
  }, [groups, searchQuery]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.toLowerCase();
    return friends.filter(
      (f: User) => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);

  const handleSelectGroup = useCallback(
    (groupId: string) => {
      close();
      // Small delay so close animation starts before navigation
      setTimeout(() => onSelectGroup(groupId), ANIMATION_DURATION + 50);
    },
    [close, onSelectGroup]
  );

  const handleSelectFriend = useCallback(
    (friendId: string) => {
      close();
      setTimeout(() => onSelectFriend(friendId), ANIMATION_DURATION + 50);
    },
    [close, onSelectFriend]
  );

  if (!visible) return null;

  type ListItem =
    | { type: 'header'; title: string; key: string }
    | { type: 'group'; data: Group; key: string }
    | { type: 'friend'; data: User; key: string }
    | { type: 'empty'; message: string; key: string };

  const listData: ListItem[] = [];

  // Groups section
  listData.push({ type: 'header', title: 'Groups', key: 'header-groups' });
  if (filteredGroups.length === 0) {
    listData.push({ type: 'empty', message: 'No groups found', key: 'empty-groups' });
  } else {
    filteredGroups.forEach((g: Group, idx: number) => {
      listData.push({ type: 'group', data: g, key: `group-${g.id}` });
    });
  }

  // Friends section
  listData.push({ type: 'header', title: 'Friends', key: 'header-friends' });
  if (filteredFriends.length === 0) {
    listData.push({ type: 'empty', message: 'No friends found', key: 'empty-friends' });
  } else {
    filteredFriends.forEach((f: User, idx: number) => {
      listData.push({ type: 'friend', data: f, key: `friend-${f.id}` });
    });
  }

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <SectionText theme={theme}>{item.title}</SectionText>
        </View>
      );
    }
    if (item.type === 'empty') {
      return (
        <View style={styles.emptyRow}>
          <EmptyText theme={theme}>{item.message}</EmptyText>
        </View>
      );
    }
    if (item.type === 'group') {
      const nextItem = listData[index + 1];
      const isLast = !nextItem || nextItem.type === 'header';
      return (
        <ContextListItem
          type="group"
          title={item.data.name}
          subtitle={`${item.data.members.length} member${item.data.members.length !== 1 ? 's' : ''}`}
          onPress={() => handleSelectGroup(item.data.id)}
          isLast={isLast}
        />
      );
    }
    if (item.type === 'friend') {
      const nextItem = listData[index + 1];
      const isLast = !nextItem || nextItem.type === 'header';
      return (
        <ContextListItem
          type="friend"
          title={item.data.name}
          subtitle={item.data.email}
          onPress={() => handleSelectFriend(item.data.id)}
          isLast={isLast}
        />
      );
    }
    return null;
  };

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableOpacity activeOpacity={1} onPress={close} style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
        />
      </TouchableOpacity>

      {/* Sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            {
              height: SHEET_HEIGHT,
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom,
            },
            sheetStyle,
          ]}>
          {/* Grabber */}
          <View style={styles.grabberRow}>
            <View style={[styles.grabber, { backgroundColor: theme.colors.divider }]} />
          </View>

          {/* Title */}
          <View style={styles.titleRow}>
            <SheetTitle theme={theme}>Add expense to...</SheetTitle>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceContainerLow }]}>
              <Search size={18} color={theme.colors.onSurfaceVariant} />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: theme.colors.onSurface,
                    fontFamily: TypographyTokens.fonts.regular,
                  },
                ]}
                placeholder="Search groups or friends"
                placeholderTextColor={theme.colors.onSurfaceVariant + '99'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* List */}
          <FlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.xl }}
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

// Lightweight inline text components
const SheetTitle = ({ children, theme }: { children: React.ReactNode; theme: any }) =>
  React.createElement(
    require('react-native').Text,
    {
      style: {
        fontFamily: TypographyTokens.fonts.semibold,
        fontSize: 17,
        fontWeight: TypographyTokens.weights.semibold,
        color: theme.colors.onSurface,
      },
    },
    children
  );

const SectionText = ({ children, theme }: { children: React.ReactNode; theme: any }) =>
  React.createElement(
    require('react-native').Text,
    {
      style: {
        fontFamily: TypographyTokens.fonts.semibold,
        fontSize: 13,
        fontWeight: TypographyTokens.weights.semibold,
        color: theme.colors.onSurfaceVariant,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
      },
    },
    children
  );

const EmptyText = ({ children, theme }: { children: React.ReactNode; theme: any }) =>
  React.createElement(
    require('react-native').Text,
    {
      style: {
        fontFamily: TypographyTokens.fonts.regular,
        fontSize: 14,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
      },
    },
    children
  );

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radius.sheetRadius,
    borderTopRightRadius: Radius.sheetRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  grabberRow: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.inputRadius,
    paddingHorizontal: Spacing.md,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  emptyRow: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.screenPadding,
    alignItems: 'center',
  },
});
