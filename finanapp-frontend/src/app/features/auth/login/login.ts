import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModel } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals para manejar el estado de la vista
  cargando = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  // Formulario con validaciones básicas
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['registrado'] === 'true') {
        this.mensajeExito.set('¡Cuenta creada exitosamente! Ingresa tu contraseña para comenzar.');
        const emailGuardado = localStorage.getItem('usuarioNuevoEmail');
        if (emailGuardado) {
          this.loginForm.patchValue({ email: emailGuardado });
          localStorage.removeItem('usuarioNuevoEmail');
        }
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.mensajeExito.set(null);

    const credenciales: AuthModel = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    };

    this.authService.login(credenciales).subscribe({
      next: () => {
        this.cargando.set(false);
        // Redirige al dashboard cuando esté listo
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 401 || err.status === 400) {
          this.errorMensaje.set('Correo o contraseña incorrectos.');
        } else {
          this.errorMensaje.set('No se pudo conectar con el servidor. Inténtalo más tarde.');
        }
      }
    });
  }
}
