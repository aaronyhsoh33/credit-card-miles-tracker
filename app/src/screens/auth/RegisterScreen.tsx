import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { register } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [serverError, setServerError] = useState('');
  const { setAuth } = useAuthStore();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const result = await register(data.email, data.password, data.name);
      await setAuth(result.user, result.accessToken, result.refreshToken);
    } catch (err: any) {
      setServerError(err?.response?.data?.error?.message ?? 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Create Account</Text>

      <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
        <TextInput label="Name" value={value} onChangeText={onChange} style={styles.input} error={!!errors.name} />
      )} />
      <HelperText type="error" visible={!!errors.name}>{errors.name?.message}</HelperText>

      <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
        <TextInput label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" style={styles.input} error={!!errors.email} />
      )} />
      <HelperText type="error" visible={!!errors.email}>{errors.email?.message}</HelperText>

      <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
        <TextInput label="Password" value={value} onChangeText={onChange} secureTextEntry style={styles.input} error={!!errors.password} />
      )} />
      <HelperText type="error" visible={!!errors.password}>{errors.password?.message}</HelperText>

      {serverError ? <HelperText type="error" visible>{serverError}</HelperText> : null}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={styles.button}>
        Create Account
      </Button>
      <Button onPress={() => navigation.navigate('Login')}>
        Already have an account? Sign in
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
