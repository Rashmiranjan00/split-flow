import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '@/shared/components/ActionButton';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen } from '@/shared/components/Layout';
import { updatePassword } from '@/services/supabase/auth';

// ---- Zod schema ----

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

// ---- Styled components ----

const HeroSection = styled.View`
  align-items: center;
  justify-content: center;
  padding: ${Spacing.xxl}px ${Spacing.screenPadding}px ${Spacing.lg}px;
`;

const IconCircle = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-bottom: ${Spacing.lg}px;
`;

const Heading = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 24px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onSurface};
  letter-spacing: -0.5px;
`;

const Subtitle = styled.Text`
  margin-top: ${Spacing.sm}px;
  text-align: center;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 21px;
  padding-horizontal: ${Spacing.lg}px;
`;

const FormWrapper = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
  },
  keyboardShouldPersistTaps: 'handled' as const,
})`
  flex: 1;
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
`;

const FieldError = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 2px;
  margin-bottom: ${Spacing.sm}px;
`;

const FieldSpacer = styled.View`
  height: ${Spacing.md}px;
`;

const RemoteError = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  margin-bottom: ${Spacing.md}px;
`;

// ---- Screen ----

const ResetPasswordScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const [remoteError, setRemoteError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setRemoteError('');
    setSubmitting(true);
    try {
      await updatePassword(data.password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setRemoteError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <HeroSection>
          <IconCircle>
            <Lock size={24} color={theme.colors.onPrimary} />
          </IconCircle>
          <Heading>Set New Password</Heading>
          <Subtitle>Choose a strong password with at least 8 characters.</Subtitle>
        </HeroSection>

        <FormWrapper>
          {remoteError ? <RemoteError>{remoteError}</RemoteError> : null}

          <InputLabel>New Password</InputLabel>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledInput
                placeholder="Min 8 characters"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                secureTextEntry
                autoComplete="new-password"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          {errors.password ? <FieldError>{errors.password.message}</FieldError> : <FieldSpacer />}

          <InputLabel>Confirm Password</InputLabel>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledInput
                placeholder="Re-enter password"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                secureTextEntry
                autoComplete="new-password"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          {errors.confirmPassword ? (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          ) : (
            <FieldSpacer />
          )}

          <ActionButton
            title={submitting ? 'Updating...' : 'Update Password'}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
            isLoading={submitting}
          />
        </FormWrapper>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default ResetPasswordScreen;
