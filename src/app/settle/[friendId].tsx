import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Spacing } from '@/shared/constants/spacing';
import { 
  SafeScreen, 
  Content, 
  Row, 
  Spacer 
} from '@/shared/components/Layout';
import { 
  Title, 
  Headline,
  BodyMd,
  Label
} from '@/shared/components/Typography';
import { ActionButton } from '@/shared/components/ActionButton';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useUser } from '@/shared/hooks/useUser';

const Header = styled(Row)`
  padding: ${Spacing.md}px ${Spacing.lg}px;
`;

const BackBtn = styled.TouchableOpacity`
  margin-right: ${Spacing.md}px;
`;

const SettleScreen = () => {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const { friends } = useFriends();
  const { user } = useUser();
  const router = useRouter();
  const theme = useTheme();
  const friend = friends.find(m => m.id === friendId);

  return (
    <SafeScreen>
      <Header>
        <BackBtn onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </BackBtn>
        <Title>Record Payment</Title>
      </Header>

      <Content contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <Label style={{ textTransform: 'uppercase', marginBottom: Spacing.md }}>Settling with</Label>
        <Headline style={{ fontSize: 32 }}>{friend?.name ?? 'Friend'}</Headline>
        
        <Spacer size="xxxl" />
        
        <View style={{ width: '100%', paddingHorizontal: Spacing.xl }}>
          <ActionButton 
            title="Confirm Payment" 
            onPress={() => router.back()} 
          />
          <Spacer size="md" />
          <ActionButton 
            title="Cancel" 
            variant="outline"
            onPress={() => router.back()} 
          />
        </View>
      </Content>
    </SafeScreen>
  );
};

const View = styled.View``;

export default SettleScreen;
