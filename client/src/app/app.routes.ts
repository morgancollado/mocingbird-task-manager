// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { Login }    from './pages/login/login';
import { Signup }   from './pages/signup/signup';
import { TaskList } from './components/task-list/task-list';
import { TaskForm } from './components/task-form/task-form';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Redirect root to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public
  { path: 'login',  component: Login },
  { path: 'signup', component: Signup },

  // Protected
  {
    path: 'tasks',
    component: TaskList,
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/new',
    component: TaskForm,
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/:id',
    component: TaskForm,
    canActivate: [AuthGuard]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
