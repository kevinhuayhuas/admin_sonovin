import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  it('deberia crearse', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deberia mostrar label "Activo" para ACTIVO', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.estado = 'ACTIVO';
    expect(fixture.componentInstance.label).toBe('Activo');
  });

  it('deberia mostrar label "Por vencer" para POR_VENCER', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.estado = 'POR_VENCER';
    expect(fixture.componentInstance.label).toBe('Por vencer');
  });

  it('deberia mostrar label "Vencido" para VENCIDO', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.estado = 'VENCIDO';
    expect(fixture.componentInstance.label).toBe('Vencido');
  });

  it('deberia mostrar label "Cancelado" para CANCELADO', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.estado = 'CANCELADO';
    expect(fixture.componentInstance.label).toBe('Cancelado');
  });
});
