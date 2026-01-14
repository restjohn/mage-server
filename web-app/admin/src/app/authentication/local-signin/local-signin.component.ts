import { Component, EventEmitter, Inject, Input, Output, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../upgrade/ajs-upgraded-providers';
import { SigninEvent } from '../auth.service';

export interface AuthenticationStrategy {
    name: string;
    title?: string;
    type?: string;
    buttonColor?: string;
    textColor?: string;
    icon?: string;
}

export interface ContactInfo {
    statusTitle: string;
    statusMessage: string;
    id: string;
}

@Component({
    selector: 'local-signin',
    templateUrl: './local-signin.component.html',
    styleUrls: ['./local-signin.component.scss']
})
export class LocalSigninComponent implements AfterViewInit {
    @Input() strategy: AuthenticationStrategy;
    @Input() hideSignup = false;
    @Output() onSignin = new EventEmitter<SigninEvent>();
    @Output() onSignup = new EventEmitter<void>();

    @ViewChild('usernameInput') usernameInput: ElementRef<HTMLInputElement>;
    @ViewChild('passwordInput') passwordInput: ElementRef<HTMLInputElement>;

    private _username = '';
    private _password = '';

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
        if (value) {
            this.usernameValid = true;
        }
        if (this.statusMessage) {
            this.statusMessage = '';
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
        if (value) {
            this.passwordValid = true;
        }
        if (this.statusMessage) {
            this.statusMessage = '';
        }
    }

    statusTitle = '';
    statusMessage = '';
    info: ContactInfo;
    contactOpen = { opened: false };

    usernameValid = true;
    passwordValid = true;

    constructor(
        @Inject(UserService) private userService: any
    ) { }

    ngAfterViewInit(): void {
        // MDC text fields are initialized automatically in Angular Material
    }

    signin(): void {
        // Reset validation
        this.usernameValid = true;
        this.passwordValid = true;
        this.statusMessage = '';

        // Validate fields
        if (!this.username || this.username.trim() === '') {
            this.usernameValid = false;
        }
        if (!this.password || this.password.trim() === '') {
            this.passwordValid = false;
        }

        // Don't submit if validation fails
        if (!this.usernameValid || !this.passwordValid) {
            return;
        }

        this.userService.signin({ username: this.username, password: this.password }).then(
            (response: any) => {
                this.onSignin.emit({
                    user: response.user,
                    token: response.token,
                    strategy: this.strategy.name
                });
            },
            (response: any) => {
                this.statusTitle = 'Error signing in';
                this.statusMessage = response.data || 'Please check your username and password and try again.';
                // Don't mark individual fields as invalid on server error
                // The general error message is sufficient
                this.info = {
                    statusTitle: this.statusTitle,
                    statusMessage: this.statusMessage,
                    id: this.username
                };
                this.contactOpen = { opened: true };
            }
        );
    }

    signupClicked(): void {
        this.onSignup.emit();
    }

    onContactClose(): void {
        this.contactOpen = { opened: false };
    }
}
