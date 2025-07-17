import { NgModule } from '@angular/core'
import { AdminPluginTabContentComponent } from './plugin-tab/plugin-tab-content.component'
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from 'admin/src/ng1/admin/admin.dashboard';

@NgModule({
  declarations: [
    AdminPluginTabContentComponent, AdminDashboardComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    AdminPluginTabContentComponent
  ]
})
export class AdminModule {

}