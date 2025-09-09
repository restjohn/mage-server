import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Role } from '../user';
import { ApiService } from '../../../api/api.service';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import {
  PasswordStrength,
  passwordStrengthScores
} from 'src/app/entities/entities.password';
import { PasswordPolicy } from 'src/app/ingress/authentication/@types/signup';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

@Component({
  selector: 'create-user-modal',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserModalComponent {
  roles: Role[] = [];
  saving = false;

  selectedAvatarFileName: string = '';

  signup = new FormGroup({
    displayName: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email]),
    phone: new FormControl(''),
    selectedRole: new FormControl(null, [Validators.required]),
    password: new FormControl('', [Validators.required]),
    passwordconfirm: new FormControl('', [Validators.required]),
    iconType: new FormControl('none'),
    iconInitials: new FormControl(''),
    iconColor: new FormControl('#007bff')
  });

  passwordPolicy: PasswordPolicy;

  showPassword: boolean = false;

  showConfirmPassword: boolean = false;
  passwordErrorMessages: string[] = [];

  newUserFiles = {
    avatar: null as File | null,
    icon: null as File | null
  };

  passwordStrength: PasswordStrength;

  avatarPreviewUrl: string | null = null;
  iconPreviewUrl: string | null = null;

  iconMetadata = {
    type: 'none',
    text: '',
    color: '#007bff'
  };

  constructor(
    public dialogRef: MatDialogRef<CreateUserModalComponent>,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: { roles: Role[]; saving?: boolean }
  ) {
    if (data) {
      this.roles = data.roles;
      if (data.saving !== undefined) this.saving = data.saving;
    }
  }

  /**
   * Initializes component by loading the password policy,
   * setting up custom validators, and initializing password strength checker.
   */
  ngOnInit(): void {
    this.apiService.getApi().subscribe((api: any) => {
      this.passwordPolicy =
        api.authenticationStrategies.local.settings.passwordPolicy;

      if (this.passwordPolicy) {
        const passwordControl = this.signup.get('password');
        const confirmControl = this.signup.get('passwordconfirm');

        if (passwordControl) {
          passwordControl.setValidators([
            Validators.required,
            this.passwordPolicyValidator()
          ]);
          passwordControl.updateValueAndValidity();

          passwordControl.valueChanges.subscribe((value) => {
            this.onPasswordChanged(value);
            confirmControl?.updateValueAndValidity();
          });
        }

        if (confirmControl) {
          confirmControl.setValidators([
            Validators.required,
            this.confirmPasswordValidator()
          ]);
          confirmControl.updateValueAndValidity();
        }
      }
    });

    this.watchIconChanges();
  }

  watchIconChanges(): void {
    const initialsCtrl = this.signup.get('iconInitials');
    const colorCtrl = this.signup.get('iconColor');

    if (initialsCtrl && colorCtrl) {
      initialsCtrl.valueChanges.subscribe(() => {
        this.generateMarkerIcon(initialsCtrl.value, colorCtrl.value);
      });

      colorCtrl.valueChanges.subscribe(() => {
        this.generateMarkerIcon(initialsCtrl.value, colorCtrl.value);
      });
    }
  }

  onAvatarChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedAvatarFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.newUserFiles.avatar = file;
      (event.target as HTMLInputElement).value = '';
    }
  }

  clearAvatar(): void {
    this.avatarPreviewUrl = '';
    this.selectedAvatarFileName = '';
    this.newUserFiles.avatar = null;
  }

  onIconChanged(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.newUserFiles.icon = file;
    const reader = new FileReader();
    reader.onload = () => (this.iconPreviewUrl = reader.result as string);
    reader.readAsDataURL(file);
    this.iconMetadata.type = 'upload';
  }

  iconTypeChanged() {
    if (this.iconMetadata.type === 'none') {
      this.newUserFiles.icon = null;
      this.iconPreviewUrl = null;
    }
  }

  onCreateTextChanged(value: string) {
    this.iconMetadata.text = value.toUpperCase().substring(0, 2);
  }

  onCreateColorChanged(value: string) {
    this.iconMetadata.color = value;
  }

  getContrastingTextColor(bgColor: string): string {
    const hex = bgColor.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq >= 128 ? '#000000' : '#FFFFFF';
  }

  generateMarkerIcon(initials: string, color: string): void {
    const contrast = this.getContrastingTextColor(color);
    const circleFill = contrast === '#000000' ? '#ffffff' : '#000000';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="60">
        <g>
          <path d="M22 0C10 0 0 10 0 22c0 14 22 38 22 38s22-24 22-38C44 10 34 0 22 0z" fill="${color}" />
          <circle cx="22" cy="22" r="14" fill="${circleFill}"/>
          <text
            x="50%"
            y="40%"
            text-anchor="middle"
            dy=".3em"
            font-family="Arial"
            font-size="20"
            fill="${contrast}"
            font-weight="bold"
          >
            ${initials}
          </text>
        </g>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const file = new File([blob], 'map-icon.svg', { type: 'image/svg+xml' });

    const encoded = encodeURIComponent(svg)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');

    this.newUserFiles.icon = file;
    this.iconPreviewUrl = `data:image/svg+xml;charset=utf-8,${encoded}`;
  }

  saveUser() {
    if (this.signup.invalid || this.passwordErrorMessages.length > 0) {
      this.signup.markAllAsTouched();
      return;
    }

    const userPayload = {
      username: this.signup.get('username').value,
      displayName: this.signup.get('displayName').value,
      email: this.signup.get('email').value,
      password: this.signup.get('password').value,
      passwordconfirm: this.signup.get('passwordconfirm').value,
      roleId: this.signup.get('selectedRole').value,
      avatar: this.newUserFiles.avatar,
      icon: this.newUserFiles.icon,
      iconMetadata: JSON.stringify(this.iconMetadata)
    };

    this.dialogRef.close({ confirmed: true, user: userPayload });
  }

  cancelModal() {
    this.dialogRef.close({ confirmed: false });
  }

  onIconTypeChanged() {
    const type = this.signup.get('iconType')?.value;
    this.iconMetadata.type = type;

    if (type === 'none') {
      this.iconPreviewUrl = null;
      this.newUserFiles.icon = null;
    }
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
   * Creates a custom validator based on the password policy rules.
   * @returns A ValidatorFn that checks password strength and rules.
   */
  passwordPolicyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password: string = control.value;

      if (!password) return null;

      const templates = this.passwordPolicy.helpTextTemplate;
      let currentErrors: string[] = [];

      const errors: ValidationErrors = {};

      if (
        this.passwordPolicy.passwordMinLengthEnabled &&
        password.length < this.passwordPolicy.passwordMinLength
      ) {
        errors.passwordMinLength = true;
        currentErrors.push(
          `Must ${templates.passwordMinLength?.replace(
            '#',
            this.passwordPolicy.passwordMinLength.toString()
          )}`
        );
      }

      if (
        this.passwordPolicy.lowLettersEnabled &&
        (password.match(/[a-z]/g) || []).length < this.passwordPolicy.lowLetters
      ) {
        errors.lowLetters = true;
        currentErrors.push(
          `Must ${templates.lowLetters?.replace(
            '#',
            this.passwordPolicy.lowLetters.toString()
          )}`
        );
      }

      if (
        this.passwordPolicy.minCharsEnabled &&
        (password.match(/[a-z]/gi) || []).length < this.passwordPolicy.minChars
      ) {
        errors.minChars = true;
        currentErrors.push(
          `Must ${templates.minChars?.replace(
            '#',
            this.passwordPolicy.minChars.toString()
          )}`
        );
      }

      if (
        this.passwordPolicy.highLettersEnabled &&
        (password.match(/[A-Z]/g) || []).length <
          this.passwordPolicy.highLetters
      ) {
        errors.highLetters = true;
        currentErrors.push(
          `Must ${templates.highLetters?.replace(
            '#',
            this.passwordPolicy.highLetters.toString()
          )}`
        );
      }

      if (
        this.passwordPolicy.numbersEnabled &&
        (password.match(/[0-9]/g) || []).length < this.passwordPolicy.numbers
      ) {
        errors.numbers = true;
        currentErrors.push(
          `Must ${templates.numbers?.replace(
            '#',
            this.passwordPolicy.numbers.toString()
          )}`
        );
      }

      if (
        this.passwordPolicy.specialCharsEnabled &&
        (password.match(/[^a-zA-Z0-9]/g) || []).length <
          this.passwordPolicy.specialChars
      ) {
        errors.specialChars = true;
        currentErrors.push(
          `Must ${templates.specialChars?.replace(
            '#',
            this.passwordPolicy.specialChars.toString()
          )}`
        );
      }

      if (this.passwordPolicy.maxConCharsEnabled) {
        const maxConChars = this.passwordPolicy.maxConChars;

        const regex = new RegExp(`[a-zA-Z]{${maxConChars + 1},}`);

        if (regex.test(password)) {
          errors.maxConChars = true;
          currentErrors.push(
            `Must ${templates.maxConChars?.replace(
              '#',
              this.passwordPolicy.maxConChars.toString()
            )}`
          );
        }
      }

      if (this.passwordPolicy.restrictSpecialCharsEnabled) {
        const allowed = this.passwordPolicy.restrictSpecialChars.split('');
        const specialMatches = password.match(/[^a-zA-Z0-9]/g) || [];
        if (specialMatches.some((char) => !allowed.includes(char))) {
          errors.restrictSpecialChars = true;
          currentErrors.push(
            `Must ${templates.restrictSpecialChars?.replace(
              '#',
              this.passwordPolicy.restrictSpecialChars.toString()
            )}`
          );
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
      rules.push(`• At least ${this.passwordPolicy.minChars} letters [aA-zZ]`);
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
}
