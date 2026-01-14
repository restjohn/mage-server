import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminBreadcrumbComponent } from './admin-breadcrumb.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    AdminBreadcrumbComponent
  ],
  imports: [
    CommonModule,
    MatIconModule
  ],
  exports: [
    AdminBreadcrumbComponent
  ],
  providers: [
    {
      provide: '$state',
      useFactory: (i: any) => i.get('$state'),
      deps: ['$injector']
    }     
  ]
})
export class AdminBreadcrumbModule { }
