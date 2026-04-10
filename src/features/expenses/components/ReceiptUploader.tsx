import React from 'react';
import { Image, TouchableOpacity, View, Alert } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BodySm, Label } from '@/shared/components/Typography';
import { Radius, Spacing } from '@/shared/constants/spacing';

const Container = styled.View`
  margin-horizontal: ${Spacing.lg}px;
  flex-direction: row;
  align-items: center;
`;

const UploadBox = styled.TouchableOpacity`
  width: 80px;
  height: 80px;
  border-radius: ${Radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
  border-style: dashed;
  align-items: center;
  justify-content: center;
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
  background-color: rgba(0,0,0,0.5);
  border-radius: ${Radius.full}px;
  padding: 2px;
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
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload receipts.');
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
          <MaterialIcons name="add-a-photo" size={24} color={theme.colors.onSurfaceVariant} />
          <Label style={{ fontSize: 8, marginTop: 4 }}>ADD RECEIPT</Label>
        </UploadBox>
      )}
      <View style={{ marginLeft: Spacing.md, flex: 1 }}>
        <Label style={{ color: theme.colors.onSurfaceVariant }}>
          Receipt Image
        </Label>
        <BodySm style={{ opacity: 0.6 }}>
          {imageUri ? 'Image attached' : 'No receipt attached'}
        </BodySm>
      </View>
    </Container>
  );
};
