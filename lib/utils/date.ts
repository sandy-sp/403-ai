import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatDateShort(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'PPP p');
}
