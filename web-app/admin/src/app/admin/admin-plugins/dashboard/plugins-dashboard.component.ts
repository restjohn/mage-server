import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminPluginListItem } from '../plugins.component';

@Component({
  selector: 'mage-plugins-dashboard',
  templateUrl: './plugins-dashboard.component.html',
  styleUrls: ['./plugins-dashboard.component.scss']
})
export class PluginsDashboardComponent {
  @Input() plugins: AdminPluginListItem[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  open(pluginId: string): void {
    this.router.navigate([pluginId], { relativeTo: this.route });
  }

  trackById(_: number, p: AdminPluginListItem): string {
    return p.id;
  }
}
