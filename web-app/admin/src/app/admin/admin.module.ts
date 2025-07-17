import { NgModule } from '@angular/core';
import { AdminPluginTabContentComponent } from './plugin-tab/plugin-tab-content.component';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';

@NgModule({
  declarations: [
    AdminPluginTabContentComponent, AdminDashboardModule,
  ],
  imports: [
  ],
  exports: [
    AdminPluginTabContentComponent, AdminDashboardModule,
  ]
})
export class AdminModule {

}