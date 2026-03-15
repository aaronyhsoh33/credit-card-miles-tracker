import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, Menu } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SpendingStackParamList } from '../../navigation/SpendingStack';
import { getMyCards } from '../../api/cards.api';
import { listCategories } from '../../api/categories.api';
import { createTransaction } from '../../api/transactions.api';
import { recommend } from '../../api/recommend.api';
import { toISODate } from '../../utils/date.utils';
import { formatMiles, formatMpd } from '../../utils/miles.utils';

const schema = z.object({
  amount: z.string().min(1, 'Amount required').refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Enter a valid amount'),
  merchant: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AddTransactionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<SpendingStackParamList, 'AddTransaction'>>();
  const queryClient = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(route.params?.categorySlug ?? '');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(route.params?.cardId ?? null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [cardMenuVisible, setCardMenuVisible] = useState(false);
  const [serverError, setServerError] = useState('');

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: listCategories });
  const { data: myCards = [] } = useQuery({ queryKey: ['myCards'], queryFn: getMyCards });

  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', merchant: '', notes: '' },
  });

  const amountText = watch('amount');
  const amount = amountText ? parseFloat(amountText) : undefined;

  // Set category id when slug changes
  useEffect(() => {
    if (selectedCategorySlug && categories.length > 0) {
      const cat = categories.find((c) => c.slug === selectedCategorySlug);
      if (cat) setSelectedCategoryId(cat.id);
    }
  }, [selectedCategorySlug, categories]);

  // Live miles preview using recommend API
  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommend', selectedCategorySlug, amount],
    queryFn: () => recommend(selectedCategorySlug, amount),
    enabled: !!selectedCategorySlug && !!amount,
  });

  const selectedCardRec = recommendations.find((r) => r.cardId === selectedCardId);

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigation.goBack();
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedCategoryId) return;
    if (!selectedCardId) return;
    setServerError('');
    try {
      await mutation.mutateAsync({
        cardId: selectedCardId,
        categoryId: selectedCategoryId,
        amount: parseFloat(data.amount),
        merchant: data.merchant || undefined,
        notes: data.notes || undefined,
        transactedAt: toISODate(new Date()),
      });
    } catch (err: any) {
      setServerError(err?.response?.data?.error?.message ?? 'Failed to save transaction');
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedCard = myCards.find((uc) => uc.cardId === selectedCardId);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Amount */}
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Amount (SGD)"
              value={value}
              onChangeText={onChange}
              keyboardType="decimal-pad"
              left={<TextInput.Affix text="S$" />}
              error={!!errors.amount}
              style={styles.input}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.amount}>{errors.amount?.message}</HelperText>

        {/* Category picker */}
        <Text variant="labelLarge" style={styles.pickerLabel}>Category</Text>
        <Menu
          visible={categoryMenuVisible}
          onDismiss={() => setCategoryMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setCategoryMenuVisible(true)} style={styles.picker}>
              {selectedCategory?.label ?? 'Select category'}
            </Button>
          }
        >
          {categories.map((cat) => (
            <Menu.Item
              key={cat.id}
              title={cat.label}
              onPress={() => {
                setSelectedCategoryId(cat.id);
                setSelectedCategorySlug(cat.slug);
                setCategoryMenuVisible(false);
              }}
            />
          ))}
        </Menu>

        {/* Card picker */}
        <Text variant="labelLarge" style={styles.pickerLabel}>Card</Text>
        <Menu
          visible={cardMenuVisible}
          onDismiss={() => setCardMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setCardMenuVisible(true)} style={styles.picker}>
              {selectedCard ? (selectedCard.nickname ?? selectedCard.card.name) : 'Select card'}
            </Button>
          }
        >
          {myCards.map((uc) => (
            <Menu.Item
              key={uc.cardId}
              title={uc.nickname ?? uc.card.name}
              onPress={() => {
                setSelectedCardId(uc.cardId);
                setCardMenuVisible(false);
              }}
            />
          ))}
        </Menu>

        {/* Miles Preview */}
        {selectedCardRec && amount && (
          <View style={styles.milesPreview}>
            <Text variant="labelLarge" style={styles.previewLabel}>Miles Preview</Text>
            <Text variant="displaySmall" style={styles.milesNum}>
              {formatMiles(selectedCardRec.milesEarned ?? 0)}
            </Text>
            <Text variant="bodySmall" style={styles.previewSub}>
              {formatMpd(selectedCardRec.effectiveRate)} effective rate
            </Text>
            {selectedCardRec.cappedWarning && (
              <Text variant="bodySmall" style={styles.warning}>Partial cap — some spend at base rate</Text>
            )}
            {selectedCardRec.capsExhausted && (
              <Text variant="bodySmall" style={styles.warning}>Monthly cap reached</Text>
            )}
          </View>
        )}

        {/* Merchant */}
        <Controller
          control={control}
          name="merchant"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Merchant (optional)"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />

        {/* Notes */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Notes (optional)"
              value={value}
              onChangeText={onChange}
              style={styles.input}
              multiline
            />
          )}
        />

        {serverError ? <HelperText type="error" visible>{serverError}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting || mutation.isPending}
          disabled={!selectedCategoryId || !selectedCardId}
          style={styles.submitBtn}
        >
          Log Transaction
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16 },
  input: { marginBottom: 4 },
  pickerLabel: { marginTop: 12, marginBottom: 4, opacity: 0.6 },
  picker: { marginBottom: 8 },
  milesPreview: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  previewLabel: { opacity: 0.6, marginBottom: 4 },
  milesNum: { fontWeight: '700', color: '#1a7f3c' },
  previewSub: { opacity: 0.6, marginTop: 4 },
  warning: { color: '#e65100', marginTop: 4 },
  submitBtn: { marginTop: 24 },
});
