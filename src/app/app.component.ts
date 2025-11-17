import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BudgetTableComponent } from './components/budget-table/budget-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BudgetTableComponent],
  template: ` <app-budget-table></app-budget-table> `,
})
export class AppComponent {
  title = 'budget-builder';
}
