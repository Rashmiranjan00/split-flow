import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen, Row, Spacer } from '@/shared/components/Layout';
import { ActionButton } from '@/shared/components/ActionButton';
import { useCreateGroupMutation } from '@/features/groups/hooks/useGroupMutations';
import { FriendSelector } from '@/features/friends/components/FriendSelector';

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

const InputLabel = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-bottom: ${Spacing.xs}px;
`;

const StyledInput = styled.TextInput`
  height: 48px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${Radius.inputRadius}px;
  padding: 0 ${Spacing.md}px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.onSurface};
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  margin-bottom: ${Spacing.md}px;
`;

const BottomCTA = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const CreateGroupScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const createMutation = useCreateGroupMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Group name is required.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        memberIds,
      });
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create group';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeScreen>
      <HeaderBar>
        <IconButton onPress={() => router.back()}>
          <MaterialIcons name="close" size={22} color={theme.colors.onSurface} />
        </IconButton>
        <HeaderTitle>New Group</HeaderTitle>
        <IconButton style={{ opacity: 0 }} disabled>
          <MaterialIcons name="close" size={22} color="transparent" />
        </IconButton>
      </HeaderBar>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Body>
            <InputLabel>Group Name</InputLabel>
            <StyledInput
              placeholder="e.g. Summer Trip"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <InputLabel>Description (optional)</InputLabel>
            <StyledInput
              placeholder="What's this group for?"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
            />

            <Spacer size="md" />

            <FriendSelector
              label="Invite friends"
              selectedIds={memberIds}
              onChange={setMemberIds}
              emptyHint="Add friends first to invite them to this group."
            />
          </Body>
        </ScrollView>

        <BottomCTA>
          <ActionButton
            title={
              createMutation.isPending
                ? 'Creating…'
                : memberIds.length > 0
                ? `Create Group · ${memberIds.length + 1} members`
                : 'Create Group'
            }
            onPress={handleCreate}
            disabled={createMutation.isPending || !name.trim()}
          />
        </BottomCTA>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default CreateGroupScreen;
