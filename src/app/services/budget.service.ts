import { Injectable, inject } from '@angular/core';
import { BudgetStore } from '../store/budget.store';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private store = inject(BudgetStore);

  readonly dateRange = this.store.dateRange;
  readonly incomeCategories = this.store.incomeCategories;
  readonly expenseCategories = this.store.expenseCategories;
  readonly openingBalance = this.store.openingBalance;
  readonly months = this.store.months;
  readonly monthlyTotals = this.store.monthlyTotals;

  readonly groupedIncomeCategories = this.store.groupedIncomeCategories;
  readonly groupedExpenseCategories = this.store.groupedExpenseCategories;

  updateDateRange = (range: any) => this.store.updateDateRange(range);
  updateCategoryValue = (id: string, key: string, val: number) =>
    this.store.updateCategoryValue(id, key, val);
  updateCategoryName = (id: string, name: string) =>
    this.store.updateCategoryName(id, name);
  addCategory = (type: 'income' | 'expense') => this.store.addCategory(type);
  deleteCategory = (id: string) => this.store.deleteCategory(id);
  applyToAllMonths = (id: string, key: string) =>
    this.store.applyToAllMonths(id, key);
  updateOpeningBalance = (balance: number) =>
    this.store.updateOpeningBalance(balance);
  clearAllData = () => this.store.clearAll();
  exportData = () => this.store.exportData();
  importData = (file: File) => this.store.importData(file);

  addParentCategory = (type: 'income' | 'expense', name: string) =>
    this.store.addParentCategory(type, name);

  addChildCategory = (parentId: string, type: 'income' | 'expense') =>
    this.store.addChildCategory(parentId, type);
}
