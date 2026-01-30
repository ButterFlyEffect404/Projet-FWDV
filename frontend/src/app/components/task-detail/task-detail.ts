import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';
import { UserService } from '../../services/user';
import { WorkspaceService } from '../../services/workspace';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { Workspace } from '../../models/workspace.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail {
  task = signal<Task | null>(null);
  assignedUser = signal<User | null>(null);
  workspace = signal<Workspace | null>(null);
  isLoading = false;
  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loadTask();
  }

  loadTask(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Task ID is required';
      return;
    }

    this.isLoading = true;
    //this.taskService.getById(parseInt(id, 10)).subscribe({
    this.taskService.getById(id).subscribe({
        next: (data) => {
        this.task.set(data);
        this.isLoading = false;
        
        // Load related data
        if (data.assignedTo?.id != null) {
          this.loadAssignedUser(data.assignedTo.id);
        }
        if (data.workspaceId) {
          this.loadWorkspace(data.workspaceId);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load task';
        console.error('Error loading task:', error);
      }
    });
    this.isLoading = false;

  }

  loadAssignedUser(userId: string | number): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const userIdStr = userId?.toString();
        const user = users.find(u => u.id.toString() === userIdStr);
        if (user) {
          this.assignedUser.set(user);
        }
      },
      error: (error) => {
        console.error('Error loading assigned user:', error);
      }
    });
  }

  loadWorkspace(workspaceId: number): void {
    this.workspaceService.getById(workspaceId).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
      },
      error: (error) => {
        console.error('Error loading workspace:', error);
      }
    });
  }

  editTask(): void {
    if (this.task()) {
      this.router.navigate(['/task', this.task()!.id, 'edit']);
    }
  }

  deleteTask(): void {
    if (!this.task()) return;
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.delete(this.task()!.id).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete task';
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  getStatusBadgeClass(status: string): string {
    return `status-badge status-${status.toLowerCase().replace('_', '-')}`;
  }

  getPriorityBadgeClass(priority: string): string {
    return `priority-badge priority-${priority.toLowerCase()}`;
  }

  isDueDatePast(): boolean {
    if (!this.task()) return false;
    return new Date(this.task()!.dueDate) < new Date();
  }

  getDaysUntilDue(): number {
    if (!this.task()) return 0;
    const now = new Date();
    const due = new Date(this.task()!.dueDate);
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getTaskAge(): number {
    if (!this.task()) return 0;
    const now = new Date();
    const created = new Date(this.task()!.createdAt);
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
