import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRange } from '../../../models/date-range.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-date-range-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './date-range-header.component.html',
})
export class DateRangeHeaderComponent {
  @Input() title: string = 'Budget Builder';
  @Input() dateRange!: DateRange;
  @Input() monthCount: number = 0;

  @Output() startMonthChange = new EventEmitter<string>();
  @Output() endMonthChange = new EventEmitter<string>();

  @Output() export = new EventEmitter<void>();
  @Output() import = new EventEmitter<File>();
  @Output() clear = new EventEmitter<void>();

  onStartChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.startMonthChange.emit(input.value);
  }

  onEndChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.endMonthChange.emit(input.value);
  }

  onExport(): void {
    this.export.emit();
  }

  onImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.import.emit(file);
      input.value = ''; // Reset input
    }
  }

  onClear(): void {
    this.clear.emit();
  }
}
