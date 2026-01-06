import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { UserService } from '../../upgrade/ajs-upgraded-providers';
import { SigninEvent } from '../auth.service';
import { AuthenticationStrategy, ContactInfo } from '../local-signin/local-signin.component';

@Component({
    selector: 'idp-signin',
    templateUrl: './idp-signin.component.html',
    styleUrls: ['./idp-signin.component.scss']
})
export class IdpSigninComponent {
    @Input() strategy: AuthenticationStrategy;
    @Output() onSignin = new EventEmitter<SigninEvent>();

    statusTitle = '';
    statusMessage = '';
    info: ContactInfo;
    contactOpen = { opened: false };

    constructor(
        @Inject(UserService) private userService: any
    ) { }

    signin(): void {
        this.userService.idpSignin(this.strategy.name).then(
            ({ user, token }: { user: any; token: string }) => {
                if (!token || !user) {
                    let message = 'There was a problem signing in, Please contact a MAGE administrator for assistance.';
                    if (user) {
                        if (!user.active) {
                            message = 'Your account has been created but it is not active. A MAGE administrator needs to activate your account before you can log in.';
                        } else if (!user.enabled) {
                            message = 'Your account has been disabled, please contact a MAGE administrator for assistance.';
                        }
                    }

                    this.statusTitle = 'Signin Failed';
                    this.statusMessage = message;
                    this.info = {
                        statusTitle: this.statusTitle,
                        statusMessage: this.statusMessage,
                        id: user
                    };
                    this.contactOpen = { opened: true };
                    return;
                }

                this.onSignin.emit({
                    user: user,
                    token: token,
                    strategy: this.strategy.name
                });
            },
            ({ errorMessage }: { errorMessage: string }) => {
                this.statusTitle = 'Error signing in';
                this.statusMessage = errorMessage;
                this.info = {
                    statusTitle: this.statusTitle,
                    statusMessage: this.statusMessage,
                    id: ''
                };
                this.contactOpen = { opened: true };
            }
        );
    }

    onContactClose(): void {
        this.contactOpen = { opened: false };
    }
}
