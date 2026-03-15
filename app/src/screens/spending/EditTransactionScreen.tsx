import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

// Placeholder — mirrors AddTransactionScreen but pre-fills existing values
export default function EditTransactionScreen() {
  return (
    <View style={styles.container}>
      <Text variant="bodyMedium">Edit Transaction (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
