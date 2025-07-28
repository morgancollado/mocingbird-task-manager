// task-form.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError }           from 'rxjs';
import { ReactiveFormsModule }      from '@angular/forms';
import { ActivatedRoute, Router }   from '@angular/router';
import { NoopAnimationsModule }     from '@angular/platform-browser/animations';

import { MatCardModule }        from '@angular/material/card';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatSelectModule }      from '@angular/material/select';
import { MatButtonModule }      from '@angular/material/button';
import { MatDatepickerModule }  from '@angular/material/datepicker';
import { MatNativeDateModule }  from '@angular/material/core';

import { TaskForm }        from './task-form';
import { TaskService, Task } from '../../services/task.service';

describe('TaskForm', () => {
  let fixture: ComponentFixture<TaskForm>;
  let component: TaskForm;

  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: { snapshot: { paramMap: { get: jasmine.Spy } } };

  // a dummy Task that satisfies the interface
  const DUMMY_TASK: Task = {
    id:          1,
    title:       '',
    description: '',
    due_date:    '',
    status:      'pending'
  };

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj('TaskService', [
      'getTask',
      'create',
      'update'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        TaskForm,             // standalone component pulls in RouterModule
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      providers: [
        { provide: TaskService,    useValue: mockTaskService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router,         useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.value).toEqual({
      title:       '',
      description: '',
      due_date:    '',
      status:      'pending'
    });
  });

  describe('ngOnInit()', () => {
    it('stays in create mode if no id in route', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
      component.ngOnInit();
      expect(component.isEdit).toBeFalse();
      expect(mockTaskService.getTask).not.toHaveBeenCalled();
    });

    it('loads task and patches form when id present', () => {
      const fake: Task = {
        id:          123,
        title:       'T',
        description: 'D',
        due_date:    '2025-07-28T00:00:00Z',
        status:      'completed'
      };
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
      mockTaskService.getTask.and.returnValue(of(fake));

      component.ngOnInit();

      expect(component.isEdit).toBeTrue();
      expect(mockTaskService.getTask).toHaveBeenCalledWith(123);
      expect(component.form.value).toEqual({
        title:       'T',
        description: 'D',
        due_date:    '2025-07-28',
        status:      'completed'
      });
    });

    it('sets errorMsg on getTask failure', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('42');
      mockTaskService.getTask.and.returnValue(
        throwError(() => new Error('fail'))
      );

      component.ngOnInit();
      expect(component.errorMsg).toBe('Failed to load task.');
    });
  });

  describe('onSubmit()', () => {
    beforeEach(() => {
      component.errorMsg = '';
    });

    it('shows error when form invalid', () => {
      component.form.controls['title'].setValue('');
      component.onSubmit();
      expect(component.errorMsg).toBe(
        'Please fill in the required fields.'
      );
      expect(mockTaskService.create).not.toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });

    it('calls create() and navigates on success', () => {
      component.isEdit = false;
      component.form.setValue({
        title:       'New',
        description: '',
        due_date:    '',
        status:      'pending'
      });
      mockTaskService.create.and.returnValue(of(DUMMY_TASK));

      component.onSubmit();

      expect(mockTaskService.create).toHaveBeenCalledWith({
        title:       'New',
        description: '',
        due_date:    '',
        status:      'pending'
      });
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/tasks');
    });

    it('shows error on create() failure', () => {
      component.isEdit = false;
      component.form.setValue({
        title:       'New',
        description: '',
        due_date:    '',
        status:      'pending'
      });
      mockTaskService.create.and.returnValue(
        throwError(() => new Error('error'))
      );

      component.onSubmit();
      expect(component.errorMsg).toBe(
        'Could not save task. Try again.'
      );
    });

    it('calls update() and navigates on success', () => {
      component.isEdit = true;
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('77');
      component.form.setValue({
        title:       'Edit',
        description: 'D',
        due_date:    '2025-08-01',
        status:      'in_progress'
      });
      mockTaskService.update.and.returnValue(of(DUMMY_TASK));

      component.onSubmit();

      expect(mockTaskService.update).toHaveBeenCalledWith(77, {
        title:       'Edit',
        description: 'D',
        due_date:    '2025-08-01',
        status:      'in_progress'
      });
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/tasks');
    });

    it('shows error on update() failure', () => {
      component.isEdit = true;
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('77');
      component.form.setValue({
        title:       'Edit',
        description: 'D',
        due_date:    '2025-08-01',
        status:      'in_progress'
      });
      mockTaskService.update.and.returnValue(
        throwError(() => new Error('oops'))
      );

      component.onSubmit();
      expect(component.errorMsg).toBe(
        'Could not save task. Try again.'
      );
    });
  });

  describe('onCancel()', () => {
    it('navigates back to /tasks', () => {
      component.onCancel();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/tasks');
    });
  });
});
