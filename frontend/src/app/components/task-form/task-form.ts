import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Task as TaskService } from '../../services/task';
import { Task } from '../../models/task.model';

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

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
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
      assignedTo: ['']
    });
  }

  loadTask(id: number): void {
    this.isLoading.set(true);
    // TODO: Implement task loading from service
    // this.taskService.getTaskById(id).subscribe({
    //   next: (task) => {
    //     this.taskForm.patchValue({
    //       title: task.title,
    //       description: task.description,
    //       status: task.status,
    //       priority: task.priority,
    //       dueDate: this.formatDateForInput(task.dueDate),
    //       assignedTo: task.assignedTo?.id
    //     });
    //     this.isLoading.set(false);
    //   },
    //   error: (error) => {
    //     this.errorMessage.set('Failed to load task');
    //     this.isLoading.set(false);
    //   }
    // });
    this.isLoading.set(false);
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

    if (this.isEditMode() && this.taskId) {
      // Update task
      // TODO: Implement update
      console.log('Updating task:', this.taskId, formData);
      this.isSaving.set(false);
      this.successMessage.set('Task updated successfully!');
      setTimeout(() => this.router.navigate(['/tasks']), 1500);
    } else {
      // Create new task
      // TODO: Implement create
      console.log('Creating task:', formData);
      this.isSaving.set(false);
      this.successMessage.set('Task created successfully!');
      setTimeout(() => this.router.navigate(['/tasks']), 1500);
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
