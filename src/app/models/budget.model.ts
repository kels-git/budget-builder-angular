export interface MonthlyTotals {
    income: { [monthKey: string]: number }; 
    expenses: { [monthKey: string]: number };
    netIncome: { [monthKey: string]: number };
    closingBalance: { [monthKey: string]: number };
  }
  
  export interface CellPosition {
    categoryId: string;
    monthKey: string; 
  }
  
  export interface ContextMenuData {
    position: { x: number; y: number };
    cell: CellPosition;
    value: number;
  }