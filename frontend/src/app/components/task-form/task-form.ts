import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, CreateTaskDto, UpdateTaskDto } from '../../services/task';
import { WorkspaceService } from '../../services/workspace';
import { UserService } from '../../services/user';
import { Task } from '../../models/task.model';
import { Workspace } from '../../models/workspace.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm implements OnInit {
  taskForm!: FormGroup;
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isEditMode = signal<boolean>(false);
  taskId: number | null = null;
  
  // Dropdown data
  workspaces = signal<Workspace[]>([]);
  users = signal<User[]>([]);
  preselectedWorkspaceId: number | string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Load workspaces and users for dropdowns
    this.loadWorkspaces();
    this.loadUsers();
    
    // Check for preselected workspace from query params
    this.route.queryParams.subscribe((params) => {
      const wid = params['workspaceId'];
      if (wid != null && wid !== '') {
        this.preselectedWorkspaceId = wid;
        const num = Number(wid);
        this.taskForm.patchValue({ workspaceId: isNaN(num) ? wid : num });
      }
    });
    
    // Check if editing existing task
    this.route.params.subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode.set(true);
        this.taskId = Number(params['id']);
        this.loadTask(this.taskId);
      } else {
        this.isEditMode.set(false);
        this.taskId = null;
      }
    });
  }

  initializeForm(): void {
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['TODO', Validators.required],
      priority: ['MEDIUM', Validators.required],
      dueDate: ['', Validators.required],
      workspaceId: ['', Validators.required],
      assignedToId: ['']
    });
  }

  loadWorkspaces(): void {
    this.workspaceService.getAll().subscribe({
      next: (data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
        const arr = Array.isArray(list) ? list : [];
        setTimeout(() => this.workspaces.set(arr), 0);
      },
      error: (error: unknown) => {
        console.error('Error loading workspaces:', error);
        setTimeout(() => this.workspaces.set([]), 0);
      },
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
        const arr = Array.isArray(list) ? list : [];
        setTimeout(() => this.users.set(arr), 0);
      },
      error: (error: unknown) => {
        console.error('Error loading users:', error);
        setTimeout(() => this.users.set([]), 0);
      },
    });
  }

  loadTask(id: number): void {
    this.isLoading.set(true);
    this.taskService.getById(id).subscribe({
      next: (task: Task) => {
        const workspaceId = task.workspaceId ?? task.workspace?.id;
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: this.formatDateForInput(task.dueDate),
          workspaceId: workspaceId ?? '',
          assignedToId: task.assignedTo?.id ?? '',
        });
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set('Failed to load task');
        this.isLoading.set(false);
        console.error('Error loading task:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.errorMessage.set('Please fill in all required fields correctly');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formData = this.taskForm.value;
    const workspaceId = Number(formData.workspaceId);
    const assignedToId = formData.assignedToId ? Number(formData.assignedToId) : undefined;

    if (this.isEditMode() && this.taskId) {
      const updateData: UpdateTaskDto = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        workspaceId: isNaN(workspaceId) ? undefined : workspaceId,
        assignedToId: assignedToId ?? null,
      };
      this.taskService.update(this.taskId, updateData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set('Task updated successfully!');
          setTimeout(() => this.router.navigate(['/tasks']), 1500);
        },
        error: (error: any) => {
          this.isSaving.set(false);
          this.errorMessage.set('Failed to update task');
          console.error('Error updating task:', error);
        },
      });
    } else {
      const createData: CreateTaskDto = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        workspaceId: isNaN(workspaceId) ? 0 : workspaceId,
        assignedToId,
      };
      this.taskService.create(createData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set('Task created successfully!');
          setTimeout(() => this.router.navigate(['/tasks']), 1500);
        },
        error: (error: any) => {
          this.isSaving.set(false);
          this.errorMessage.set('Failed to create task');
          console.error('Error creating task:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  resetForm(): void {
    this.taskForm.reset({ status: 'TODO', priority: 'MEDIUM' });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  get title() {
    return this.taskForm.get('title');
  }

  get description() {
    return this.taskForm.get('description');
  }

  get status() {
    return this.taskForm.get('status');
  }

  get priority() {
    return this.taskForm.get('priority');
  }

  get dueDate() {
    return this.taskForm.get('dueDate');
  }
}
