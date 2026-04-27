import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { RowTitle, RowSubtitle } from '@/shared/components/Typography';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SplitDetail, User } from '@/shared/types';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const Container = styled.View``;

const ParticipantRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.sm}px 0;
`;

const ShareInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.sm}px;
  padding: 6px ${Spacing.sm}px;
  width: 60px;
  text-align: right;
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 14px;
`;

const SharesLabel = styled.Text`
  margin-left: ${Spacing.xs}px;
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

interface SharesSplitEditorProps {
  participants: string[];
  allMembers: User[];
  splitDetails: SplitDetail[];
  onUpdate: (details: SplitDetail[]) => void;
  totalAmount: number;
}

export const SharesSplitEditor: React.FC<SharesSplitEditorProps> = ({
  participants,
  allMembers,
  splitDetails,
  onUpdate,
  totalAmount,
}) => {
  const { formatCurrency } = useCurrencyFormatter();
  const [shares, setShares] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialShares: Record<string, number> = {};
    participants.forEach((pid) => {
      if (!shares[pid]) initialShares[pid] = 1;
    });
    if (Object.keys(initialShares).length > 0) {
      setShares((prev) => ({ ...prev, ...initialShares }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

  const handleShareChange = (userId: string, shareStr: string) => {
    const shareCount = parseFloat(shareStr) || 0;
    const newShares = { ...shares, [userId]: shareCount };
    setShares(newShares);

    const totalShares = Object.values(newShares).reduce((acc, s) => acc + s, 0);
    if (totalShares === 0) return;

    const newDetails: SplitDetail[] = participants.map((pid) => ({
      userId: pid,
      owedAmount: ((newShares[pid] || 0) / totalShares) * totalAmount,
    }));

    onUpdate(newDetails);
  };

  return (
    <Container>
      {allMembers.map((member) => {
        if (!participants.includes(member.id)) return null;

        const detail = splitDetails.find((d) => d.userId === member.id);
        const shareCount = shares[member.id] || 0;

        return (
          <ParticipantRow key={member.id}>
            <Avatar name={member.name} size={Spacing.avatarSm} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <RowTitle>{member.name}</RowTitle>
              <RowSubtitle style={{ fontSize: 11 }}>
                {formatCurrency(detail?.owedAmount || 0)}
              </RowSubtitle>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShareInput
                keyboardType="numeric"
                placeholder="1"
                value={shareCount.toString()}
                onChangeText={(val) => handleShareChange(member.id, val)}
              />
              <SharesLabel>shares</SharesLabel>
            </View>
          </ParticipantRow>
        );
      })}
    </Container>
  );
};
