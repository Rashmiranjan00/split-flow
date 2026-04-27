import React from 'react';
import { TouchableOpacityProps, ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { SectionLabel } from '@/shared/components/Typography';

/** SafeScreen: use for top-level screens outside of Tabs. */
export const SafeScreen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

/** Screen: regular view container. Combined with TabsLayout safe-area handling. */
export const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Content = styled.ScrollView.attrs(() => ({
  contentContainerStyle: { paddingBottom: 20 },
}))`
  flex: 1;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${Spacing.md}px;
`;

export const SpaceBetweenRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${Spacing.md}px;
`;

export const Column = styled.View`
  flex-direction: column;
`;

interface SpacerProps {
  size?: keyof typeof Spacing;
  horizontal?: boolean;
}

export const Spacer = styled.View<SpacerProps>`
  ${(props: SpacerProps) => {
    const size = props.size || 'md';
    const space = Spacing[size];
    return props.horizontal
      ? `width: ${space}px;`
      : `height: ${space}px;`;
  }}
`;

/**
 * SurfaceCard: white card with 16px radius and soft ambient shadow.
 * Matches the Stitch WMF spec (0 1px 3px rgba(0,0,0,0.06)).
 */
export const SurfaceCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-radius: ${Radius.cardRadius}px;
  padding: ${Spacing.md}px;
  shadow-color: #000000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.06;
  shadow-radius: 3px;
  elevation: 1;
`;

interface SectionHeaderProps {
  label: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const SectionHeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: ${Spacing.screenPadding}px;
  padding-top: ${Spacing.md}px;
  padding-bottom: ${Spacing.sectionGap}px;
`;

const SectionAction = styled.TouchableOpacity``;

const SectionActionText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-family: Inter_600SemiBold;
  font-size: 13px;
  letter-spacing: 0.2px;
`;

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  action,
  onAction,
  style,
}) => {
  return (
    <SectionHeaderRow style={style}>
      <SectionLabel>{label}</SectionLabel>
      {action && onAction ? (
        <SectionAction onPress={onAction} activeOpacity={0.7}>
          <SectionActionText>{action}</SectionActionText>
        </SectionAction>
      ) : null}
    </SectionHeaderRow>
  );
};

interface TxnRowProps extends TouchableOpacityProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  isLast?: boolean;
}

const TxnRowTouchable = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.rowVertical}px ${Spacing.screenPadding}px;
  background-color: transparent;
`;

const TxnRowDivider = styled.View<{ isLast?: boolean }>`
  height: ${(props: { isLast?: boolean }) => (props.isLast ? 0 : 1)}px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-left: ${Spacing.screenPadding + Spacing.avatarSm + Spacing.md}px;
`;

const TxnRowLeading = styled.View`
  margin-right: ${Spacing.md}px;
`;

const TxnRowCenter = styled.View`
  flex: 1;
  min-width: 0;
`;

const TxnRowTrailing = styled.View`
  align-items: flex-end;
  margin-left: ${Spacing.sm}px;
`;

/**
 * TxnRow: flat transaction-style row used by Home, Activity, Groups, and
 * Group Detail. No card wrapper. 1px divider indented 72px from the left
 * (except the last row).
 */
export const TxnRow: React.FC<TxnRowProps> = ({
  leading,
  title,
  subtitle,
  trailing,
  isLast,
  ...touchableProps
}) => {
  return (
    <>
      <TxnRowTouchable activeOpacity={0.7} {...touchableProps}>
        {leading ? <TxnRowLeading>{leading}</TxnRowLeading> : null}
        <TxnRowCenter>
          {title}
          {subtitle ? subtitle : null}
        </TxnRowCenter>
        {trailing ? <TxnRowTrailing>{trailing}</TxnRowTrailing> : null}
      </TxnRowTouchable>
      <TxnRowDivider isLast={isLast} />
    </>
  );
};
