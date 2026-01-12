import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../upgrade/ajs-upgraded-providers';
import { AuthService, SigninEvent } from '../auth.service';
import { Api } from '../signin/signin.component';
import { AuthenticationStrategy } from '../local-signin/local-signin.component';

type AuthenticationAction =
    | 'setup'
    | 'signin'
    | 'signup'
    | 'disclaimer'
    | 'authorize-device'
    | 'inactive-account'
    | 'active-account'
    | 'disabled-account'
    | 'about';

@Component({
    selector: 'authentication',
    templateUrl: './authentication.component.html',
    styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
    @Input() api: Api;
    @Input() hideSignup = false;
    @Output() onSuccess = new EventEmitter<void>();
    @Output() onFailure = new EventEmitter<void>();

    action: AuthenticationAction | null = null;
    user: any;
    token: string;
    strategy: string;
    localAuthenticationStrategy: AuthenticationStrategy | null = null;

    constructor(
        @Inject(UserService) private userService: any,
        @Inject('$stateParams') private $stateParams: any,
        private authService: AuthService
    ) {
        this.action = this.$stateParams?.action || null;
        this.strategy = this.$stateParams?.strategy || '';
    }

    ngOnInit(): void {
        if (this.api?.initial) {
            this.action = 'setup';
        }
    }

    returnToSignin(): void {
        this.userService.logout();
        this.action = 'signin';
        this.onFailure.emit();
    }

    onSignup(): void {
        this.action = 'signup';
    }

    showAbout(): void {
        this.action = 'about';
    }

    showSignupSuccess(account: any): void {
        if (account?.active) {
            this.action = 'active-account';
        } else {
            this.action = 'inactive-account';
        }
    }

    authorized(): void {
        const disclaimer = this.api?.disclaimer || { show: false };
        if (!disclaimer.show) {
            this.authService.loginConfirmed();
            this.userService.acceptDisclaimer();
            this.onSuccess.emit();
            return;
        }
        this.action = 'disclaimer';
    }

    acceptDisclaimer(): void {
        this.userService.acceptDisclaimer();
        this.onSuccess.emit();
    }

    onSignin(event: SigninEvent): void {
        this.user = event.user;
        this.token = event.token;
        this.strategy = event.strategy;
        this.action = 'authorize-device';
    }
}
