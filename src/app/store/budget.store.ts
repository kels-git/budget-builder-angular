import { Injectable, signal, computed, effect } from '@angular/core';
import {
  BudgetCategory,
  BudgetState,
  DateRange,
  MonthInfo,
} from '../models/date-range.model';
import { MonthlyTotals } from '../models/budget.model';
import { DEFAULT_END_MONTH, DEFAULT_START_MONTH, STORAGE_KEY } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class BudgetStore {
  // private openingBalanceSignal = signal<number>(0);

  private loadState(): BudgetState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        console.log('Loaded state from localStorage');
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }

    return {
      dateRange: {
        startMonth: DEFAULT_START_MONTH,
        endMonth: DEFAULT_END_MONTH,
      },
      incomeCategories: [
        { id: '1', name: 'Salary', type: 'income', values: {} },
      ],
      expenseCategories: [
        { id: '2', name: 'Rent', type: 'expense', values: {} },
      ],
      openingBalance: 0,
    };
  }

  private state = signal<BudgetState>(this.loadState());

  readonly dateRange = computed(() => this.state().dateRange);
  readonly incomeCategories = computed(() => this.state().incomeCategories);
  readonly expenseCategories = computed(() => this.state().expenseCategories);
  readonly openingBalance = computed(() => this.state().openingBalance);

  readonly months = computed(() => {
    return this.calculateMonthsInRange(this.state().dateRange);
  });

  readonly monthlyTotals = computed<MonthlyTotals>(() => {
    const state = this.state();

    return this.calculateTotals(
      this.months(),
      state.incomeCategories,
      state.expenseCategories,
      state.openingBalance
    );
  });

  constructor() {
    effect(() => {
      const currentState = this.state();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      console.log('💾 State saved to localStorage');
    });
  }

  updateDateRange(dateRange: DateRange): void {
    this.state.update((state) => ({ ...state, dateRange }));
  }

  updateCategoryValue(
    categoryId: string,
    monthKey: string,
    value: number
  ): void {
    this.state.update((state) => {
      const updateCategories = (categories: BudgetCategory[]) =>
        categories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              values: { ...cat.values, [monthKey]: value },
            };
          }
          return cat;
        });

      return {
        ...state,
        incomeCategories: updateCategories(state.incomeCategories),
        expenseCategories: updateCategories(state.expenseCategories),
      };
    });
  }

  updateCategoryName(categoryId: string, name: string): void {
    this.state.update((state) => {
      const updateName = (categories: BudgetCategory[]) =>
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, name } : cat
        );

      return {
        ...state,
        incomeCategories: updateName(state.incomeCategories),
        expenseCategories: updateName(state.expenseCategories),
      };
    });
  }

  addCategory(type: 'income' | 'expense'): void {
    this.state.update((state) => {
      const newCategory: BudgetCategory = {
        id: Date.now().toString(),
        name: type === 'income' ? 'New Income' : 'New Expense',
        type,
        values: {},
      };

      return type === 'income'
        ? {
            ...state,
            incomeCategories: [...state.incomeCategories, newCategory],
          }
        : {
            ...state,
            expenseCategories: [...state.expenseCategories, newCategory],
          };
    });
  }

  deleteCategory(categoryId: string): void {
    this.state.update((state) => ({
      ...state,
      incomeCategories: state.incomeCategories.filter(
        (c) => c.id !== categoryId
      ),
      expenseCategories: state.expenseCategories.filter(
        (c) => c.id !== categoryId
      ),
    }));
  }

  applyToAllMonths(categoryId: string, monthKey: string): void {
    this.state.update((state) => {
      const months = this.months();
      const applyValue = (categories: BudgetCategory[]) =>
        categories.map((cat) => {
          if (cat.id === categoryId) {
            const value = cat.values[monthKey] || 0;
            const newValues: { [key: string]: number } = {};
            months.forEach((month) => {
              newValues[month.key] = value;
            });
            return { ...cat, values: newValues };
          }
          return cat;
        });

      return {
        ...state,
        incomeCategories: applyValue(state.incomeCategories),
        expenseCategories: applyValue(state.expenseCategories),
      };
    });
  }

  updateOpeningBalance(balance: number): void {
    this.state.update((state) => ({ ...state, openingBalance: balance }));
  }

  clearAll(): void {
    if (confirm('Clear all budget data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      this.state.set(this.loadState());
    }
  }

  exportData(): void {
    const data = JSON.stringify(this.state(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importData(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (this.validateImportedData(data)) {
          this.state.set(data);
          this.showAlert('✅ Import successful!', 'success');
        } else {
          this.showAlert(
            '❌ Invalid file format: missing required fields',
            'error'
          );
        }
      } catch (error) {
        alert('❌ Invalid file format');
      }
    };
    reader.readAsText(file);
  }

  private validateImportedData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      data.dateRange &&
      Array.isArray(data.incomeCategories) &&
      Array.isArray(data.expenseCategories) &&
      typeof data.openingBalance === 'number'
    );
  }

  private showAlert(message: string, type: 'success' | 'error'): void {
    alert(message);
  }

  private calculateMonthsInRange(range: DateRange): MonthInfo[] {
    const [startYear, startMonth] = range.startMonth.split('-').map(Number);
    const [endYear, endMonth] = range.endMonth.split('-').map(Number);

    const months: MonthInfo[] = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const fullMonthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    let currentDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;

      months.push({
        key: monthKey,
        name: monthNames[month],
        fullName: fullMonthNames[month],
        year: year,
        index: month,
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  private calculateTotals(
    months: MonthInfo[],
    income: BudgetCategory[],
    expenses: BudgetCategory[],
    openingBalance: number
  ): MonthlyTotals {
    const incomeTotals: { [monthKey: string]: number } = {};
    const expenseTotals: { [monthKey: string]: number } = {};
    const netIncome: { [monthKey: string]: number } = {};
    const closingBalance: { [monthKey: string]: number } = {};

    // let runningBalance = this.openingBalanceSignal();
    let runningBalance = openingBalance;

    months.forEach((month) => {
      const monthIncome = income.reduce((sum, category) => {
        return sum + (category.values[month.key] || 0);
      }, 0);

      const monthExpenses = expenses.reduce((sum, category) => {
        return sum + (category.values[month.key] || 0);
      }, 0);

      const net = monthIncome - monthExpenses;
      const currentClosingBalance = runningBalance + net;

      incomeTotals[month.key] = monthIncome;
      expenseTotals[month.key] = monthExpenses;
      netIncome[month.key] = net;
      closingBalance[month.key] = currentClosingBalance;

      runningBalance = currentClosingBalance;
    });

    return {
      income: incomeTotals,
      expenses: expenseTotals,
      netIncome,
      closingBalance,
    };
  }
}
