import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '@/shared/components/ActionButton';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen } from '@/shared/components/Layout';
import { resetPassword } from '@/services/supabase/auth';

// ---- Zod schema ----

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

// ---- Styled components ----

const HeaderBar = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px;
`;

const BackBtn = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const HeroSection = styled.View`
  align-items: center;
  justify-content: center;
  padding: ${Spacing.lg}px ${Spacing.screenPadding}px ${Spacing.lg}px;
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

const SuccessContainer = styled.View`
  align-items: center;
  padding: ${Spacing.xl}px ${Spacing.screenPadding}px;
`;

const SuccessIcon = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.colors.primaryFixedDim};
  align-items: center;
  justify-content: center;
  margin-bottom: ${Spacing.lg}px;
`;

const SuccessTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 18px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
  margin-bottom: ${Spacing.sm}px;
`;

const SuccessMessage = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-align: center;
  line-height: 21px;
  margin-bottom: ${Spacing.xl}px;
`;

const LinkText = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.primary};
`;

// ---- Screen ----

const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const [remoteError, setRemoteError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setRemoteError('');
    setSubmitting(true);
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setRemoteError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <SafeScreen>
        <HeaderBar>
          <BackBtn onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.onSurface} />
          </BackBtn>
        </HeaderBar>
        <SuccessContainer>
          <SuccessIcon>
            <Mail size={28} color={theme.colors.primary} />
          </SuccessIcon>
          <SuccessTitle>Check your email</SuccessTitle>
          <SuccessMessage>
            We&apos;ve sent a password reset link to your email address. Please check your inbox and
            follow the instructions.
          </SuccessMessage>
          <TouchableOpacity onPress={() => router.back()}>
            <LinkText>Back to Sign In</LinkText>
          </TouchableOpacity>
        </SuccessContainer>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <HeaderBar>
        <BackBtn onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.colors.onSurface} />
        </BackBtn>
      </HeaderBar>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <HeroSection>
          <IconCircle>
            <Mail size={24} color={theme.colors.onPrimary} />
          </IconCircle>
          <Heading>Reset Password</Heading>
          <Subtitle>
            Enter the email address associated with your account and we&apos;ll send you a link to
            reset your password.
          </Subtitle>
        </HeroSection>

        <FormWrapper>
          {remoteError ? <RemoteError>{remoteError}</RemoteError> : null}

          <InputLabel>Email</InputLabel>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledInput
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                autoFocus
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : <FieldSpacer />}

          <ActionButton
            title={submitting ? 'Sending...' : 'Send Reset Link'}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
            isLoading={submitting}
          />
        </FormWrapper>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default ForgotPasswordScreen;
