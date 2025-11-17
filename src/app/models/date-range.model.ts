export interface DateRange {
  startMonth: string;
  endMonth: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  values: { [monthKey: string]: number };
  isEditable?: boolean;
}

export interface MonthInfo {
  key: string;
  name: string;
  fullName: string;
  year: number;
  index: number;
}

export interface BudgetState {
  dateRange: DateRange;
  incomeCategories: BudgetCategory[];
  expenseCategories: BudgetCategory[];
  openingBalance: number;
}
