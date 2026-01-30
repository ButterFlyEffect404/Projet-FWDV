import { Routes } from '@angular/router';
import { Login} from './components/login/login';
import { Register} from './components/register/register';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'task',
    children: [
      {
        path: 'new',
        loadComponent: () => import('./components/task-form/task-form').then(m => m.TaskForm),
        //canActivate: [authGuard]
      },
      {
        path: ':id',
        loadComponent: () => import('./components/task-detail/task-detail').then(m => m.TaskDetail),
        //canActivate: [authGuard]
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/task-form/task-form').then(m => m.TaskForm),
        //canActivate: [authGuard]
      }
    ]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task-list/task-list').then(m => m.TaskList),
    //canActivate: [authGuard]
  },
  {
    path: 'workspaces',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/workspace-list/workspace-list').then(m => m.WorkspaceList),
        //canActivate: [authGuard]
      },
      {
        path: 'new',
        loadComponent: () => import('./components/workspace-form/workspace-form').then(m => m.WorkspaceForm),
        //canActivate: [authGuard]
      },
      {
        path: ':id',
        loadComponent: () => import('./components/workspace-detail/workspace-detail').then(m => m.WorkspaceDetail),
        //canActivate: [authGuard]
      },
      // {
      //   path: ':id/edit',
      //   loadComponent: () => import('./components/workspace-form/workspace-form').then(m => m.WorkspaceForm),
      //   //canActivate: [authGuard]
      // }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];