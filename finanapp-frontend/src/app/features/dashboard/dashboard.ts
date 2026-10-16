import { Component, inject } from '@angular/core';
import { LayoutService } from '../../core/services/layout.service';
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  layoutService = inject(LayoutService);
}
