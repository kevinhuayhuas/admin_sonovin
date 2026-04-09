import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideAnimationsAsync()],
    }).compileComponents();
  });

  it('deberia crearse', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deberia tener form con email y password', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
  });

  it('deberia tener form invalido inicialmente', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.form.valid).toBe(false);
  });

  it('deberia validar email requerido', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const email = fixture.componentInstance.form.get('email')!;
    email.setValue('');
    expect(email.hasError('required')).toBe(true);
  });

  it('deberia validar formato de email', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const email = fixture.componentInstance.form.get('email')!;
    email.setValue('noesunmail');
    expect(email.hasError('email')).toBe(true);
    email.setValue('correo@valido.com');
    expect(email.valid).toBe(true);
  });

  it('deberia validar password minimo 6 caracteres', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const pass = fixture.componentInstance.form.get('password')!;
    pass.setValue('123');
    expect(pass.hasError('minlength')).toBe(true);
    pass.setValue('123456');
    expect(pass.valid).toBe(true);
  });

  it('deberia tener loading en false inicialmente', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('deberia tener form valido con datos correctos', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const form = fixture.componentInstance.form;
    form.setValue({ email: 'test@mail.com', password: '123456' });
    expect(form.valid).toBe(true);
  });
});
