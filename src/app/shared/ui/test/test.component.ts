// test.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

interface FarmVisitSection {
  id: number;
  title: string;
  completed: boolean;
  items?: FarmVisitSection[];
}

interface FarmVisit {
  eventID: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: { name: string; avatar: string; color?: string }[];
  sections: FarmVisitSection[];
  reportSubmitted?: {
    date: string;
    submittedBy: string;
  };
}

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './test.component.html',
})
export class TestComponent implements OnInit {

  farmVisit = signal<FarmVisit | null>(null);
  loading = signal(true);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadTestFarmVisit();
  }

  loadTestFarmVisit(): void {
    // Mock farm visit test data
    setTimeout(() => {
      this.farmVisit.set({
        eventID: 1,
        title: 'LeCattleFarm: Farm Visit',
        date: '10 Nov 2025',
        time: '11:00',
        location: '00359 Masioane St, Phiri, Soweto, 1818, South Africa',
        attendees: [
          { name: 'John Doe', avatar: 'D', color: '#ff6b35' },
          { name: '', avatar: '', color: '#ffc857' },
        ],
        sections: [
          { id: 1, title: 'General Farm Feedback', completed: true },
          {
            id: 2,
            title: 'Asset and Infrastructure Register',
            completed: true,
          },
          {
            id: 3,
            title: 'Commodity Feedback',
            completed: false,
            items: [{ id: 31, title: 'Cattle#574 - Cattle', completed: true }],
          },
        ],
        reportSubmitted: {
          date: 'November 11 2025',
          submittedBy: 'John Doe',
        },
      });
      this.loading.set(false);
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/']); // or previous page
  }

  onSectionClick(section: FarmVisitSection): void {
    console.log('Section clicked:', section);
    // Navigate to section detail or open modal
  }

  openLocation(): void {
    const visit = this.farmVisit();
    if (visit?.location) {
      window.open(
        `https://maps.google.com/?q=${encodeURIComponent(visit.location)}`,
        '_blank'
      );
    }
  }

  editVisit(): void {
    console.log('Edit visit');
  }

  downloadReport(): void {
    console.log('Download report');
  }

  deleteVisit(): void {
    if (confirm('Are you sure you want to delete this visit?')) {
      console.log('Delete visit');
      this.goBack();
    }
  }
}
