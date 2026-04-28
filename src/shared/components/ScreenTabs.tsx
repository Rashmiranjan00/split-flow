import React from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';

export interface ScreenTabsItem {
  id: string;
  label: string;
}

export interface ScreenTabsProps {
  tabs: ScreenTabsItem[];
  activeId: string;
  onChange: (id: string) => void;
  scrollable?: boolean;
}

const Container = styled.View`
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px ${Spacing.md}px;
`;

const SegmentedBar = styled.View`
  flex-direction: row;
  padding: 4px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.full}px;
`;

interface PillProps {
  active: boolean;
}

const Pill = styled.TouchableOpacity<PillProps>`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.sm}px ${Spacing.sm}px;
  border-radius: ${Radius.full}px;
  background-color: ${({ active, theme }: PillProps & { theme: any }) =>
    active ? theme.colors.surfaceContainerLowest : 'transparent'};
`;

const PillText = styled.Text<PillProps>`
  font-family: ${({ active }: PillProps) =>
    active ? TypographyTokens.fonts.semibold : TypographyTokens.fonts.medium};
  font-weight: ${({ active }: PillProps) =>
    active ? TypographyTokens.weights.semibold : TypographyTokens.weights.medium};
  font-size: 13px;
  letter-spacing: 0.1px;
  color: ${({ active, theme }: PillProps & { theme: any }) =>
    active ? theme.colors.primary : theme.colors.onSurfaceVariant};
`;

/**
 * Segmented in-screen tab bar. Used on Group Detail and Friend Detail to swap
 * between content sections without introducing a full navigator.
 *
 * Controlled: parent owns `activeId` so tabs can be deep-linked via params.
 */
export const ScreenTabs: React.FC<ScreenTabsProps> = ({
  tabs,
  activeId,
  onChange,
  scrollable = false,
}) => {
  const bar = (
    <SegmentedBar>
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <Pill
            key={tab.id}
            active={active}
            activeOpacity={0.7}
            onPress={() => onChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
          >
            <PillText active={active}>{tab.label}</PillText>
          </Pill>
        );
      })}
    </SegmentedBar>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.screenPadding,
          paddingVertical: Spacing.sm,
        }}
      >
        {bar}
      </ScrollView>
    );
  }

  return <Container>{bar}</Container>;
};
