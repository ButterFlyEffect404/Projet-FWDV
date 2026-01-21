import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task as TaskService } from '../../services/task';
import { Task } from '../../models/task.model';
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
  filterStatus = signal<string>('ALL');
  filterPriority = signal<string>('ALL');
  searchQuery = signal<string>('');
  sortBy = signal<string>('dueDate');

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tasks';
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAll().subscribe({
      next: (data) => {
        this.tasks.set(data || []);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load tasks';
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.tasks()];

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
      // TODO: Implement delete functionality
      console.log('Delete task:', taskId);
    }
  }

  addNewTask(): void {
    this.router.navigate(['/task', 'new']);
  }
}
