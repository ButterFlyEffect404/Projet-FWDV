import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task';
import { UserService } from '../../services/user';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatStatusPipe } from '../../pipes/format-status.pipe';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, FormsModule, FormatStatusPipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  errorMessage = '';
  isLoading = false;
  returnUrl = '/tasks';
  tasks = signal<Task[]>([]);
  filteredTasks = signal<Task[]>([]);
  users = signal<User[]>([]);
  filterStatus = signal<string>('ALL');
  filterPriority = signal<string>('ALL');
  searchQuery = signal<string>('');
  sortBy = signal<string>('dueDate');
  showDoneTasks = signal<boolean>(false);

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tasks';
    this.loadTasks();
    this.loadUsers();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAll().subscribe({
      next: (data: unknown) => {
        const list = Array.isArray(data) ? data : [];
        this.tasks.set(list);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: unknown) => {
        this.errorMessage = 'Failed to load tasks';
        console.error('Error loading tasks:', error);
        this.tasks.set([]);
        this.applyFilters();
        this.isLoading = false;
      },
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users.set(data);
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
  }

  applyFilters(): void {
    const raw = this.tasks();
    const list = Array.isArray(raw) ? raw : [];
    let filtered = [...list];

    // Hide done tasks if toggle is off
    if (!this.showDoneTasks()) {
      filtered = filtered.filter(t => t.status !== 'DONE');
    }

    // Filter by status
    if (this.filterStatus() !== 'ALL') {
      filtered = filtered.filter(t => t.status === this.filterStatus());
    }

    // Filter by priority
    if (this.filterPriority() !== 'ALL') {
      filtered = filtered.filter(t => t.priority === this.filterPriority());
    }

    // Search by title and description
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy()) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    this.filteredTasks.set(filtered);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy);
    this.applyFilters();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'TODO':
        return '#f59e0b';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'DONE':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f97316';
      case 'low':
        return '#84cc16';
      default:
        return '#6b7280';
    }
  }

  viewTask(taskId: number): void {
    this.router.navigate(['/task', taskId]);
  }

  editTask(taskId: number): void {
    this.router.navigate(['/task', taskId, 'edit']);
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.delete(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.errorMessage = 'Failed to delete task';
        }
      });
    }
  }

  getUserName(userId: number | string): string {
    if (!userId) return 'Unassigned';
    const user = this.users().find(u => u.id.toString() === userId.toString());
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  }

  addNewTask(): void {
    this.router.navigate(['/task', 'new']);
  }

  toggleDoneTasks(): void {
    this.showDoneTasks.set(!this.showDoneTasks());
    this.applyFilters();
  }
}
