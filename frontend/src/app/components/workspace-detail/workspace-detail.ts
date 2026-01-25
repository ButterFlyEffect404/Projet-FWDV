import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace';
import { Workspace } from '../../models/workspace.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workspace-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace-detail.html',
  styleUrl: './workspace-detail.css',
})
export class WorkspaceDetail {
  workspace = signal<Workspace | null>(null);
  isLoading = false;
  isEditing = false;
  errorMessage = '';
  editForm = signal({
    name: '',
    description: ''
  });

  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.loadWorkspace();
  }

  loadWorkspace(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workspaceService.getById(id).subscribe({
        next: (data) => {
            console.log('Workspace data loaded:', data);
          this.workspace.set(data);
          this.editForm.set({
            name: data.name,
            description: data.description
          });
        },
        error: (error) => {
          this.errorMessage = 'Failed to load workspace';
          console.error('Error loading workspace:', error);
        }
      });
        this.isLoading = false;

    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      const ws = this.workspace();
      if (ws) {
        this.editForm.set({
          name: ws.name,
          description: ws.description
        });
      }
    }
  }

  saveChanges(): void {
    const ws = this.workspace();
    if (ws) {
      this.workspaceService.update(ws.id, this.editForm()).subscribe({
        next: () => {
          this.loadWorkspace();
          this.isEditing = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to update workspace';
          console.error('Error updating workspace:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/workspaces']);
  }

  addTask(): void {
    const ws = this.workspace();
    if (ws) {
      this.router.navigate(['/task/new'], { 
        queryParams: { workspaceId: ws.id } 
      });
    }
  }

  deleteWorkspace(): void {
    const ws = this.workspace();
    if (ws && confirm('Are you sure you want to delete this workspace?')) {
      this.workspaceService.delete(ws.id).subscribe({
        next: () => {
          this.router.navigate(['/workspaces']);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete workspace';
          console.error('Error deleting workspace:', error);
        }
      });
    }
  }

  removeMember(userId: string): void {
    const ws = this.workspace();
    if (ws) {
      this.workspaceService.removeMember(ws.id, userId).subscribe({
        next: () => {
          this.loadWorkspace();
        },
        error: (error) => {
          this.errorMessage = 'Failed to remove member';
          console.error('Error removing member:', error);
        }
      });
    }
  }
}
