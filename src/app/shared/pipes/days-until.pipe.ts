import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({ name: 'daysUntil', standalone: true })
export class DaysUntilPipe implements PipeTransform {
  transform(date: string): string {
    const days = dayjs(date).diff(dayjs(), 'day');
    if (days < 0) return `Vencido hace ${Math.abs(days)} días`;
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence mañana';
    return `${days} días`;
  }
}
