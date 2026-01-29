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
  isLoading = false;
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
    this.isLoading = true;
    this.workspaceService.getAll().subscribe({
      next: (data) => {
        this.workspaces.set(data || []);
        this.applySearch();
        
      },
      error: (error) => {
        this.errorMessage = 'Failed to load workspaces';
        console.error('Error loading workspaces:', error);
      }
    });
    this.isLoading = false;
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
      const filtered = this.workspaces().filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query)
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
