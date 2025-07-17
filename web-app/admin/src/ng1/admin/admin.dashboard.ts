import {
  Component,
  Inject,
  OnInit,
  EventEmitter,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'underscore';
import * as moment from 'moment';

import {
  UserService,
  DeviceService,
  DevicePagingService,
  LoginService,
  EventService,
  LayerService,
  UserPagingService
} from 'admin/src/app/upgrade/ajs-upgraded-providers';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  @Output() onUserActivated = new EventEmitter<any>();
  @Output() onDeviceEnabled = new EventEmitter<any>();

  userSearch = '';
  userState = 'inactive';
  inactiveUsers: any[] = [];
  stateAndData: any;

  deviceSearch = '';
  deviceState = 'unregistered';
  unregisteredDevices: any[] = [];
  deviceStateAndData: any;

  login = {
    startDateOpened: false,
    endDateOpened: false,
    startDate: null,
    endDate: null
  };

  loginPage: any;
  loginResultsLimit = 25;
  loginSearchResults: any[] = [];
  loginDeviceSearchResults: any[] = [];
  firstLogin: any;
  showPrevious = false;
  showNext = true;

  eventCount = 0;
  layerCount = 0;

  filter: any = {};
  user: any = null;
  device: any = null;

  constructor(
    private router: Router,
    @Inject(UserService) private userService: any,
    @Inject(DeviceService) private deviceService: any,
    @Inject(DevicePagingService) private devicePagingService: any,
    @Inject(LoginService) private loginService: any,
    @Inject(EventService) private eventService: any,
    @Inject(LayerService) private layerService: any,
    @Inject(UserPagingService) private userPagingService: any
  ) {}

  ngOnInit(): void {
    this.stateAndData = this.userPagingService.constructDefault();
    this.deviceStateAndData = this.devicePagingService.constructDefault();

    this.devicePagingService.refresh(this.deviceStateAndData).then(() => {
      this.unregisteredDevices = this.devicePagingService.devices(this.deviceStateAndData[this.deviceState]);
    });

    this.eventService.count(data => this.eventCount = data.count);
    this.layerService.count(data => this.layerCount = data.count);

    this.loginService.query({ limit: this.loginResultsLimit }).then(loginPage => {
      this.loginPage = loginPage;
      if (loginPage.logins.length) {
        this.firstLogin = loginPage.logins[0];
      }
    });

    this.userPagingService.refresh(this.stateAndData).then(() => {
      this.inactiveUsers = this.userPagingService.users(this.stateAndData[this.userState]);
    });
  }

  count() {
    return this.userPagingService.count(this.stateAndData[this.userState]);
  }

  hasNext() {
    return this.userPagingService.hasNext(this.stateAndData[this.userState]);
  }

  next() {
    this.userPagingService.next(this.stateAndData[this.userState]).then(users => {
      this.inactiveUsers = users;
    });
  }

  hasPrevious() {
    return this.userPagingService.hasPrevious(this.stateAndData[this.userState]);
  }

  previous() {
    this.userPagingService.previous(this.stateAndData[this.userState]).then(users => {
      this.inactiveUsers = users;
    });
  }

  deviceCount() {
    return this.devicePagingService.count(this.deviceStateAndData[this.deviceState]);
  }

  hasNextDevice() {
    return this.devicePagingService.hasNext(this.deviceStateAndData[this.deviceState]);
  }

  nextDevice() {
    this.devicePagingService.next(this.deviceStateAndData[this.deviceState]).then(devices => {
      this.unregisteredDevices = devices;
    });
  }

  hasPreviousDevice() {
    return this.devicePagingService.hasPrevious(this.deviceStateAndData[this.deviceState]);
  }

  previousDevice() {
    this.devicePagingService.previous(this.deviceStateAndData[this.deviceState]).then(devices => {
      this.unregisteredDevices = devices;
    });
  }

  search() {
    this.userPagingService.search(this.stateAndData[this.userState], this.userSearch).then(users => {
      this.inactiveUsers = users;
    });
  }

  searchDevices() {
    this.devicePagingService.search(this.deviceStateAndData[this.deviceState], this.deviceSearch).then(devices => {
      if (devices.length > 0) {
        this.unregisteredDevices = devices;
      } else {
        this.devicePagingService.search(this.deviceStateAndData[this.deviceState], this.deviceSearch, this.deviceSearch).then(devices => {
          this.unregisteredDevices = devices;
        });
      }
    });
  }

  searchLoginsAgainstUsers(searchString: string | null) {
    if (!searchString) searchString = '.*';
    return this.userPagingService.search(this.stateAndData['all'], searchString).then(users => {
      this.loginSearchResults = users.length ? users : [{ displayName: 'No Results Found' }];
      return this.loginSearchResults;
    });
  }

  searchLoginsAgainstDevices(searchString: string | null) {
    if (!searchString) searchString = '.*';
    return this.devicePagingService.search(this.deviceStateAndData['all'], searchString).then(devices => {
      this.loginDeviceSearchResults = devices.length ? devices : [{ userAgent: 'No Results Found' }];
      return this.loginDeviceSearchResults;
    });
  }

  iconClass(device: any): string {
    if (!device) return '';
    if (device.iconClass) return device.iconClass;

    const userAgent = (device.userAgent || "").toLowerCase();
    if (device.appVersion === 'Web Client') return 'fa-desktop admin-desktop-icon-xs';
    if (userAgent.includes("android")) return 'fa-android admin-android-icon-xs';
    if (userAgent.includes("ios")) return 'fa-apple admin-apple-icon-xs';
    return 'fa-mobile admin-generic-icon-xs';
  }

  gotoUser(user: any) {
    this.router.navigate(['/admin/user', user.id]);
  }

  gotoDevice(device: any) {
    this.router.navigate(['/admin/device', device.id]);
  }

  hasPermission(permission: string): boolean {
    return _.contains(this.userService.myself.role.permissions, permission);
  }

  activateUser(event: MouseEvent, user: any) {
    event.stopPropagation();
    user.active = true;

    this.userService.updateUser(user.id, user, () => {
      this.userPagingService.refresh(this.stateAndData).then(() => {
        this.inactiveUsers = this.userPagingService.users(this.stateAndData[this.userState]);
      });
      this.onUserActivated.emit({ user });
    });
  }

  registerDevice(event: MouseEvent, device: any) {
    event.stopPropagation();
    device.registered = true;

    this.deviceService.updateDevice(device).then((updated: any) => {
      this.devicePagingService.refresh(this.deviceStateAndData).then(() => {
        this.unregisteredDevices = this.devicePagingService.devices(this.deviceStateAndData[this.deviceState]);
      });
      this.onDeviceEnabled.emit({ user: updated });
    });
  }

  pageLogin(url: string) {
    this.loginService.query({ url, filter: this.filter, limit: this.loginResultsLimit }).then(loginPage => {
      if (loginPage.logins.length) {
        this.loginPage = loginPage;
        this.showNext = loginPage.logins.length !== 0;
        this.showPrevious = loginPage.logins[0].id !== this.firstLogin.id;
      }
    });
  }

  filterLogins() {
    this.filter.user = this.user;
    this.filter.device = this.device;
    this.filter.startDate = this.login.startDate;
    if (this.login.endDate) {
      this.filter.endDate = moment(this.login.endDate).endOf('day').toDate();
    }

    this.loginService.query({ filter: this.filter, limit: this.loginResultsLimit }).then(loginPage => {
      this.loginPage = loginPage;
      this.showNext = loginPage.logins.length !== 0;
      this.showPrevious = false;
    });
  }

  dateFilterChanged() {
    this.filterLogins();
  }

  loginResultsLimitChanged() {
    this.filterLogins();
  }

  openLoginStart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.login.startDateOpened = true;
  }

  openLoginEnd(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.login.endDateOpened = true;
  }
}
