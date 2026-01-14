import { Component, Input } from '@angular/core';
import { AdminBreadcrumb } from './admin-breadcrumb.model';
import { UiStateService } from '../services/ui-state.service';

@Component({
  selector: 'admin-breadcrumb',
  templateUrl: './admin-breadcrumb.component.html',
  styleUrls: ['./admin-breadcrumb.component.scss']
})
export class AdminBreadcrumbComponent {
  @Input() icon!: string;
  @Input() iconClass!: string;
  @Input() breadcrumbs!: AdminBreadcrumb[];

  constructor(private state: UiStateService) {}

  goToBreadcrumb(breadcrumb: AdminBreadcrumb): void {
    if (breadcrumb.state) {
      this.state.go(breadcrumb.state.name as any, breadcrumb.state.params);
    }
  }
}
