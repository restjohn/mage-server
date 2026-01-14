import angular from 'angular';
import admin from './admin.component';
import adminPluginTabContentBridge from './admin.plugin-tab-content-bridge.component';
import { downgradeComponent } from '@angular/upgrade/static';
import { AdminPluginTabContentComponent } from '../../app/admin/plugin-tab/plugin-tab-content.component';
import { AdminNavComponent } from '../../app/admin/admin-nav/admin-nav';
import { AdminFeedsComponent } from '../../app/admin/admin-feeds/admin-feeds.component';
import { AdminFeedComponent } from '../../app/admin/admin-feeds/admin-feed/admin-feed.component';

angular
  .module('mage')
  .component('admin', admin)
  .component('mageAdminPluginTabContentBridge', adminPluginTabContentBridge)
  .directive(
    'mageAdminPluginTabContent',
    downgradeComponent({ component: AdminPluginTabContentComponent })
  )
  .directive(
    'appAdminSideNav',
    downgradeComponent({ component: AdminNavComponent })
  )
  .directive('adminFeeds', downgradeComponent({ component: AdminFeedsComponent }))
  .directive('adminFeed', downgradeComponent({ component: AdminFeedComponent }));
