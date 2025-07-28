// signup.component.spec.ts

import { ComponentFixture, TestBed }       from '@angular/core/testing';
import { of, throwError }                  from 'rxjs';
import { By }                              from '@angular/platform-browser';
import { Router, RouterModule }            from '@angular/router';
import { NoopAnimationsModule }            from '@angular/platform-browser/animations';

import { Signup }                          from './signup';
import { AuthService }                     from '../../services/auth.service';

describe('Signup', () => {
  let fixture: ComponentFixture<Signup>;
  let component: Signup;
  let router: Router;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['signup']);

    await TestBed.configureTestingModule({
      imports: [
        Signup,
        NoopAnimationsModule,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(Signup);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture.detectChanges();  // run ngOnInit / initial binding
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.value).toEqual({
      first_name:            '',
      last_name:             '',
      email:                 '',
      password:              '',
      password_confirmation: ''
    });
  });

  it('should not call signup if form invalid', () => {
    component.onSubmit();
    expect(mockAuthService.signup).not.toHaveBeenCalled();
    expect(component.errorMsg).toBe('Please correct the errors above.');
  });

  it('should call signup and navigate on success', () => {
    component.form.setValue({
      first_name:            'Jane',
      last_name:             'Doe',
      email:                 'jane@doe.com',
      password:              'abcdef',
      password_confirmation: 'abcdef'
    });
    mockAuthService.signup.and.returnValue(of({}));

    component.onSubmit();

    expect(mockAuthService.signup).toHaveBeenCalledWith({
      first_name:            'Jane',
      last_name:             'Doe',
      email:                 'jane@doe.com',
      password:              'abcdef',
      password_confirmation: 'abcdef'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should set errorMsg on signup failure', () => {
    component.form.setValue({
      first_name:            'Jane',
      last_name:             'Doe',
      email:                 'jane@doe.com',
      password:              'abcdef',
      password_confirmation: 'abcdef'
    });
    mockAuthService.signup.and.returnValue(
      throwError(() => new Error('fail'))
    );

    component.onSubmit();
    expect(component.errorMsg).toBe('Signup failed. Please try again.');
  });

  describe('form‑level validation', () => {
    it('should add a `mismatch` error when passwords differ', () => {
      component.form.controls['password'].setValue('abcdef');
      component.form.controls['password_confirmation'].setValue('abcdeg');
      // trigger the group-level validator
      component.form.updateValueAndValidity();

      expect(component.form.hasError('mismatch')).toBeTrue();
    });
  });

  describe('template validation errors', () => {
    function collectMatErrors(): string[] {
      fixture.detectChanges();
      return fixture.debugElement
        .queryAll(By.css('mat-error'))
        .map(de => de.nativeElement.textContent.trim());
    }

    it('shows "First name is required"', () => {
      const ctrl = component.form.controls['first_name'];
      ctrl.markAsTouched();
      ctrl.setValue('');
      expect(collectMatErrors()).toContain('First name is required');
    });

    it('shows "Last name is required"', () => {
      const ctrl = component.form.controls['last_name'];
      ctrl.markAsTouched();
      ctrl.setValue('');
      expect(collectMatErrors()).toContain('Last name is required');
    });

    it('shows email errors', () => {
      const ctrl = component.form.controls['email'];
      ctrl.markAsTouched();
      ctrl.setValue('');
      let errs = collectMatErrors();
      expect(errs).toContain('Email is required');

      ctrl.setValue('bad-email');
      errs = collectMatErrors();
      expect(errs).toContain('Enter a valid email');
    });

    it('shows password errors', () => {
      const ctrl = component.form.controls['password'];
      ctrl.markAsTouched();
      ctrl.setValue('');
      let errs = collectMatErrors();
      expect(errs).toContain('Password is required');

      ctrl.setValue('123');
      errs = collectMatErrors();
      expect(errs).toContain('Minimum 6 characters');
    });

    it('renders "Back to Login" button with routerLink="/login"', () => {
      fixture.detectChanges();
      const btns = fixture.debugElement.queryAll(By.css('button'));
      const backBtn = btns.find(d =>
        d.nativeElement.textContent.includes('Back to Login')
      )!;
      expect(backBtn).toBeTruthy();
      expect(
        backBtn.attributes['ng-reflect-router-link'] ||
        backBtn.attributes['routerLink']
      ).toBe('/login');
    });
  });
});
