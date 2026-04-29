import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components/native';
import {
  Plane,
  Home as HomeIcon,
  UtensilsCrossed,
  Briefcase,
  type LucideIcon,
} from 'lucide-react-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { Avatar } from '@/shared/components/Avatar';

interface ContextListItemProps {
  type: 'group' | 'friend';
  title: string;
  subtitle: string;
  onPress: () => void;
  isLast?: boolean;
}

const getGroupIcon = (name: string): LucideIcon => {
  const lower = name.toLowerCase();
  if (lower.includes('trip') || lower.includes('travel')) return Plane;
  if (lower.includes('home') || lower.includes('house') || lower.includes('rent')) return HomeIcon;
  if (lower.includes('food') || lower.includes('dinner') || lower.includes('lunch'))
    return UtensilsCrossed;
  return Briefcase;
};

export const ContextListItem: React.FC<ContextListItemProps> = ({
  type,
  title,
  subtitle,
  onPress,
  isLast,
}) => {
  const theme = useTheme();

  const renderLeading = () => {
    if (type === 'friend') {
      return <Avatar name={title} size={Spacing.avatarSm} />;
    }
    const Icon = getGroupIcon(title);
    return (
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryFixedDim }]}>
        <Icon size={18} color={theme.colors.brandDark} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`Select ${title}`}>
      {renderLeading()}
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <React.Fragment>
              <View style={styles.titleContainer}>
                <RowTitle numberOfLines={1} theme={theme}>
                  {title}
                </RowTitle>
              </View>
              {subtitle ? (
                <RowSubtitle numberOfLines={1} theme={theme}>
                  {subtitle}
                </RowSubtitle>
              ) : null}
            </React.Fragment>
          </View>
        </View>
        {!isLast && <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />}
      </View>
    </TouchableOpacity>
  );
};

// Inline text components to avoid circular import with Typography.tsx
const RowTitle = ({
  children,
  numberOfLines,
  theme,
}: {
  children: React.ReactNode;
  numberOfLines?: number;
  theme: any;
}) => (
  <View>
    <React.Fragment>
      {React.createElement(
        require('react-native').Text,
        {
          numberOfLines,
          style: {
            fontFamily: TypographyTokens.fonts.medium,
            fontSize: 15,
            fontWeight: TypographyTokens.weights.medium,
            color: theme.colors.onSurface,
          },
        },
        children
      )}
    </React.Fragment>
  </View>
);

const RowSubtitle = ({
  children,
  numberOfLines,
  theme,
}: {
  children: React.ReactNode;
  numberOfLines?: number;
  theme: any;
}) => (
  <View>
    {React.createElement(
      require('react-native').Text,
      {
        numberOfLines,
        style: {
          fontFamily: TypographyTokens.fonts.regular,
          fontSize: 13,
          color: theme.colors.onSurfaceVariant,
          marginTop: 2,
        },
      },
      children
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.rowVertical,
    paddingHorizontal: Spacing.screenPadding,
  },
  iconWrap: {
    width: Spacing.avatarSm,
    height: Spacing.avatarSm,
    borderRadius: Spacing.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: Spacing.rowVertical,
  },
});
