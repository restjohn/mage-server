import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CoreModule } from '../../core/core.module';
import { AdminBreadcrumbModule } from '../admin-breadcrumb/admin-breadcrumb.module';
import { EventDashboardComponent } from './dashboard/event-dashboard.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { EventService } from 'src/app/event/event.service';
import { CreateEventDialogComponent } from './create-event/create-event.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    declarations: [
        EventDashboardComponent,
        CreateEventDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        CoreModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatProgressSpinnerModule,
        AdminBreadcrumbModule,
        MatSelectModule,
        MatOptionModule,    
        MatTooltipModule,
    ],
    exports: [
        EventDashboardComponent
    ],
    providers: [
        EventService
    ]
})
export class AdminEventsModule { }