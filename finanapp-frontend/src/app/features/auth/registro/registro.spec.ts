import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Registro } from './registro';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;
  let authService: any;
  let router: Router;

  beforeEach(async () => {
    const authServiceMock = {
      registro: vi.fn().mockReturnValue(of({
        id: 1,
        nombre: 'Usuario Prueba',
        email: 'test@finanapp.com',
        telefono: '3001234567',
        ocupacion: 'Ingeniero',
        activo: true
      }))
    };

    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe registrar y redirigir directamente al login al completar el formulario', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.registroForm.setValue({
      nombre: 'Usuario Prueba',
      telefono: '3001234567',
      email: 'test@finanapp.com',
      password: 'password123',
      confirPassword: 'password123',
      ocupacion: 'Ingeniero'
    });

    component.onSubmit();

    expect(authService.registro).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login'], { queryParams: { registrado: 'true' } });
  });
});
