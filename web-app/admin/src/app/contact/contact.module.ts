import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ContactComponent } from './contact.component';
import { ContactDialogComponent } from './contact-dialog.component';

@NgModule({
    declarations: [
        ContactComponent,
        ContactDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule
    ],
    exports: [
        ContactComponent,
        ContactDialogComponent
    ]
})
export class ContactModule { }
