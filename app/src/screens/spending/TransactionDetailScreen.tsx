import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { apiClient } from '../../api/client';
import { Transaction } from '../../types';
import { formatDate } from '../../utils/date.utils';
import { formatSGD } from '../../utils/currency.utils';
import { formatMiles, formatMpd } from '../../utils/miles.utils';
import { deleteTransaction } from '../../api/transactions.api';

type Props = { route: RouteProp<{ TransactionDetail: { id: number } }, 'TransactionDetail'> };

export default function TransactionDetailScreen({ route }: Props) {
  const { id } = route.params;
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const { data: tx, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: true; data: Transaction }>(`/transactions/${id}`);
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigation.goBack();
    },
  });

  if (isLoading || !tx) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.amount}>{formatSGD(parseFloat(tx.amount))}</Text>
          <Text variant="titleMedium" style={styles.milesEarned}>+{formatMiles(parseFloat(tx.milesEarned))} miles</Text>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>Date</Text>
            <Text variant="bodyMedium">{formatDate(tx.transactedAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>Card</Text>
            <Text variant="bodyMedium">{tx.card.name}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>Category</Text>
            <Text variant="bodyMedium">{tx.category.label}</Text>
          </View>
          {tx.merchant && (
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.label}>Merchant</Text>
              <Text variant="bodyMedium">{tx.merchant}</Text>
            </View>
          )}
          {tx.notes && (
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.label}>Notes</Text>
              <Text variant="bodyMedium" style={styles.notes}>{tx.notes}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="text"
        textColor="red"
        onPress={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        style={styles.deleteBtn}
      >
        Delete Transaction
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 12 },
  amount: { textAlign: 'center', marginBottom: 4 },
  milesEarned: { textAlign: 'center', color: '#1a7f3c', marginBottom: 8 },
  divider: { marginVertical: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { opacity: 0.5 },
  notes: { flex: 1, textAlign: 'right' },
  deleteBtn: { marginTop: 24 },
});
