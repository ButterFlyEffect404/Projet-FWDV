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
    path: 'tasks',
    loadComponent: () => import('./components/task-list/task-list').then(m => m.TaskList),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];