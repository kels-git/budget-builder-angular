import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetCategory, MonthInfo } from '../../../models/date-range.model';
import {
  BudgetTableConfig,
  CategoryEvent,
} from '../../../typings/budget-typings';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-custom-budget-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './custom-budget-table.html',
})
export class CustomBudgetTableComponent {
  @Input() months: MonthInfo[] = [];
  @Input() incomeCategories: BudgetCategory[] = [];
  @Input() expenseCategories: BudgetCategory[] = [];
  @Input() openingBalances: { [key: string]: number } = {};
  @Input() closingBalances: { [key: string]: number } = {};
  @Input() incomeTotals: { [key: string]: number } = {};
  @Input() expenseTotals: { [key: string]: number } = {};
  @Input() config: BudgetTableConfig = {
    showOpeningBalance: true,
    showClosingBalance: true,
    showTotalColumn: true,
    allowDelete: true,
    allowEdit: true,
  };
  @Output() parentCategoryAdd = new EventEmitter<'income' | 'expense'>();

  @Output() childCategoryAdd = new EventEmitter<string>();
  @Output() categoryValueChange = new EventEmitter<CategoryEvent>();
  @Output() categoryNameChange = new EventEmitter<CategoryEvent>();
  @Output() categoryDelete = new EventEmitter<string>();
  @Output() categoryAdd = new EventEmitter<'income' | 'expense'>();
  @Output() contextMenuOpen = new EventEmitter<{
    event: MouseEvent;
    categoryId: string;
    monthKey: string;
  }>();

  expandedSections = {
    income: true,
    expenses: true,
  };

  ngOnInit(): void {
    [...this.incomeCategories, ...this.expenseCategories]
      .filter((c) => c.isParent)
      .forEach((parent) => this.expandedCategories.add(parent.id));
  }

  toggleSection(section: 'income' | 'expenses'): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  onCellValueChange(categoryId: string, monthKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.categoryValueChange.emit({ categoryId, monthKey, value });
  }

  onCategoryNameChange(categoryId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.categoryNameChange.emit({ categoryId, name: input.value });
  }

  onDeleteCategory(categoryId: string): void {
    this.categoryDelete.emit(categoryId);
  }

  onAddCategory(type: 'income' | 'expense'): void {
    this.categoryAdd.emit(type);
  }

  onContextMenu(event: MouseEvent, categoryId: string, monthKey: string): void {
    this.contextMenuOpen.emit({ event, categoryId, monthKey });
  }

  getCategoryValue(category: BudgetCategory, monthKey: string): number {
    return category.values?.[monthKey] || 0;
  }

  getCategoryTotal(category: BudgetCategory): number {
    if (!category?.values) return 0;
    // return Object.values(category.values).reduce((sum: number, val: number) => sum + (val || 0), 0);
    return this.months.reduce((sum, month) => {
      return sum + (category.values[month.key] || 0);
    }, 0);
  }

  getTotalIncome(): number {
    return Object.values(this.incomeTotals).reduce((a, b) => a + b, 0);
  }

  getTotalExpenses(): number {
    return Object.values(this.expenseTotals).reduce((a, b) => a + b, 0);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  trackByCategory(index: number, category: BudgetCategory): string {
    return category.id;
  }

  trackByMonth(index: number, month: MonthInfo): string {
    return month.key;
  }

  @HostListener('document:keydown.control.enter')
  onGlobalAddShortcut(): void {
    this.onAddCategory('income');
  }

  private expandedCategories = new Set<string>();

  toggleCategoryExpand(categoryId: string): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  // getChildCategories(parentId: string): BudgetCategory[] {
  //   return [...this.incomeCategories, ...this.expenseCategories].filter(
  //     (c) => c.parentId === parentId
  //   );
  // }

  getChildCategories(parentId: string): BudgetCategory[] {
    const allCategories = [...this.incomeCategories, ...this.expenseCategories];
    const parent = allCategories.find((c) => c.id === parentId);

    if (!parent) return [];

    const categoriesToSearch =
      parent.type === 'income' ? this.incomeCategories : this.expenseCategories;

    return categoriesToSearch.filter((c) => c.parentId === parentId);
  }

  getParentCategoryTotal(parent: BudgetCategory, monthKey: string): number {
    const children = this.getChildCategories(parent.id);
    return children.reduce(
      (sum, child) => sum + (child.values[monthKey] || 0),
      0
    );
  }

  getParentCategoryGrandTotal(parent: BudgetCategory): number {
    const children = this.getChildCategories(parent.id);
    return children.reduce(
      (sum, child) => sum + this.getCategoryTotal(child),
      0
    );
  }

  onAddChildCategory(parentId: string): void {
    this.childCategoryAdd.emit(parentId);
  }

  getOrganizedCategories(type: 'income' | 'expense'): BudgetCategory[] {
    const categories =
      type === 'income' ? this.incomeCategories : this.expenseCategories;
    const parents = categories.filter((cat) => cat.isParent);
    const orphans = categories.filter((cat) => !cat.isParent && !cat.parentId);

    return [...parents, ...orphans];
  }

  onAddCategoryAfter(currentCategoryId: string, event: Event): void {
    event.preventDefault();

    const allCategories = [...this.incomeCategories, ...this.expenseCategories];
    const currentCategory = allCategories.find(
      (c) => c.id === currentCategoryId
    );

    if (!currentCategory) return;

    if (currentCategory.parentId) {
      this.childCategoryAdd.emit(currentCategory.parentId);
    } else {
      this.categoryAdd.emit(currentCategory.type);
    }

    setTimeout(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      lastInput?.focus();
    }, 100);
  }

  onAddParentCategory(type: 'income' | 'expense'): void {
    this.parentCategoryAdd.emit(type);

    setTimeout(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      lastInput?.focus();
      lastInput?.select();
    }, 100);
  }
}
