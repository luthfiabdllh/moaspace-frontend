import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale });
}

export function prettifyActionLabel(action: string): string {
  return action
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
