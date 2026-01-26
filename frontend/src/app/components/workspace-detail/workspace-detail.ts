import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace';
import { UserService } from '../../services/user';
import { Workspace } from '../../models/workspace.model';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
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
  tasks = signal<Task[]>([]);
  allUsers = signal<User[]>([]);
  isLoading = false;
  isLoadingTasks = false;
  isEditing = false;
  showAddMemberModal = false;
  errorMessage = '';
  editForm = signal({
    name: '',
    description: ''
  });

  constructor(
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.loadWorkspace();
    this.loadAllUsers();
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
          // Load tasks for this workspace
          this.loadWorkspaceTasks(id);
        },
        error: (error) => {
          this.errorMessage = 'Failed to load workspace';
          console.error('Error loading workspace:', error);
        }
      });
      this.isLoading = false;
    }
  }

  loadWorkspaceTasks(workspaceId: string): void {
    this.isLoadingTasks = true;
    this.workspaceService.getWorkspaceTasks(workspaceId).subscribe({
      next: (data: Task[]) => {
        this.tasks.set(data);
        this.isLoadingTasks = false;
      },
      error: (error: any) => {
        console.error('Error loading tasks:', error);
        this.isLoadingTasks = false;
      }
    });
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.allUsers.set(data);
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
  }

  // Computed getters for filtered user lists
  get memberUsers(): User[] {
    const ws = this.workspace();
    if (!ws) return [];
    return this.allUsers().filter(user => ws.members.includes(user.id.toString()));
  }

  get availableUsers(): User[] {
    const ws = this.workspace();
    if (!ws) return [];
    return this.allUsers().filter(user => !ws.members.includes(user.id.toString()));
  }

  // Helper method to get user name by ID
  getUserName(userId: number | string): string {
    const user = this.allUsers().find(u => u.id.toString() === userId.toString());
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  }

  openAddMemberModal(): void {
    this.showAddMemberModal = true;
  }

  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
  }

  addMemberToWorkspace(userId: number): void {
    const ws = this.workspace();
    if (ws) {
      this.workspaceService.addMember(ws.id, userId.toString()).subscribe({
        next: () => {
          this.loadWorkspace();
          this.closeAddMemberModal();
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to add member';
          console.error('Error adding member:', error);
        }
      });
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
