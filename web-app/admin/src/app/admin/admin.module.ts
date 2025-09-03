import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminPluginTabContentComponent } from './plugin-tab/plugin-tab-content.component';
import { AdminUsersModule } from './admin-users/admin-users.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AdminUsersModule
  ],
  declarations: [
    AdminPluginTabContentComponent
  ],
  exports: [
    AdminPluginTabContentComponent,
    AdminUsersModule
  ]
})
export class AdminModule {

}