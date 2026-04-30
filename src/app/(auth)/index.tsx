import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useConfirmSheet } from '@/shared/hooks/useConfirmSheet';
import { ActionButton } from '@/shared/components/ActionButton';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen } from '@/shared/components/Layout';
import { signIn, signUp } from '@/services/supabase/auth';

// ---- Zod schemas ----

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(1, 'Name is required').max(60),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type AuthMode = 'signin' | 'signup';

// ---- Styled components ----

const HeroSection = styled.View`
  align-items: center;
  justify-content: center;
  padding: ${Spacing.xl}px ${Spacing.screenPadding}px ${Spacing.lg}px;
`;

const LogoCircle = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-bottom: ${Spacing.xl}px;
`;

const LogoLetter = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 24px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onPrimary};
`;

const Wordmark = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 32px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onSurface};
  letter-spacing: -0.8px;
`;

const Tagline = styled.Text`
  margin-top: ${Spacing.md}px;
  text-align: center;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 22px;
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

const ToggleRow = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.buttonRadius}px;
  margin-bottom: ${Spacing.lg}px;
  overflow: hidden;
`;

const ToggleButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: ${Spacing.sm}px 0;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, active }) => (active ? theme.colors.primary : 'transparent')};
  border-radius: ${Radius.buttonRadius}px;
`;

const ToggleLabel = styled.Text<{ active: boolean }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 14px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme, active }) =>
    active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant};
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

const PasswordWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  height: 48px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${Radius.inputRadius}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
`;

const PasswordInput = styled.TextInput`
  flex: 1;
  height: 48px;
  padding: 0 ${Spacing.md}px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const RemoteError = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  margin-bottom: ${Spacing.md}px;
`;

const ForgotLink = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.primary};
`;

// ---- Screen ----

const AuthScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [remoteError, setRemoteError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = mode === 'signup';

  const dynamicResolver = useCallback(
    (...args: Parameters<ReturnType<typeof zodResolver>>) =>
      zodResolver(isSignUp ? signUpSchema : signInSchema)(...args),
    [isSignUp]
  ) as unknown as Resolver<SignUpValues>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpValues>({
    resolver: dynamicResolver,
    defaultValues: { email: '', password: '', name: '' },
  });

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setRemoteError('');
    setShowPassword(false);
    reset();
  };

  const { show } = useConfirmSheet();

  const onSubmit = async (data: SignUpValues) => {
    setRemoteError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        const result = await signUp({
          email: data.email,
          password: data.password,
          name: data.name,
        });
        if (result.user && !result.session) {
          show({
            title: 'Check your email',
            message: 'We sent you a confirmation link. Please verify your email to continue.',
            actions: [{ label: 'OK', onPress: () => {} }],
          });
        }
      } else {
        await signIn({ email: data.email, password: data.password });
      }
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
          <LogoCircle>
            <LogoLetter>S</LogoLetter>
          </LogoCircle>
          <Wordmark>SplitFlow</Wordmark>
          <Tagline>Split bills, share expenses, and manage group finances with ease.</Tagline>
        </HeroSection>

        <FormWrapper>
          <ToggleRow>
            <ToggleButton active={!isSignUp} onPress={() => switchMode('signin')}>
              <ToggleLabel active={!isSignUp}>Sign In</ToggleLabel>
            </ToggleButton>
            <ToggleButton active={isSignUp} onPress={() => switchMode('signup')}>
              <ToggleLabel active={isSignUp}>Sign Up</ToggleLabel>
            </ToggleButton>
          </ToggleRow>

          {remoteError ? <RemoteError>{remoteError}</RemoteError> : null}

          {isSignUp && (
            <>
              <InputLabel>Full Name</InputLabel>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <StyledInput
                    placeholder="John Doe"
                    placeholderTextColor={theme.colors.onSurfaceVariant}
                    autoCapitalize="words"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.name ? <FieldError>{errors.name.message}</FieldError> : <FieldSpacer />}
            </>
          )}

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
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          {errors.email ? <FieldError>{errors.email.message}</FieldError> : <FieldSpacer />}

          <InputLabel>Password</InputLabel>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordWrapper>
                <PasswordInput
                  placeholder="Min 8 characters"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  secureTextEntry={!showPassword}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={{ paddingHorizontal: Spacing.md }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPassword ? (
                    <EyeOff size={20} color={theme.colors.onSurfaceVariant} />
                  ) : (
                    <Eye size={20} color={theme.colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </PasswordWrapper>
            )}
          />
          {errors.password ? <FieldError>{errors.password.message}</FieldError> : <FieldSpacer />}

          {!isSignUp && (
            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={{ alignSelf: 'flex-end', marginBottom: Spacing.md }}>
              <ForgotLink>Forgot Password?</ForgotLink>
            </TouchableOpacity>
          )}

          <ActionButton
            title={submitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
          />
        </FormWrapper>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default AuthScreen;
