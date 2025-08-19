import { Component, EventEmitter, Output, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ValidationErrors,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import { ApiService } from '../../../api/api.service';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import {
  PasswordStrength,
  passwordStrengthScores
} from '../../../entities/entities.password';
import { UserService } from '../../../user/user.service';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import { PasswordPolicy, SignupEvent } from '../@types/signup';

/**
 * Component for handling user signup, including form validation,
 * password strength estimation, CAPTCHA verification, and emitting
 * events on success or cancellation.
 */
@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  @Output() complete = new EventEmitter<SignupEvent>();

  passwordPolicy: PasswordPolicy;

  showPassword: boolean = false;

  showConfirmPassword: boolean = false;
  passwordErrorMessages: string[] = [];

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
    uri?: string;
    token?: string;
  } = {};

  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {}

  /**
   * Initializes component by loading the password policy,
   * setting up custom validators, and initializing password strength checker.
   */
  ngOnInit(): void {
    this.apiService.getApi().subscribe((api: any) => {
      this.passwordPolicy =
        api.authenticationStrategies.local.settings.passwordPolicy;

        console.log(this.passwordPolicy)
      const passwordControl = this.signup.get('password');

      if (this.passwordPolicy && passwordControl) {
        const passwordControl = new FormControl<string>('', {
          validators: [Validators.required, this.passwordPolicyValidator()]
        });

        const matchPasswordControl = new FormControl<string>('', {
          validators: [Validators.required, this.confirmPasswordValidator()]
        });

        passwordControl.valueChanges.subscribe((value) => {
          this.onPasswordChanged(value);
        });

        this.signup.setControl('password', passwordControl);
        this.signup.setControl('passwordconfirm', matchPasswordControl);
      }
    });

    zxcvbnOptions.setOptions({
      dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary
      },
      graphs: zxcvbnCommonPackage.adjacencyGraphs,
      translations: zxcvbnEnPackage.translations
    });
  }

  /**
   * Updates the password strength indicator based on the current input.
   * @param password The entered password string.
   */
  onPasswordChanged(password: string) {
    if (password && password.length > 0) {
      const score =
        password && password.length
          ? zxcvbn(password, [this.signup.controls.username.value]).score
          : 0;
      this.passwordStrength = passwordStrengthScores[score];
    } else {
      this.passwordStrength = passwordStrengthScores[0];
    }
  }

  /**
   * Returns a list of password policy requirements in a tooltip-friendly format.
   */
  get passwordTooltipText(): string {
    if (!this.passwordPolicy) return '';

    const rules: string[] = [];

    if (this.passwordPolicy.passwordMinLengthEnabled) {
      rules.push(
        `• At least ${this.passwordPolicy.passwordMinLength} characters`
      );
    }
    if (this.passwordPolicy.minCharsEnabled) {
      rules.push(
        `• At least ${this.passwordPolicy.minChars} letters [aA-zZ]`
      );
    }
    if (this.passwordPolicy.lowLettersEnabled) {
      rules.push(
        `• Minimum ${this.passwordPolicy.lowLetters} lowercase letter(s)`
      );
    }
    if (this.passwordPolicy.highLettersEnabled) {
      rules.push(
        `• Minimum ${this.passwordPolicy.highLetters} uppercase letter(s)`
      );
    }
    if (this.passwordPolicy.numbersEnabled) {
      rules.push(`• Minimum ${this.passwordPolicy.numbers} number(s)`);
    }
    if (this.passwordPolicy.specialCharsEnabled) {
      rules.push(
        `• Minimum ${this.passwordPolicy.specialChars} special character(s)`
      );
    }
    if (this.passwordPolicy.maxConCharsEnabled) {
      rules.push(
        `• Maximum ${this.passwordPolicy.maxConChars} repeated character(s)`
      );
    }
    if (this.passwordPolicy.restrictSpecialCharsEnabled) {
      rules.push(
        `• Allowed special characters: ${this.passwordPolicy.restrictSpecialChars}`
      );
    }

    return rules.join('\n');
  }

  /**
   * Retrieves a new CAPTCHA image and token based on the entered username.
   */
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

  /**
   * Emits a cancel event, typically used to close or reset the signup flow.
   */
  onCancel(): void {
    this.complete.emit({ reason: 'cancel' });
  }

  /**
   * Handles the signup process, validates form fields,
   * verifies the CAPTCHA, and emits a signup event on success.
   */
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
      this.userService
        .signupVerify(this.signup.value, this.captcha.token)
        .subscribe({
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

  /**
   * Creates a custom validator based on the password policy rules.
   * @returns A ValidatorFn that checks password strength and rules.
   */
  passwordPolicyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password: string = control.value;

      if (!password) return null;

      const templates = this.passwordPolicy.helpTextTemplate;
      let currentErrors:string[] = [];

      const errors: ValidationErrors = {};

      if (
        this.passwordPolicy.passwordMinLengthEnabled &&
        password.length < this.passwordPolicy.passwordMinLength
      ) {
        errors.passwordMinLength = true;
        currentErrors.push(`Must ${templates.passwordMinLength?.replace('#', this.passwordPolicy.passwordMinLength.toString())}`);
      }

      if (
        this.passwordPolicy.lowLettersEnabled &&
        (password.match(/[a-z]/g) || []).length < this.passwordPolicy.lowLetters
      ) {
        errors.lowLetters = true;
        currentErrors.push(`Must ${templates.lowLetters?.replace('#', this.passwordPolicy.lowLetters.toString())}`);
      }

      if (
        this.passwordPolicy.minCharsEnabled &&
        (password.match(/[a-z]/gi) || []).length < this.passwordPolicy.minChars
      ) {
        errors.minChars = true;
        currentErrors.push(`Must ${templates.minChars?.replace('#', this.passwordPolicy.minChars.toString())}`);
      }

      if (
        this.passwordPolicy.highLettersEnabled &&
        (password.match(/[A-Z]/g) || []).length <
          this.passwordPolicy.highLetters
      ) {
        errors.highLetters = true;
        currentErrors.push(`Must ${templates.highLetters?.replace('#', this.passwordPolicy.highLetters.toString())}`);
      }

      if (
        this.passwordPolicy.numbersEnabled &&
        (password.match(/[0-9]/g) || []).length < this.passwordPolicy.numbers
      ) {
        errors.numbers = true;
        currentErrors.push(`Must ${templates.numbers?.replace('#', this.passwordPolicy.numbers.toString())}`);
      }

      if (
        this.passwordPolicy.specialCharsEnabled &&
        (password.match(/[^a-zA-Z0-9]/g) || []).length <
          this.passwordPolicy.specialChars
      ) {
        errors.specialChars = true;
        currentErrors.push(`Must ${templates.specialChars?.replace('#', this.passwordPolicy.specialChars.toString())}`);
      }

      if (this.passwordPolicy.maxConCharsEnabled) {
        const maxConChars = this.passwordPolicy.maxConChars;
    
        const regex = new RegExp(`[a-zA-Z]{${maxConChars + 1},}`);
      
        if (regex.test(password)) {
          errors.maxConChars = true;
          currentErrors.push(`Must ${templates.maxConChars?.replace('#', this.passwordPolicy.maxConChars.toString())}`);
        }
      }
      

      if (this.passwordPolicy.restrictSpecialCharsEnabled) {
        const allowed = this.passwordPolicy.restrictSpecialChars.split('');
        const specialMatches = password.match(/[^a-zA-Z0-9]/g) || [];
        if (specialMatches.some((char) => !allowed.includes(char))) {
          errors.restrictSpecialChars = true;
          currentErrors.push(`Must ${templates.restrictSpecialChars?.replace('#', this.passwordPolicy.restrictSpecialChars.toString())}`);
        }
      }

      this.passwordErrorMessages = currentErrors;

      return Object.keys(errors).length ? errors : null;
    };
  }

  getPasswordErrorMessages(errors: any): string[] {
    if (errors['required']) {
      return ['Password is required'];
    }
  
    return this.passwordErrorMessages;
  }
  

  /**
   * Creates a validator that checks whether the password confirmation matches the original password.
   * @returns A ValidatorFn that checks for password mismatch.
   */
  confirmPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password: string = control.value;
      if (!password) return null;

      const errors: ValidationErrors = {};

      if (password !== this.signup.controls.password.value) errors.match = true;

      return Object.keys(errors).length ? errors : null;
    };
  }
}
