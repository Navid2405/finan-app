import {Component, inject, signal} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {CategoriaService} from '../../core/services/categoria.service';
import {CategoriaModel, CategoriaResponse, ActualizarCategoria} from '../../core/models/categoria.model';
import {TipoTransaccionModel} from '../../core/models/tipo-transaccion.model';

@Component({
  selector: 'app-categorias',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private categoriaService = inject(CategoriaService);


  cargando = signal<boolean>(false);
  errorMensaje = signal<string | null>(null);
  listaCategorias = signal<CategoriaResponse[]>([]);
  filtroActivo = signal<'TODOS'| 'INGRESO'| 'GASTO'>('TODOS');
  modalAbierto = signal<boolean>(false);

  registroCategoriaForm = this.fb.group({
    nombre: ['',[Validators.required, Validators.maxLength(25)]],
    tipo: ['',[TipoTransaccionModel.GASTO, Validators.required]],
    icono:['',[Validators.required]]
  });

  ngOnInit(){
    this.cargar();
  }

  cargar():void{
    this.cargando.set(true);
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data)=> {
        this.listaCategorias.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  cambiarFiltro(nuevoFiltro: 'TODOS'|'INGRESO'|'GASTO'):void{
      this.filtroActivo.set(nuevoFiltro);
  }

  categoriasFiltrar():CategoriaResponse[]{
    const f = this.filtroActivo();
    if (f==='TODOS'){
      return this.listaCategorias();
    }
    return this.listaCategorias().filter(c => c.tipoTransaccion === f);

  }
}
