import { DaysUntilPipe } from './days-until.pipe';
import dayjs from 'dayjs';

describe('DaysUntilPipe', () => {
  const pipe = new DaysUntilPipe();

  it('deberia crearse', () => {
    expect(pipe).toBeTruthy();
  });

  it('deberia mostrar "Vence hoy" para fecha de hoy', () => {
    const today = dayjs().format('YYYY-MM-DD');
    expect(pipe.transform(today)).toBe('Vence hoy');
  });

  it('deberia contener "días" para fechas futuras', () => {
    const future = dayjs().add(15, 'day').format('YYYY-MM-DD');
    const result = pipe.transform(future);
    expect(result).toContain('días');
    expect(result).not.toContain('Vencido');
  });

  it('deberia contener "Vencido" para fechas pasadas', () => {
    const past = dayjs().subtract(10, 'day').format('YYYY-MM-DD');
    const result = pipe.transform(past);
    expect(result).toContain('Vencido');
    expect(result).toContain('días');
  });

  it('deberia mostrar dias para fechas cercanas', () => {
    const near = dayjs().add(5, 'day').format('YYYY-MM-DD');
    const result = pipe.transform(near);
    expect(result).toMatch(/\d+ días|Vence mañana/);
  });
});
