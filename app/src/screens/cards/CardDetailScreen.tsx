import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { RouteProp } from '@react-navigation/native';
import { CardsStackParamList } from '../../navigation/CardsStack';
import { getCard } from '../../api/cards.api';
import { formatMpd } from '../../utils/miles.utils';
import { formatSGD } from '../../utils/currency.utils';

type Props = { route: RouteProp<CardsStackParamList, 'CardDetail'> };

export default function CardDetailScreen({ route }: Props) {
  const { cardId } = route.params;

  const { data: card, isLoading } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => getCard(cardId),
  });

  if (isLoading || !card) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall">{card.name}</Text>
          <Text variant="bodyMedium" style={styles.bank}>{card.bank} · {card.network}</Text>
          <Text variant="bodySmall" style={styles.fee}>
            Annual fee: {card.annualFee === 0 ? 'None' : formatSGD(card.annualFee / 100)}
          </Text>
          <Text variant="bodySmall" style={styles.baseRate}>
            Base rate: {formatMpd(parseFloat(card.baseRateMpd))}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Earn Rates</Text>

      {card.rateRules.length === 0 ? (
        <Text variant="bodyMedium" style={styles.noRules}>No special rates. Base rate applies to all spending.</Text>
      ) : (
        card.rateRules.map((rule, index) => (
          <View key={rule.id}>
            <View style={styles.ruleRow}>
              <View style={styles.ruleLeft}>
                <Text variant="bodyMedium" style={styles.categoryLabel}>{rule.category.label}</Text>
                {rule.notes ? <Text variant="bodySmall" style={styles.notes}>{rule.notes}</Text> : null}
              </View>
              <View style={styles.ruleRight}>
                <Text variant="titleMedium" style={styles.mpd}>{formatMpd(parseFloat(rule.mpd))}</Text>
                {rule.monthlyCap ? (
                  <Text variant="bodySmall" style={styles.cap}>Cap: {formatSGD(parseFloat(rule.monthlyCap))}/mo</Text>
                ) : null}
                {rule.minSpend ? (
                  <Text variant="bodySmall" style={styles.cap}>Min: {formatSGD(parseFloat(rule.minSpend))}/mo</Text>
                ) : null}
              </View>
            </View>
            {index < card.rateRules.length - 1 && <Divider />}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  headerCard: { marginBottom: 20, borderRadius: 12 },
  bank: { opacity: 0.6, marginTop: 4 },
  fee: { opacity: 0.5, marginTop: 8 },
  baseRate: { opacity: 0.5, marginTop: 2 },
  sectionTitle: { marginBottom: 12, fontWeight: '600' },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 14 },
  ruleLeft: { flex: 1, paddingRight: 12 },
  ruleRight: { alignItems: 'flex-end' },
  categoryLabel: { fontWeight: '500' },
  notes: { opacity: 0.5, marginTop: 2 },
  mpd: { color: '#1a7f3c', fontWeight: '700' },
  cap: { opacity: 0.5, marginTop: 2 },
  noRules: { opacity: 0.5, textAlign: 'center', marginTop: 8 },
});
