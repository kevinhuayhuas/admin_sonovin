import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '-';
    try {
      // Handle YYYY-MM-DD format from backend
      const parts = value.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      // Handle ISO date
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return value;
    }
  }
}
