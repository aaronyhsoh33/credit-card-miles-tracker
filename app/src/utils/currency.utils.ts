export function formatSGD(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `S$${n.toFixed(2)}`;
}
