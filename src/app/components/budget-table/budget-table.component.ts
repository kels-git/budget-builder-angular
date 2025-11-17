import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { ContextMenuData } from '../../models/budget.model';
import { DateRangeHeaderComponent } from '../../shared/ui/date-range-header/date-range-header.component';
import { CustomBudgetTableComponent } from '../../shared/ui/custom-budget-table/custom-budget-table';
import { CategoryEvent } from '../../typings/budget-typings';

@Component({
  selector: 'app-budget-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContextMenuComponent,
    DateRangeHeaderComponent,
    CustomBudgetTableComponent,
  ],
  templateUrl: './budget-table.component.html',
})
export class BudgetTableComponent {
  budgetService = inject(BudgetService);

  contextMenuData: ContextMenuData | null = null;

  // @HostListener('document:click')
  // onDocumentClick(): void {
  //   this.contextMenuData = null;
  // }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const contextMenu = document.querySelector('app-context-menu');
    if (contextMenu && !contextMenu.contains(event.target as Node)) {
      this.contextMenuData = null;
    }
  }

  onStartMonthChange(startMonth: string): void {
    const currentRange = this.budgetService.dateRange();
    this.budgetService.updateDateRange({
      startMonth,
      endMonth: currentRange.endMonth,
    });
  }

  onEndMonthChange(endMonth: string): void {
    const currentRange = this.budgetService.dateRange();
    this.budgetService.updateDateRange({
      startMonth: currentRange.startMonth,
      endMonth,
    });
  }

  onCategoryValueChange(event: CategoryEvent): void {
    if (event.monthKey !== undefined && event.value !== undefined) {
      this.budgetService.updateCategoryValue(
        event.categoryId,
        event.monthKey,
        event.value
      );
    }
  }

  onCategoryNameChange(event: CategoryEvent): void {
    if (event.name !== undefined) {
      this.budgetService.updateCategoryName(event.categoryId, event.name);
    }
  }

  onContextMenuOpen(data: {
    event: MouseEvent;
    categoryId: string;
    monthKey: string;
  }): void {
    data.event.preventDefault();

    const allCategories = [
      ...this.budgetService.incomeCategories(),
      ...this.budgetService.expenseCategories(),
    ];
    const category = allCategories.find((c) => c.id === data.categoryId);
    const value = category?.values?.[data.monthKey] || 0;

    this.contextMenuData = {
      position: { x: data.event.clientX, y: data.event.clientY },
      cell: { categoryId: data.categoryId, monthKey: data.monthKey },
      value,
    };
  }

  onApplyToAll(): void {
    if (this.contextMenuData) {
      const { categoryId, monthKey } = this.contextMenuData.cell;
      this.budgetService.applyToAllMonths(categoryId, monthKey);
    }
  }

  addCategory(type: 'income' | 'expense'): void {
    this.budgetService.addCategory(type);
  }

  deleteCategory(categoryId: string): void {
    this.budgetService.deleteCategory(categoryId);
  }

  getOpeningBalancesMap(): { [key: string]: number } {
    const months = this.budgetService.months();
    const totals = this.budgetService.monthlyTotals();
    const openingBalances: { [key: string]: number } = {};

    months.forEach((month, index) => {
      if (index === 0) {
        openingBalances[month.key] = this.budgetService.openingBalance();
      } else {
        const prevMonthKey = months[index - 1].key;
        openingBalances[month.key] = totals.closingBalance[prevMonthKey] || 0;
      }
    });

    return openingBalances;
  }

  onChildCategoryAdd(parentId: string): void {
    const allCategories = [
      ...this.budgetService.incomeCategories(),
      ...this.budgetService.expenseCategories(),
    ];
    const parent = allCategories.find((c) => c.id === parentId);

    if (parent) {
      this.budgetService.addChildCategory(parentId, parent.type);
    }
  }
}
