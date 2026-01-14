import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { UserService } from '../../upgrade/ajs-upgraded-providers';
import { Api } from '../signin/signin.component';

export interface SigninModalData {
    api: Api;
}

@Component({
    selector: 'signin-modal',
    templateUrl: './signin-modal.component.html',
    styleUrls: ['./signin-modal.component.scss']
})
export class SigninModalComponent {
    api: Api;
    hideSignup = true;

    constructor(
        public dialogRef: MatDialogRef<SigninModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SigninModalData,
        private authService: AuthService,
        @Inject(UserService) private userService: any
    ) {
        this.api = data.api;
    }

    onSuccess(): void {
        this.authService.loginConfirmed();
        this.dialogRef.close({ success: true });
    }

    logout(): void {
        this.userService.logout();
        this.dialogRef.close({ logout: true });
    }
}
