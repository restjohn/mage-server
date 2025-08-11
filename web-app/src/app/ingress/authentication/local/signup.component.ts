import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, AbstractControl, ValidatorFn } from '@angular/forms';
import { ApiService } from '../../../api/api.service';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import { PasswordStrength, passwordStrengthScores } from '../../../entities/entities.password';
import { UserService } from '../../../user/user.service';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import { User } from 'core-lib-src/user';
import { val } from '@uirouter/angular';

export interface SignupEvent {
  reason: 'signup' | 'cancel';
  user?: User;
}

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  @Output() complete = new EventEmitter<SignupEvent>();

  passwordPolicy;

  signup = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    displayName: new FormControl<string>('', [Validators.required]),
    email: new FormControl<string>('', [Validators.email]),
    phone: new FormControl<string>(''),
    password: new FormControl<string>('', [Validators.required]),
    passwordconfirm: new FormControl<string>('', [Validators.required]),
    captchaText: new FormControl<string>('', [Validators.required])
  });

  passwordStrength?: PasswordStrength;
  loadingCaptcha = false;
  captcha: {
    uri?: string,
    token?: string
  } = {};

  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.apiService.getApi().subscribe((api: any) => {

      this.passwordPolicy = api.authenticationStrategies.local.settings.passwordPolicy;
      const passwordControl = this.signup.get('password');

      if (this.passwordPolicy && passwordControl) {
        
      const passwordControl = new FormControl<string>('', {
        validators: [Validators.required, this.passwordPolicyValidator()]
      });

      passwordControl.valueChanges.subscribe(value => {
        this.onPasswordChanged(value)
      });

      this.signup.setControl('password', passwordControl);
      }
    });

    zxcvbnOptions.setOptions({
      dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
      },
      graphs: zxcvbnCommonPackage.adjacencyGraphs,
      translations: zxcvbnEnPackage.translations,
    })
  }



  onPasswordChanged(password: string) {
    if (password && password.length > 0) {
      const score = password && password.length ? zxcvbn(password, [this.signup.controls.username.value]).score : 0;
      this.passwordStrength = passwordStrengthScores[score]
    } else {
      this.passwordStrength = passwordStrengthScores[0]
    }
  }

  get passwordTooltipText(): string {
    if (!this.passwordPolicy) return '';

    const rules: string[] = [];

    if (this.passwordPolicy.passwordMinLengthEnabled) {
      rules.push(`• At least ${this.passwordPolicy.passwordMinLength} characters`);
    }
    if (this.passwordPolicy.lowLettersEnabled) {
      rules.push(`• Minimum ${this.passwordPolicy.lowLetters} lowercase letter(s)`);
    }
    if (this.passwordPolicy.highLettersEnabled) {
      rules.push(`• Minimum ${this.passwordPolicy.highLetters} uppercase letter(s)`);
    }
    if (this.passwordPolicy.numbersEnabled) {
      rules.push(`• Minimum ${this.passwordPolicy.numbers} number(s)`);
    }
    if (this.passwordPolicy.specialCharsEnabled) {
      rules.push(`• Minimum ${this.passwordPolicy.specialChars} special character(s)`);
    }
    if (this.passwordPolicy.restrictSpecialCharsEnabled) {
      rules.push(`• Allowed special characters: ${this.passwordPolicy.restrictSpecialChars}`);
    }

    return rules.join('\n');
  }

  getCaptcha(): void {
    this.loadingCaptcha = true;
    const username = this.signup.controls.username.value;
    if (!username) return;

    this.userService.signup(username).subscribe((response: any) => {
      this.captcha = {
        uri: response.captcha,
        token: response.token
      };
      this.loadingCaptcha = false;
    });
  }

  onCancel(): void {
    this.complete.emit({ reason: 'cancel' });
  }

  onSignup(): void {
    const password = this.signup.controls.password.value;
    const confirm = this.signup.controls.passwordconfirm.value;

    if (password !== confirm) {
      this.signup.controls.passwordconfirm.setErrors({ match: true });
    } else {
      const confirmControl = this.signup.controls.passwordconfirm;
      const currentErrors = confirmControl.errors;
      if (currentErrors && currentErrors['match']) {
        delete currentErrors['match'];
        if (Object.keys(currentErrors).length === 0) {
          confirmControl.setErrors(null);
        } else {
          confirmControl.setErrors(currentErrors);
        }
      }
    }

    this.signup.markAllAsTouched();

    if (this.signup.valid) {
      this.userService.signupVerify(this.signup.value, this.captcha.token).subscribe({
        next: (response: any) => {
          this.complete.emit({ reason: 'signup', user: response });
        },
        error: (response: any) => {
          if (response.status === 401) {
            this.getCaptcha();
          } else if (response.status === 403) {
            this.signup.controls.captchaText.setErrors({ invalid: true });
          } else if (response.status === 409) {
            this.captcha = {};
            this.signup.controls.username.setErrors({ exists: true });
          }
        }
      });
    }
  }

  passwordPolicyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password: string = control.value;
      if (!password) return null;

      const errors: ValidationErrors = {};

      if (this.passwordPolicy.passwordMinLengthEnabled && password.length < this.passwordPolicy.passwordMinLength) {
        errors.passwordMinLength = true;
      }

      if (this.passwordPolicy.lowLettersEnabled && (password.match(/[a-z]/g) || []).length < this.passwordPolicy.lowLetters) {
        errors.lowLetters = true;
      }

      if (this.passwordPolicy.highLettersEnabled && (password.match(/[A-Z]/g) || []).length < this.passwordPolicy.highLetters) {
        errors.highLetters = true;
      }

      if (this.passwordPolicy.numbersEnabled && (password.match(/[0-9]/g) || []).length < this.passwordPolicy.numbers) {
        errors.numbers = true;
      }

      if (this.passwordPolicy.specialCharsEnabled && (password.match(/[^a-zA-Z0-9]/g) || []).length < this.passwordPolicy.specialChars) {
        errors.specialChars = true;
      }

      if (this.passwordPolicy.restrictSpecialCharsEnabled) {
        const allowed = this.passwordPolicy.restrictSpecialChars.split('');
        const specialMatches = password.match(/[^a-zA-Z0-9]/g) || [];
        if (specialMatches.some(char => !allowed.includes(char))) {
          errors.restrictSpecialChars = true;
        }
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

}
