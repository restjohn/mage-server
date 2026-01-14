import { Component, EventEmitter, Inject, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../upgrade/ajs-upgraded-providers';
import { SigninEvent } from '../auth.service';
import { AuthenticationStrategy, ContactInfo } from '../local-signin/local-signin.component';

@Component({
    selector: 'ldap-signin',
    templateUrl: './ldap-signin.component.html',
    styleUrls: ['./ldap-signin.component.scss']
})
export class LdapSigninComponent {
    @Input() strategy: AuthenticationStrategy;
    @Output() onSignin = new EventEmitter<SigninEvent>();

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

    signin(): void {
        this.usernameValid = true;
        this.passwordValid = true;
        this.statusMessage = '';

        if (!this.username || this.username.trim() === '') {
            this.usernameValid = false;
        }
        if (!this.password || this.password.trim() === '') {
            this.passwordValid = false;
        }

        if (!this.usernameValid || !this.passwordValid) {
            return;
        }

        this.userService.ldapSignin({ username: this.username, password: this.password }).then(
            ({ user, token }: { user: any; token: string }) => {
                this.onSignin.emit({
                    user: user,
                    token: token,
                    strategy: this.strategy.name
                });
            },
            (response: any) => {
                this.statusTitle = 'Error signing in';
                this.statusMessage = response.data || 'Please check your username and password and try again.';
                this.info = {
                    statusTitle: this.statusTitle,
                    statusMessage: this.statusMessage,
                    id: this.username
                };
                this.contactOpen = { opened: true };
            }
        );
    }

    onContactClose(): void {
        this.contactOpen = { opened: false };
    }
}
