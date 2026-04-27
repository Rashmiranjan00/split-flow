import React from 'react';
import { View, Alert } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { Radius, Spacing } from '@/shared/constants/spacing';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

const UploadBox = styled.TouchableOpacity`
  width: 80px;
  height: 80px;
  border-radius: ${Radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.divider};
  border-style: dashed;
  align-items: center;
  justify-content: center;
`;

const UploadLabel = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 10px;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const PreviewContainer = styled.View`
  width: 80px;
  height: 80px;
  border-radius: ${Radius.md}px;
  margin-right: ${Spacing.md}px;
  overflow: hidden;
`;

const PreviewImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const RemoveButton = styled.TouchableOpacity`
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: ${Radius.full}px;
  padding: 2px;
`;

const InfoColumn = styled.View`
  margin-left: ${Spacing.md}px;
  flex: 1;
`;

const InfoLabel = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const InfoSubtitle = styled.Text`
  margin-top: 4px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

interface ReceiptUploaderProps {
  imageUri?: string;
  onImageSelected: (uri?: string) => void;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  imageUri,
  onImageSelected,
}) => {
  const theme = useTheme();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'We need camera roll permissions to upload receipts.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <Container>
      {imageUri ? (
        <PreviewContainer>
          <PreviewImage source={{ uri: imageUri }} />
          <RemoveButton onPress={() => onImageSelected(undefined)}>
            <MaterialIcons name="close" size={14} color="white" />
          </RemoveButton>
        </PreviewContainer>
      ) : (
        <UploadBox onPress={pickImage} activeOpacity={0.7}>
          <MaterialIcons name="add-a-photo" size={22} color={theme.colors.onSurfaceVariant} />
          <UploadLabel>Add</UploadLabel>
        </UploadBox>
      )}
      <InfoColumn>
        <InfoLabel>Receipt image</InfoLabel>
        <InfoSubtitle>{imageUri ? 'Image attached' : 'No receipt attached'}</InfoSubtitle>
      </InfoColumn>
    </Container>
  );
};
