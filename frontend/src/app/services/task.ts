/**
 * Task Service - Handles task-related operations in the frontend
 * 
 * Features:
 * - CRUD operations for tasks
 * - Filter tasks by workspace, status, priority
 * - Assign tasks to users
 */
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

export interface CreateTaskDto {
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  workspaceId: string;
  assignedToId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;
  
  // Signal to store tasks for reactive updates
  tasks = signal<Task[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Get all tasks with optional filters
   * 
   * Endpoint: GET /tasks
   * @param filters - Optional filters (workspaceId, status, priority, assignedToId)
   * @returns Observable with array of tasks
   */
  getAll(filters?: {
    workspaceId?: string;
    status?: string;
    priority?: string;
    assignedToId?: number;
  }): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.workspaceId) params = params.set('workspaceId', filters.workspaceId);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.assignedToId) params = params.set('assignedToId', filters.assignedToId.toString());
    }

    return this.http.get<Task[]>(this.apiUrl, {
      params,
      withCredentials: true
    }).pipe(
      tap(tasks => this.tasks.set(tasks))
    );
  }

  /**
   * Get a specific task by ID
   * 
   * Endpoint: GET /tasks/:id
   * @param id - Task ID
   * @returns Observable with task data
   */
  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  /**
   * Create a new task
   * 
   * Endpoint: POST /tasks
   * @param task - Task data to create
   * @returns Observable with created task
   */
  create(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task, {
      withCredentials: true
    });
  }

  /**
   * Update an existing task
   * 
   * Endpoint: PATCH /tasks/:id
   * @param id - Task ID to update
   * @param task - Partial task data to update
   * @returns Observable with updated task
   */
  update(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task, {
      withCredentials: true
    });
  }

  /**
   * Delete a task
   * 
   * Endpoint: DELETE /tasks/:id
   * @param id - Task ID to delete
   * @returns Observable with deletion result
   */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
