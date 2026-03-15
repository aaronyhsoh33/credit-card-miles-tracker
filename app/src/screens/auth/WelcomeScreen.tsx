import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Miles Tracker
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Earn more miles on every dollar spent
      </Text>
      <Button mode="contained" onPress={() => navigation.navigate('Register')} style={styles.button}>
        Get Started
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('Login')} style={styles.button}>
        Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { marginBottom: 8, textAlign: 'center' },
  subtitle: { marginBottom: 48, textAlign: 'center', opacity: 0.6 },
  button: { width: '100%', marginBottom: 12 },
});
