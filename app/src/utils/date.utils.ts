import { format, startOfMonth, endOfMonth } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'd MMM yyyy');
}

export function formatMonthYear(date: Date = new Date()): string {
  return format(date, 'MMMM yyyy');
}

export function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  return {
    from: format(startOfMonth(now), 'yyyy-MM-dd'),
    to: format(endOfMonth(now), 'yyyy-MM-dd'),
  };
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
