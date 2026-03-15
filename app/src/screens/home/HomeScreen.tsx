import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Surface, ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { getTransactionSummary, listTransactions } from '../../api/transactions.api';
import { recommendAll } from '../../api/recommend.api';
import { currentMonthRange, formatDate } from '../../utils/date.utils';
import { formatMiles, formatMpd } from '../../utils/miles.utils';
import { formatSGD } from '../../utils/currency.utils';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { from, to } = currentMonthRange();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['transactions', 'summary', from, to],
    queryFn: () => getTransactionSummary({ from, to }),
  });

  const { data: recentTxData } = useQuery({
    queryKey: ['transactions', 'list', { limit: 5 }],
    queryFn: () => listTransactions({ limit: 5 }),
  });

  const { data: allRecommend } = useQuery({
    queryKey: ['recommend', 'all'],
    queryFn: recommendAll,
  });

  const recentTx = recentTxData?.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Miles Hero */}
      <Surface style={styles.heroCard} elevation={2}>
        {summaryLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text variant="labelLarge" style={styles.heroLabel}>Miles Earned This Month</Text>
            <Text variant="displayMedium" style={styles.heroMiles}>
              {formatMiles(summary?.totalMiles ?? 0)}
            </Text>
            <Text variant="bodySmall" style={styles.heroSub}>
              {formatSGD(summary?.totalSpend ?? 0)} spent · {summary?.totalTransactions ?? 0} transactions
            </Text>
          </>
        )}
      </Surface>

      {/* Quick Category Picks */}
      {allRecommend && allRecommend.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Best Card by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allRecommend.slice(0, 6).map(({ category, bestCard }) => (
              <TouchableOpacity
                key={category.id}
                style={styles.quickChip}
                onPress={() => navigation.navigate('Recommend', {
                  screen: 'RecommendMain',
                  params: { categorySlug: category.slug },
                })}
              >
                <Text variant="labelSmall">{category.label}</Text>
                {bestCard ? (
                  <Text variant="bodySmall" style={styles.chipMpd}>{formatMpd(bestCard.bestMpd)}</Text>
                ) : (
                  <Text variant="bodySmall" style={styles.chipNoCard}>No card</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTx.length === 0 ? (
          <Text variant="bodyMedium" style={styles.emptyText}>No transactions yet. Log your first spend!</Text>
        ) : (
          recentTx.map((tx) => (
            <TouchableOpacity key={tx.id} onPress={() => navigation.navigate('Spending', {
              screen: 'TransactionDetail', params: { id: tx.id }
            })}>
              <Card style={styles.txCard}>
                <Card.Content style={styles.txContent}>
                  <View style={styles.txLeft}>
                    <Text variant="bodyMedium">{tx.merchant ?? tx.category.label}</Text>
                    <Text variant="bodySmall" style={styles.txDate}>{tx.card.name} · {formatDate(tx.transactedAt)}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text variant="bodyMedium">{formatSGD(parseFloat(tx.amount))}</Text>
                    <Text variant="bodySmall" style={styles.txMiles}>+{formatMiles(parseFloat(tx.milesEarned))} mi</Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  heroCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 8 },
  heroLabel: { opacity: 0.6, marginBottom: 4 },
  heroMiles: { fontWeight: 'bold' },
  heroSub: { opacity: 0.5, marginTop: 4 },
  section: { marginTop: 16 },
  sectionTitle: { marginBottom: 12, fontWeight: '600' },
  quickChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  chipMpd: { color: '#1a7f3c', fontWeight: '600', marginTop: 2 },
  chipNoCard: { opacity: 0.4, marginTop: 2 },
  txCard: { marginBottom: 8 },
  txContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txLeft: { flex: 1 },
  txRight: { alignItems: 'flex-end' },
  txDate: { opacity: 0.5, marginTop: 2 },
  txMiles: { color: '#1a7f3c', marginTop: 2 },
  emptyText: { opacity: 0.5, textAlign: 'center', marginTop: 16 },
});
