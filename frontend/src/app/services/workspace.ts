import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Workspace } from '../models/workspace.model';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

export interface WorkspaceListResponse {
  data: Workspace[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private apiUrl = `${environment.apiUrl}/workspaces`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, limit: number = 100): Observable<Workspace[]> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<WorkspaceListResponse | { success?: boolean; data?: Workspace[] | WorkspaceListResponse }>(this.apiUrl, {
        params,
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          const d = res?.data;
          if (Array.isArray(d)) return d;
          if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as WorkspaceListResponse).data)) {
            return (d as WorkspaceListResponse).data;
          }
          return [];
        }),
      );
  }

  getById(id: number | string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  create(workspace: { name: string; description?: string; members?: number[] }): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.apiUrl}`, workspace, {
      withCredentials: true,
    });
  }

  update(id: number | string, workspace: Partial<Pick<Workspace, 'name' | 'description' | 'members'>>): Observable<Workspace> {
    return this.http.patch<Workspace>(`${this.apiUrl}/${id}`, workspace, {
      withCredentials: true,
    });
  }

  delete(id: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  addMember(workspaceId: number | string, userId: number | string): Observable<Workspace> {
    return this.http.post<Workspace>(`${this.apiUrl}/${workspaceId}/members`, { userId: Number(userId) }, {
      withCredentials: true,
    });
  }

  removeMember(workspaceId: number | string, userId: number | string): Observable<Workspace> {
    return this.http.delete<Workspace>(`${this.apiUrl}/${workspaceId}/members/${userId}`, {
      withCredentials: true,
    });
  }

  getWorkspaceTasks(workspaceId: number | string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${workspaceId}/tasks`, {
      withCredentials: true,
    });
  }
}
