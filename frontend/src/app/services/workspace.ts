import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace } from '../models/workspace.model';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private apiUrl = `${environment.apiUrl}/workspaces`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.apiUrl, {
      withCredentials: true
    });
  }

  getById(id: number | string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  create(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Observable<any> {
    return this.http.post(`${this.apiUrl}`, workspace, {
      withCredentials: true
    });
  }

  update(id: number | string, workspace: Partial<Workspace>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, workspace, {
      withCredentials: true
    });
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  addMember(workspaceId: number | string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${workspaceId}/members`, { userId : Number(userId) }, {
      withCredentials: true
    });
  }

  removeMember(workspaceId: number | string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${workspaceId}/members/${userId}`, {
      withCredentials: true
    });
  }

  getWorkspaceTasks(workspaceId: number | string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${workspaceId}/tasks`, {
      withCredentials: true
    });
  }
}
