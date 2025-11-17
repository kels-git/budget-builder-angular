import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuData } from '../../models/budget.model';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="data"
      [style.left.px]="data.position.x"
      [style.top.px]="data.position.y"
      class="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]"
    >
      <button
        (click)="onApplyToAll()"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
      >
        <span>📋</span>
        <span>Apply to all months</span>
      </button>
    </div>
  `,
})
export class ContextMenuComponent {
  @Input() data: ContextMenuData | null = null;
  @Output() applyToAll = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onApplyToAll(): void {
    this.applyToAll.emit();
    this.close.emit();
  }
}
