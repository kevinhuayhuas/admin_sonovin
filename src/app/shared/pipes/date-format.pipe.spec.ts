import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  const pipe = new DateFormatPipe();

  it('deberia crearse', () => {
    expect(pipe).toBeTruthy();
  });

  it('deberia convertir YYYY-MM-DD a dd/MM/yyyy', () => {
    expect(pipe.transform('2025-06-14')).toBe('14/06/2025');
    expect(pipe.transform('2026-01-01')).toBe('01/01/2026');
    expect(pipe.transform('2024-12-31')).toBe('31/12/2024');
  });

  it('deberia retornar "-" para null o undefined', () => {
    expect(pipe.transform(null)).toBe('-');
    expect(pipe.transform(undefined)).toBe('-');
  });

  it('deberia retornar "-" para string vacio', () => {
    expect(pipe.transform('')).toBe('-');
  });

  it('deberia manejar fechas ISO', () => {
    const result = pipe.transform('2025-06-14T00:00:00.000Z');
    expect(result).toContain('14');
    expect(result).toContain('06');
    expect(result).toContain('2025');
  });
});
