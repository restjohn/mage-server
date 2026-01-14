import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PluginsComponent } from './plugins.component';
import { PluginsDashboardComponent } from "./dashboard/plugins-dashboard.component";
import { PluginHostComponent } from "./host/plugins-host.component";

@NgModule({
  declarations: [PluginsComponent, PluginsDashboardComponent, PluginHostComponent],
  imports: [
    RouterModule.forChild([
      { path: '', component: PluginsComponent }
    ])
  ]
})
export class PluginModule {}
