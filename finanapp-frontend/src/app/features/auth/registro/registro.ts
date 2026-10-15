import { Component, inject, signal} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModel } from '../../../core/models/auth.model';
import {UsuarioModel} from '../../../core/models/usuario.model';
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);

  registroForm= this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      telefono: ['',[Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      email: ['',[Validators.required, Validators.email]],
      password: ['',[Validators.required, Validators.minLength(8)]],
      confirPassword: ['',[Validators.required]],
      ocupacion: ['',[Validators.required]]
    },{
      validators: this.matchValidator('password', 'confirPassword')
    }
  );

  matchValidator(controlName: string, matchingControlName: string) {
    return (abstractControl: AbstractControl): ValidationErrors | null => {
      const control = abstractControl.get(controlName);
      const matchingControl = abstractControl.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ noCoinciden: true });
        return { noCoinciden: true };
      } else {
        if (matchingControl.hasError('noCoinciden')) {
          const actualErrors = matchingControl.errors;
          delete actualErrors?.['noCoinciden'];
          matchingControl.setErrors(actualErrors && Object.keys(actualErrors).length > 0 ? actualErrors : null);
        }
        return null;
      }
    };
  }

onSubmit(): void {
    if(this.registroForm.invalid){
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    const usuarioRequest: UsuarioModel = {
      nombre: this.registroForm.value.nombre!,
      telefono: this.registroForm.value.telefono!,
      email: this.registroForm.value.email!,
      password: this.registroForm.value.password!,
      ocupacion: this.registroForm.value.ocupacion!
    };

    this.authService.registro(usuarioRequest).subscribe(
      {
        next:()=>{
          this.cargando.set(false);
          this.router.navigate(['auth/login']);
        },
        error: (err) => {
          this.cargando.set(false);
          if (err.status === 409){
            this.errorMensaje.set(err.error?.mensaje || 'El correo o telefono ya estan en uso.');
          }else if (err.status=== 400){
            if (err.error?.detalles && err.error.detalles.length > 0){
              this.errorMensaje.set(err.error.detalles.join(','));
            }else{
              this.errorMensaje.set(err.error?.mensaje || 'Revisa los campos del formulario.');
            }
          }else if(err.status ===0){
            this.errorMensaje.set('No se pudo conectar con el servidor');
          }else{
            this.errorMensaje.set('Ocurrio un error inesperado al registrarse');
          }
        }
      }
    )

}


}
