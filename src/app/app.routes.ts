import { Routes } from '@angular/router';
import { TestComponent } from './shared/ui/test/test.component';
import { BudgetTableComponent } from './components/budget-table/budget-table.component';

// export const routes: Routes = [
//   {
//     path: 'test',
//     component: TestComponent,
//   },
// ];

export const routes: Routes = [
    {
      path: '',
      component: BudgetTableComponent,
    },
    {
      path: 'test',
      component: TestComponent,
    },
    {
      path: '**',
      redirectTo: ''
    }
  ];
