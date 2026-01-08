import { Component, Inject, OnInit, EventEmitter, Output } from "@angular/core";
import { Router } from "@angular/router";
import * as _ from "underscore";
import {
  DeviceService,
  DevicePagingService,
  UserPagingService,
} from "admin/src/app/upgrade/ajs-upgraded-providers";
import { User } from "../admin-users/user";
import {
  Device,
  DevicesResponse,
  UsersResponse,
} from "admin/src/@types/dashboard/admin-dashboard";
import { AdminBreadcrumb } from "../admin-breadcrumb/admin-breadcrumb.model";
import { AdminUserService } from "../services/admin-user.service";
import { takeUntil, Subject } from "rxjs";

/**
 * Admin dashboard component for managing users, devices, and logins.
 */
@Component({
  selector: "admin-dashboard",
  templateUrl: "./admin-dashboard.html",
  styleUrls: ["./admin-dashboard.scss"],
})
export class AdminDashboardComponent implements OnInit {
  @Output() onUserActivated = new EventEmitter<any>();
  @Output() onDeviceEnabled = new EventEmitter<any>();

  users: User[] = [];
  userSearch: string = "";
  userState: string = "inactive";
  inactiveUsers: User[] = [];
  stateAndData: UsersResponse;

  devices: Device[] = [];
  deviceSearch = "";
  deviceState = "unregistered";
  unregisteredDevices: Device[] = [];
  deviceStateAndData: DevicesResponse;

  breadcrumbs: AdminBreadcrumb[] = [{
    title: 'Dashboard',
    iconClass: 'fa fa-dashboard'
  }];

  private $state: any;
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;

  constructor(
    private router: Router,
    private userService: AdminUserService,
    @Inject(DeviceService) private deviceService: any,
    @Inject(DevicePagingService) private devicePagingService: any,
    @Inject(UserPagingService) private userPagingService: any,
    @Inject('$injector') private $injector: any,
  ) {
    this.$state = this.$injector.get('$state');
  }

  /**
   * Initialize the component, loading users, devices, and current user data.
   */
  ngOnInit(): void {
    this.stateAndData = this.userPagingService.constructDefault();
    this.deviceStateAndData = this.devicePagingService.constructDefault();

    // Subscribe to current user
    this.userService.myself$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.devicePagingService.refresh(this.deviceStateAndData).then(() => {
      this.unregisteredDevices = this.devicePagingService.devices(
        this.deviceStateAndData[this.deviceState],
      );
    });

    this.userPagingService.refresh(this.stateAndData).then(() => {
      this.inactiveUsers = this.userPagingService.users(
        this.stateAndData[this.userState],
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  count() {
    return this.userPagingService.count(this.stateAndData[this.userState]);
  }

  hasNext() {
    return this.userPagingService.hasNext(this.stateAndData[this.userState]);
  }

  next() {
    this.userPagingService
      .next(this.stateAndData[this.userState])
      .then((users) => {
        this.inactiveUsers = users;
      });
  }

  hasPrevious() {
    return this.userPagingService.hasPrevious(
      this.stateAndData[this.userState],
    );
  }

  previous() {
    this.userPagingService
      .previous(this.stateAndData[this.userState])
      .then((users) => {
        this.inactiveUsers = users;
      });
  }

  deviceCount() {
    return this.devicePagingService.count(
      this.deviceStateAndData[this.deviceState],
    );
  }

  hasNextDevice() {
    return this.devicePagingService.hasNext(
      this.deviceStateAndData[this.deviceState],
    );
  }

  nextDevice() {
    this.devicePagingService
      .next(this.deviceStateAndData[this.deviceState])
      .then((devices) => {
        this.unregisteredDevices = devices;
      });
  }

  hasPreviousDevice() {
    return this.devicePagingService.hasPrevious(
      this.deviceStateAndData[this.deviceState],
    );
  }

  previousDevice() {
    this.devicePagingService
      .previous(this.deviceStateAndData[this.deviceState])
      .then((devices) => {
        this.unregisteredDevices = devices;
      });
  }

  search() {
    this.userPagingService
      .search(this.stateAndData[this.userState], this.userSearch)
      .then((users) => {
        this.inactiveUsers = users;
      });
  }

  searchDevices() {
    this.devicePagingService
      .search(this.deviceStateAndData[this.deviceState], this.deviceSearch)
      .then((devices) => {
        if (devices.length > 0) {
          this.unregisteredDevices = devices;
        } else {
          this.devicePagingService
            .search(
              this.deviceStateAndData[this.deviceState],
              this.deviceSearch,
              this.deviceSearch,
            )
            .then((devices) => {
              this.unregisteredDevices = devices;
            });
        }
      });
  }

  iconClass(device: Device): string {
    if (!device) return "";
    if (device.iconClass) return device.iconClass;

    const userAgent = (device.userAgent || "").toLowerCase();
    if (device.appVersion === "Web Client")
      return "fa fa-desktop admin-desktop-icon-xs";
    if (userAgent.includes("android"))
      return "fa fa-android admin-android-icon-xs";
    if (userAgent.includes("ios")) return "fa fa-apple admin-apple-icon-xs";
    return "fa fa-mobile admin-generic-icon-xs";
  }

  gotoUser(user: User) {
    this.$state.go('admin.user', { userId: user.id });
  }

  gotoDevice(device: Device) {
    this.$state.go('admin.device', { deviceId: device.id });
  }

  /**
   * Check if the current user has a specific permission.
   */
  hasPermission(permission: string): boolean {
    return this.currentUser?.role?.permissions?.includes(permission) || false;
  }

  activateUser(event: MouseEvent, user: User) {
    event.stopPropagation();
    user.active = true;
    this.userService.updateUser(user.id, user, () => {
      this.userPagingService.refresh(this.stateAndData).then(() => {
        this.inactiveUsers = this.userPagingService.users(
          this.stateAndData[this.userState],
        );
      });
      this.onUserActivated.emit({ user });
    });
  }

  registerDevice(event: MouseEvent, device: Device) {
    event.stopPropagation();
    device.registered = true;

    this.deviceService.updateDevice(device).then((updated: User) => {
      this.devicePagingService.refresh(this.deviceStateAndData).then(() => {
        this.unregisteredDevices = this.devicePagingService.devices(
          this.deviceStateAndData[this.deviceState],
        );
      });
      this.onDeviceEnabled.emit({ user: updated });
    });
  }
}
