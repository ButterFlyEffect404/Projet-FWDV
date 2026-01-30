import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace';
import { Workspace } from '../../models/workspace.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workspace-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace-list.html',
  styleUrl: './workspace-list.css',
})
export class WorkspaceList {
  errorMessage = '';
  isLoading = signal(false);
  workspaces = signal<Workspace[]>([]);
  filteredWorkspaces = signal<Workspace[]>([]);
  searchQuery = signal<string>('');

  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {
    this.isLoading.set(true);
    this.errorMessage = '';
    this.workspaceService.getAll().subscribe({
      next: (data: unknown) => {
        try {
          const list = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
          this.workspaces.set(Array.isArray(list) ? list : []);
          this.applySearch();
        } finally {
          this.isLoading.set(false);
        }
      },
      error: (error: unknown) => {
        this.errorMessage = 'Failed to load workspaces';
        console.error('Error loading workspaces:', error);
        this.workspaces.set([]);
        this.applySearch();
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applySearch();
  }

  applySearch(): void {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      this.filteredWorkspaces.set(this.workspaces());
    } else {
      const filtered = this.workspaces().filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          (w.description ?? '').toLowerCase().includes(query),
      );
      this.filteredWorkspaces.set(filtered);
    }
  }

  viewWorkspace(id: number | string): void {
    this.router.navigate(['/workspaces', id]);
  }

  addNewWorkspace(): void {
    this.router.navigate(['/workspaces/new']);
  }

  deleteWorkspace(id: number | string): void {
    if (id === null || id === undefined || (typeof id === 'number' && isNaN(id))) {
      this.errorMessage = 'Invalid workspace id. Please refresh and try again.';
      console.error('Attempted to delete workspace with invalid id:', id);
      return;
    }

    if (confirm('Are you sure you want to delete this workspace?')) {
      this.workspaceService.delete(id).subscribe({
        next: () => {
          this.loadWorkspaces();
        },
        error: (error) => {
          console.error('Error deleting workspace:', error);
          this.errorMessage = 'Failed to delete workspace';
        }
      });
    }
  }
}
