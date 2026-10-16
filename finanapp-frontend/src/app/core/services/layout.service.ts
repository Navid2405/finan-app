import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  sidebarAbierto = signal<boolean>(false);

  abrir(): void {
    this.sidebarAbierto.set(true);
  }

  cerrar(): void {
    this.sidebarAbierto.set(false);
  }

  toggle(): void {
    this.sidebarAbierto.update((v) => !v);
  }
}
