import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, ActivityIndicator, Chip, Card } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { StackNavigationProp } from '@react-navigation/stack';
import { SpendingStackParamList } from '../../navigation/SpendingStack';
import { listTransactions } from '../../api/transactions.api';
import { formatDate, currentMonthRange } from '../../utils/date.utils';
import { formatSGD } from '../../utils/currency.utils';
import { formatMiles } from '../../utils/miles.utils';
import { Transaction } from '../../types';
import { format } from 'date-fns';

type Props = { navigation: StackNavigationProp<SpendingStackParamList, 'SpendingMain'> };

export default function SpendingScreen({ navigation }: Props) {
  const [page, setPage] = useState(1);
  const { from, to } = currentMonthRange();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', 'list', { from, to, page }],
    queryFn: () => listTransactions({ from, to, page, limit: 50 }),
  });

  const transactions = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  // Group by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const dateKey = format(new Date(tx.transactedAt), 'yyyy-MM-dd');
    acc[dateKey] = [...(acc[dateKey] ?? []), tx];
    return acc;
  }, {});

  const groupedEntries = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium">{total} transactions this month</Text>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyMedium" style={styles.emptyText}>No transactions this month yet.</Text>
        </View>
      ) : (
        <FlatList
          data={groupedEntries}
          keyExtractor={([date]) => date}
          contentContainerStyle={styles.list}
          renderItem={({ item: [date, txs] }) => (
            <View>
              <Text variant="labelLarge" style={styles.dateHeader}>{formatDate(date)}</Text>
              {txs.map((tx) => (
                <TouchableOpacity
                  key={tx.id}
                  onPress={() => navigation.navigate('TransactionDetail', { id: tx.id })}
                >
                  <Card style={styles.txCard}>
                    <Card.Content style={styles.txContent}>
                      <View style={styles.txLeft}>
                        <Text variant="bodyMedium">{tx.merchant ?? tx.category.label}</Text>
                        <Text variant="bodySmall" style={styles.cardName}>{tx.card.name}</Text>
                        <Chip compact style={styles.categoryChip}>{tx.category.label}</Chip>
                      </View>
                      <View style={styles.txRight}>
                        <Text variant="bodyMedium">{formatSGD(parseFloat(tx.amount))}</Text>
                        <Text variant="bodySmall" style={styles.miles}>+{formatMiles(parseFloat(tx.milesEarned))} mi</Text>
                      </View>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingBottom: 8 },
  list: { padding: 16, gap: 4 },
  dateHeader: { marginTop: 16, marginBottom: 8, opacity: 0.5 },
  txCard: { marginBottom: 8, borderRadius: 10 },
  txContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  txLeft: { flex: 1 },
  txRight: { alignItems: 'flex-end' },
  cardName: { opacity: 0.5, marginTop: 2 },
  categoryChip: { alignSelf: 'flex-start', marginTop: 6, height: 24 },
  miles: { color: '#1a7f3c', marginTop: 4 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { opacity: 0.5 },
});
