import { Component, inject, OnInit } from '@angular/core';
import { CommonModule }               from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { MatCardModule }      from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule }      from '@angular/material/datepicker';
import { MatNativeDateModule }      from '@angular/material/core';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatButtonModule }    from '@angular/material/button';

import { TaskService, Task }  from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.scss'],
})
export class TaskForm implements OnInit {
  private fb          = inject(FormBuilder);
  private taskService = inject(TaskService);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);

  form: FormGroup;
  isEdit = false;
  errorMsg = '';

  constructor() {
    // initialize all controls; will patch when editing
    this.form = this.fb.group({
      title:            ['', Validators.required],
      description:      [''],
      due_date:         [''],               // yyyy-MM-dd from <input type="date">
      status:           ['pending', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.taskService.getTask(+id).subscribe({
        next: (t: Task) => {
          // patch form; due_date comes as ISO, slice to yyyy-MM-dd
          this.form.patchValue({
            title:       t.title,
            description: t.description,
            due_date:    t.due_date?.slice(0, 10),
            status:      t.status
          });
        },
        error: () => (this.errorMsg = 'Failed to load task.')
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errorMsg = 'Please fill in the required fields.';
      return;
    }

    const payload = this.form.value; // { title, description, due_date, status }
    const request = this.isEdit
      ? this.taskService.update(+this.route.snapshot.paramMap.get('id')!, payload)
      : this.taskService.create(payload);

    request.subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: () => this.errorMsg = 'Could not save task. Try again.'
    });
  }

  onCancel() {
    this.router.navigateByUrl('/tasks');
  }
}
