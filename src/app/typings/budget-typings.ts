export interface BudgetTableConfig {
  showOpeningBalance?: boolean;
  showClosingBalance?: boolean;
  showTotalColumn?: boolean;
  allowDelete?: boolean;
  allowEdit?: boolean;
}

export interface CategoryEvent {
  categoryId: string;
  monthKey?: string;
  value?: number;
  name?: string;
}
