import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuData } from '../../models/budget.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
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
        <mat-icon class="!w-4 !h-4">content_copy</mat-icon>
        <span>Apply to all months</span>
      </button>
    </div>
  `,
})
export class ContextMenuComponent {
  @Input() data: ContextMenuData | null = null;
  @Output() applyToAll = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onApplyToAll(): void {
    this.applyToAll.emit();
    this.close.emit();
  }
}
