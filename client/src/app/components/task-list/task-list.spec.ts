
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError }            from 'rxjs';
import { By }                        from '@angular/platform-browser';
import { NoopAnimationsModule }      from '@angular/platform-browser/animations';
import { Router, RouterModule }      from '@angular/router';

import { TaskList }      from './task-list';
import { TaskService, Task } from '../../services/task.service';
import { AuthService }   from '../../services/auth.service';

describe('TaskList', () => {
  let fixture: ComponentFixture<TaskList>;
  let component: TaskList;
  let router: Router;

  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const TASKS: Task[] = [
    { id: 1, title: 'A', description: 'descA', due_date: '2025-07-30', status: 'pending' },
    { id: 2, title: 'B', description: 'descB', due_date: '2025-08-05', status: 'completed' }
  ];

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj('TaskService', ['getTasks','delete']);
    mockTaskService.getTasks.and.returnValue(of([]));
    mockAuthService = jasmine.createSpyObj('AuthService',['logout']);

    await TestBed.configureTestingModule({
      imports: [
        TaskList,
        NoopAnimationsModule,
        RouterModule.forRoot([]),      // <-- brings in Router + ActivatedRoute + routerLink
      ],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: AuthService, useValue: mockAuthService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskList);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(router, 'navigateByUrl');

      fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init (success)', () => {
    mockTaskService.getTasks.and.returnValue(of(TASKS));

    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.tasks).toEqual(TASKS);
    expect(component.error).toBeNull();
  });

  it('should set error on loadTasks failure', () => {
    mockTaskService.getTasks.and.returnValue(throwError(() => new Error('fail')));

    component.loadTasks();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Failed to load tasks.');
  });

  it('should navigate to edit on goToEdit()', () => {
    const task = TASKS[0];
    component.goToEdit(task);
    expect(router.navigate).toHaveBeenCalledWith(['/tasks', task.id]);
  });

  it('should delete a task successfully', () => {
    component.tasks = [...TASKS];
    mockTaskService.delete.and.returnValue(of({}));

    component.deleteTask(TASKS[0]);

    expect(component.tasks.length).toBe(1);
    expect(component.tasks.find(t => t.id === TASKS[0].id)).toBeUndefined();
    expect(component.error).toBeNull();
  });

  it('should set error on deleteTask failure', () => {
    component.tasks = [...TASKS];
    mockTaskService.delete.and.returnValue(throwError(() => new Error('oops')));

    component.deleteTask(TASKS[0]);

    expect(component.error).toBe('Failed to delete task.');
    expect(component.tasks.length).toBe(2);
  });

  it('should logout and navigate to login', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  describe('template', () => {
    it('shows a spinner while loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.spinner'));
      expect(spinner).toBeTruthy();
    });

    it('renders a list of tasks when loaded', () => {
      component.loading = false;
      component.tasks = [...TASKS];
      fixture.detectChanges();

      const cards = fixture.debugElement.queryAll(By.css('.task-card'));
      expect(cards.length).toBe(2);
      expect(cards[0].nativeElement.textContent).toContain('A');
      expect(cards[1].nativeElement.textContent).toContain('B');
    });

    it('displays "no tasks" message when empty', () => {
      component.loading = false;
      component.tasks = [];
      fixture.detectChanges();

      const noTasks = fixture.debugElement.query(By.css('.no-tasks'));
      expect(noTasks).toBeTruthy();
      expect(noTasks.nativeElement.textContent).toContain('You have no tasks yet.');
    });
  });
});
