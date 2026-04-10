import React, { useState, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { BodyMd, Label } from '@/shared/components/Typography';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { SplitDetail, User } from '@/shared/types';

import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const Container = styled.View`
  padding-horizontal: ${Spacing.lg}px;
`;

const ParticipantRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${Spacing.md}px;
`;

const ShareInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border-radius: ${Radius.sm}px;
  padding: ${Spacing.xs}px ${Spacing.sm}px;
  width: 60px;
  text-align: right;
  color: ${({ theme }) => theme.colors.onSurface};
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
  const theme = useTheme();
  const { formatCurrency } = useCurrencyFormatter();
  const [shares, setShares] = useState<Record<string, number>>({});

  // Sync shares state with splitDetails initially
  useEffect(() => {
    const initialShares: Record<string, number> = {};
    // If we have totalAmount and splitDetails, we could deduce shares, 
    // but usually shares are the input. For this editor, we'll maintain 
    // a local share count.
    participants.forEach(pid => {
      if (!shares[pid]) initialShares[pid] = 1; // Default 1 share
    });
    if (Object.keys(initialShares).length > 0) {
      setShares(prev => ({ ...prev, ...initialShares }));
    }
  }, [participants]);

  const handleShareChange = (userId: string, shareStr: string) => {
    const shareCount = parseFloat(shareStr) || 0;
    const newShares = { ...shares, [userId]: shareCount };
    setShares(newShares);

    const totalShares = Object.values(newShares).reduce((acc, s) => acc + s, 0);
    if (totalShares === 0) return;

    const newDetails: SplitDetail[] = participants.map(pid => ({
      userId: pid,
      owedAmount: ((newShares[pid] || 0) / totalShares) * totalAmount,
    }));

    onUpdate(newDetails);
  };

  return (
    <Container>
      {allMembers.map((member) => {
        const isParticipant = participants.includes(member.id);
        if (!isParticipant) return null;

        const detail = splitDetails.find(d => d.userId === member.id);
        const shareCount = shares[member.id] || 0;

        return (
          <ParticipantRow key={member.id}>
            <Avatar name={member.name} size={32} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <BodyMd>{member.name}</BodyMd>
              <Label style={{ fontSize: 10, opacity: 0.6 }}>
                {formatCurrency(detail?.owedAmount || 0)}
              </Label>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShareInput
                keyboardType="numeric"
                placeholder="1"
                value={shareCount.toString()}
                onChangeText={(val) => handleShareChange(member.id, val)}
              />
              <Label style={{ marginLeft: Spacing.xs, width: 45 }}>shares</Label>
            </View>
          </ParticipantRow>
        );
      })}
    </Container>
  );
};
