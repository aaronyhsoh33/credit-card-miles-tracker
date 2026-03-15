import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [serverError, setServerError] = useState('');
  const { setAuth } = useAuthStore();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const result = await login(data.email, data.password);
      await setAuth(result.user, result.accessToken, result.refreshToken);
    } catch (err: any) {
      setServerError(err?.response?.data?.error?.message ?? 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Sign In</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.email}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.email}>{errors.email?.message}</HelperText>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
          />
        )}
      />
      <HelperText type="error" visible={!!errors.password}>{errors.password?.message}</HelperText>

      {serverError ? <HelperText type="error" visible>{serverError}</HelperText> : null}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={styles.button}>
        Sign In
      </Button>
      <Button onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { marginBottom: 24 },
  input: { marginBottom: 4 },
  button: { marginTop: 16, marginBottom: 8 },
});
