import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import {
  Feed,
  FeedExpanded,
  Service,
  ServiceType,
  FeedService
} from '@ngageoint/mage.web-core-lib/feed';

import { AdminUserService } from '../../services/admin-user.service';
import { AdminBreadcrumb } from '../../admin-breadcrumb/admin-breadcrumb.model';
import { AdminServiceDeleteComponent } from './admin-service-delete/admin-service-delete.component';
import { UiStateService } from '../../services/ui-state.service';

@Component({
  selector: 'app-admin-service',
  templateUrl: './admin-service.component.html',
  styleUrls: ['./admin-service.component.scss']
})
export class AdminServiceComponent implements OnInit {
  breadcrumbs: AdminBreadcrumb[] = [
    {
      title: 'Feeds',
      icon: 'rss_feed',
      state: {
        name: 'admin.feeds'
      }
    }
  ];

  serviceLoaded: Promise<boolean>;
  service: Service;
  serviceType: ServiceType;

  feeds: Feed[] = [];
  feedPage = 0;
  itemsPerPage = 5;

  hasServiceEditPermission = false;
  hasServiceDeletePermission = false;

  configOptions = {
    addSubmit: false,
    defautWidgetOptions: {
      readonly: true
    }
  };

  constructor(
    private feedService: FeedService,
    private stateService: UiStateService,
    public dialog: MatDialog,
    private adminUserService: AdminUserService
  ) {}

  ngOnInit(): void {
    // Load permissions via AdminUserService
    this.adminUserService.getMyself().subscribe({
      next: (myself) => {
        const perms: string[] = myself?.role?.permissions || [];
        this.hasServiceEditPermission = perms.includes('FEEDS_CREATE_SERVICE');
        this.hasServiceDeletePermission = perms.includes(
          'FEEDS_CREATE_SERVICE'
        );
      },
      error: () => {
        this.hasServiceEditPermission = false;
        this.hasServiceDeletePermission = false;
      }
    });

    forkJoin(
      this.feedService.fetchService(this.stateService.params.serviceId),
      this.feedService.fetchServiceFeeds(this.stateService.params.serviceId)
    ).subscribe((result) => {
      this.service = result[0];
      this.feeds = result[1];

      this.breadcrumbs.push({
        title: this.service.title
      });

      const serviceType: ServiceType = this.service.serviceType as ServiceType;
      this.feedService
        .fetchServiceType(serviceType.id)
        .subscribe((serviceType) => {
          this.serviceType = serviceType;

          // Wrap non-object schemas (ajsf bug workaround)
          if (
            this.serviceType.configSchema.hasOwnProperty('type') &&
            this.serviceType.configSchema.type !== 'object'
          ) {
            this.serviceType.configSchema = {
              type: 'object',
              properties: {
                wrapped: this.serviceType.configSchema
              }
            };

            this.service.config = {
              wrapped: this.service.config
            };
          }

          this.serviceLoaded = Promise.resolve(true);
        });
    });
  }

  goToFeeds(): void {
    this.stateService.go('admin.feeds');
  }

  goToFeed(feed: Feed | FeedExpanded): void {
    this.stateService.go('admin.feed', { feedId: feed.id });
  }

  deleteService(): void {
    this.dialog
      .open(AdminServiceDeleteComponent, {
        data: {
          service: this.service,
          feeds: this.feeds
        },
        autoFocus: false,
        disableClose: true
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === true) {
          this.feedService.deleteService(this.service).subscribe(() => {
            this.goToFeeds();
          });
        }
      });
  }
}
