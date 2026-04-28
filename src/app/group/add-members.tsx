import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen, Row, Spacer } from '@/shared/components/Layout';
import { BodyMd } from '@/shared/components/Typography';
import { ActionButton } from '@/shared/components/ActionButton';
import { FriendSelector } from '@/features/friends/components/FriendSelector';
import { useGroup } from '@/features/groups/hooks/useGroups';
import { useAddGroupMemberMutation } from '@/features/groups/hooks/useGroupMutations';

const HeaderBar = styled(Row)`
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px;
  margin-bottom: 0;
`;

const IconButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  text-align: center;
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const Body = styled.View`
  padding: ${Spacing.xl}px ${Spacing.screenPadding}px;
`;

const BottomCTA = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const AddMembersScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { group } = useGroup(groupId ?? '');
  const addMemberMutation = useAddGroupMemberMutation(groupId ?? '');
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  if (!groupId) return null;

  const existingMemberIds = group?.members ?? [];

  const handleAdd = async () => {
    if (selected.length === 0) return;
    setBusy(true);
    try {
      for (const uid of selected) {
        await addMemberMutation.mutateAsync(uid);
      }
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add members';
      Alert.alert('Error', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeScreen>
      <HeaderBar>
        <IconButton onPress={() => router.back()}>
          <X size={22} color={theme.colors.onSurface} />
        </IconButton>
        <HeaderTitle>Add Members</HeaderTitle>
        <IconButton style={{ opacity: 0 }} disabled>
          <X size={22} color="transparent" />
        </IconButton>
      </HeaderBar>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Body>
            <BodyMd style={{ color: theme.colors.onSurfaceVariant }}>
              Only your friends can be added to a group. Invite someone from the Friends tab
              first if they&apos;re not here.
            </BodyMd>

            <Spacer size="md" />

            <FriendSelector
              label="Your friends"
              selectedIds={selected}
              onChange={setSelected}
              excludeIds={existingMemberIds}
              emptyHint="You don't have any friends outside this group yet."
            />
          </Body>
        </ScrollView>

        <BottomCTA>
          <ActionButton
            title={
              busy
                ? 'Adding…'
                : selected.length > 0
                ? `Add ${selected.length} member${selected.length === 1 ? '' : 's'}`
                : 'Add Members'
            }
            onPress={handleAdd}
            disabled={busy || selected.length === 0}
          />
        </BottomCTA>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default AddMembersScreen;
