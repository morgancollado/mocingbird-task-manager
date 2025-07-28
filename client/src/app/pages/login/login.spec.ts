// login.component.spec.ts

import { ComponentFixture, TestBed }         from '@angular/core/testing';
import { of, throwError }                    from 'rxjs';
import { By }                                from '@angular/platform-browser';
import { Router, RouterModule }              from '@angular/router';
import { NoopAnimationsModule }              from '@angular/platform-browser/animations';

import { Login }                             from './login';
import { AuthService }                       from '../../services/auth.service';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        Login,                          // standalone pulls in CommonModule, ReactiveFormsModule, RouterModule, Material...
        NoopAnimationsModule,
        RouterModule.forRoot([])       // provides Router & ActivatedRoute for routerLink
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture  = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    // run ngOnInit and initial data-binding
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty email and password', () => {
    expect(component.form.value).toEqual({ email: '', password: '' });
  });

  it('should not call login if form invalid', () => {
    // leave form empty (invalid)
    component.onSubmit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component.errorMsg).toBe('');
  });

  it('should call login and navigate on success', () => {
    component.form.setValue({ email: 'a@b.com', password: 'secret' });
    mockAuthService.login.and.returnValue(of({}));

    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('a@b.com', 'secret');
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should set errorMsg on login failure', () => {
    component.form.setValue({ email: 'a@b.com', password: 'secret' });
    mockAuthService.login.and.returnValue(
      throwError(() => new Error('invalid'))
    );

    component.onSubmit();

    expect(component.errorMsg).toBe('Invalid email or password');
  });

  describe('template validation and links', () => {
    it('shows "Email is required" error', () => {
      const ctrl = component.form.controls['email'];
      ctrl.markAsTouched();
      ctrl.setValue('');
      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      expect(
        errors.some(e =>
          e.nativeElement.textContent.includes('Email is required')
        )
      ).toBeTrue();
    });

    it('shows "Enter a valid email" error', () => {
      const ctrl = component.form.controls['email'];
      ctrl.markAsTouched();
      ctrl.setValue('not-an-email');
      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      expect(
        errors.some(e =>
          e.nativeElement.textContent.includes('Enter a valid email')
        )
      ).toBeTrue();
    });

    it('shows "Password is required" error', () => {
      const ctrl = component.form.controls['password'];
      ctrl.markAsTouched();
      ctrl.setValue('');
      fixture.detectChanges();

      const errors = fixture.debugElement.queryAll(By.css('mat-error'));
      expect(
        errors.some(e =>
          e.nativeElement.textContent.includes('Password is required')
        )
      ).toBeTrue();
    });

    it('renders errorMsg in template', () => {
      component.errorMsg = 'Invalid email or password';
      fixture.detectChanges();

      const errDiv = fixture.debugElement.query(By.css('.error'));
      expect(errDiv).toBeTruthy();
      expect(errDiv.nativeElement.textContent).toContain(
        'Invalid email or password'
      );
    });

    it('has a "Create an account" button with routerLink to /signup', () => {
      const btn = fixture.debugElement
        .queryAll(By.css('button'))
        .find(d =>
          d.nativeElement.textContent.includes('Create an account')
        )!;
      // Angular reflects routerLink in ng-reflect-router-link
      expect(
        btn.attributes['ng-reflect-router-link'] ||
        btn.attributes['routerLink']
      ).toBe('/signup');
    });
  });
});
