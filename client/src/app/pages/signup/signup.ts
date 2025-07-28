import { Component, inject } from '@angular/core';
import { CommonModule }                         from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup
} from '@angular/forms';
import { Router, RouterModule }                 from '@angular/router';

import { MatCardModule }      from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';

import { AuthService }        from '../../services/auth.service';

interface SignupForm {
  first_name:            string;
  last_name:             string;
  email:                 string;
  password:              string;
  password_confirmation: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './signup.html',
  styleUrls:   ['./signup.scss'],
})
export class Signup {
  private fb     = inject(NonNullableFormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group(
    {
      first_name:            this.fb.control('', Validators.required),
      last_name:             this.fb.control('', Validators.required),
      email:                 this.fb.control('', [Validators.required, Validators.email]),
      password:              this.fb.control('', [Validators.required, Validators.minLength(6)]),
      password_confirmation: this.fb.control('', Validators.required),
    },
    {
      // pass the validator function as a ValidatorFn
      validators: [this.passwordsMatch]
    }
  );

  errorMsg = '';

  /** Proper ValidatorFn signature */
  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const pw    = group.get('password')?.value;
    const pwc   = group.get('password_confirmation')?.value;
    return pw === pwc ? null : { mismatch: true };
  }
onSubmit() {
  if (this.form.invalid) {
    this.errorMsg = 'Please correct the errors above.';
    return;
  }

  // getRawValue() returns the full shape, not Partial<...>
  const payload = this.form.getRawValue() as SignupForm;

  this.auth.signup(payload).subscribe({
    next: ()  => this.router.navigate(['/tasks']),
    error: () => this.errorMsg = 'Signup failed. Please try again.'
  });
}
}
