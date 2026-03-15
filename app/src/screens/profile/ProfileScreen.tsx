import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useAuthStore } from '../../store/auth.store';
import { logout } from '../../api/auth.api';
import { getStoredRefreshToken } from '../../store/auth.store';

export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    const refreshToken = await getStoredRefreshToken();
    if (refreshToken) {
      try {
        await logout(refreshToken);
      } catch {
        // ignore logout API errors — clear locally regardless
      }
    }
    await clearAuth();
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text variant="titleLarge">{user?.name ?? 'User'}</Text>
        <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>
      </View>

      <Divider style={styles.divider} />

      <Button mode="outlined" textColor="red" onPress={handleLogout} style={styles.logoutBtn}>
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  section: { marginBottom: 16 },
  email: { opacity: 0.5, marginTop: 4 },
  divider: { marginVertical: 24 },
  logoutBtn: { borderColor: 'red' },
});
