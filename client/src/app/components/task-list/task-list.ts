import { Component, inject, OnInit } from '@angular/core';
import { CommonModule }               from '@angular/common';
import { Router, RouterModule }       from '@angular/router';
import { ReactiveFormsModule }        from '@angular/forms';

import { MatCardModule }              from '@angular/material/card';
import { MatListModule }              from '@angular/material/list';
import { MatButtonModule }            from '@angular/material/button';
import { MatIconModule }              from '@angular/material/icon';
import { MatProgressSpinnerModule }   from '@angular/material/progress-spinner';

import { TaskService, Task }          from '../../services/task.service';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss'],
})
export class TaskList implements OnInit {
  private taskService = inject(TaskService);
  private router      = inject(Router);
  private authService = inject(AuthService);

  tasks: Task[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.error   = null;

    this.taskService.getTasks().subscribe({
      next: (list) => {
        this.tasks = list;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load tasks.';
        this.loading = false;
      }
    });
  }

  goToEdit(task: Task) {
    this.router.navigate(['/tasks', task.id]);
  }

  deleteTask(task: Task) {
    this.taskService.delete(task.id!).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
      },
      error: () => {
        this.error = 'Failed to delete task.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
}}
