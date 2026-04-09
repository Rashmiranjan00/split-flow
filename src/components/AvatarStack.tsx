import React from 'react';
import styled from 'styled-components/native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface AvatarWrapperProps {
  index: number;
  size: number;
}

const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AvatarWrapper = styled.View<AvatarWrapperProps>`
  width: ${({ size }: AvatarWrapperProps) => size}px;
  height: ${({ size }: AvatarWrapperProps) => size}px;
  border-radius: ${({ size }: AvatarWrapperProps) => size / 2}px;
  border-width: 2px;
  border-color: ${Colors.surfaceContainerLow};
  background-color: ${Colors.surfaceVariant};
  margin-left: ${({ index, size }: AvatarWrapperProps) => (index === 0 ? '0px' : `-${size / 4}px`)};
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const OverflowText = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.bold};
`;

interface AvatarStackProps {
  urls: string[];
  maxTokens?: number;
  size?: number;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ urls, maxTokens = 3, size = 32 }) => {
  const visibleAvatars = urls.slice(0, maxTokens);
  const remainingCount = urls.length - maxTokens;

  return (
    <Container>
      {visibleAvatars.map((url, index) => (
        <AvatarWrapper key={index} index={index} size={size}>
          {url ? <AvatarImage source={{ uri: url }} /> : null}
        </AvatarWrapper>
      ))}
      {remainingCount > 0 && (
        <AvatarWrapper index={maxTokens} size={size}>
          <OverflowText>+{remainingCount}</OverflowText>
        </AvatarWrapper>
      )}
    </Container>
  );
};
