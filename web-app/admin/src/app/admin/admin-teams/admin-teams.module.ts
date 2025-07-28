import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AdminTeamsComponent } from './admin-dashboard/admin-teams.component';
import { AdminTeamCreateComponent } from './admin-team-create/admin-team-create.component';
import { TeamsService } from './teams-service';

const routes: Routes = [
    {
        path: '',
        component: AdminTeamsComponent
    }
];

@NgModule({
    declarations: [
        AdminTeamsComponent,
        AdminTeamCreateComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule.forChild(routes)
    ],
    providers: [
        TeamsService
    ],
    entryComponents: [
        AdminTeamCreateComponent
    ]
})
export class AdminTeamsModule { }