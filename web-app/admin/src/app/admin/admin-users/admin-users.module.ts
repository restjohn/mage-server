import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserDetailsComponent } from './user-details/user-details.component';
import { DeleteUserComponent } from './delete-user/delete-user.component';
import { CoreModule } from '../../core/core.module';
import { LoginsModule } from '../../logins/logins.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CoreModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        LoginsModule
    ],
    declarations: [
        UserDetailsComponent,
        DeleteUserComponent
    ],
    exports: [
        UserDetailsComponent
    ]
})
export class AdminUsersModule { }