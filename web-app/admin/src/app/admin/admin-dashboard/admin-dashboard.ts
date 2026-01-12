import { Component, Inject, OnInit, EventEmitter, Output, OnDestroy } from "@angular/core";
import { AdminBreadcrumb } from "../admin-breadcrumb/admin-breadcrumb.model";
import { AdminUserService } from "../services/admin-user.service";
import { AdminDeviceService } from "../services/admin-device.service";
import { DevicePagingService } from "../../services/device-paging.service";
import { UserPagingService } from "../../services/user-paging.service";
import { Subject, takeUntil } from "rxjs";
import { User } from "../admin-users/user";

@Component({
  selector: "admin-dashboard",
  templateUrl: "./admin-dashboard.html",
  styleUrls: ["./admin-dashboard.scss"],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @Output() onUserActivated = new EventEmitter<any>();
  @Output() onDeviceEnabled = new EventEmitter<any>();

  userSearch = "";
  userState = "inactive";

  deviceSearch = "";
  deviceState = "unregistered";

  stateAndData!: ReturnType<UserPagingService["constructDefault"]>;
  deviceStateAndData!: ReturnType<DevicePagingService["constructDefault"]>;

  inactiveUsers: Array<ReturnType<UserPagingService["users"]>[number]> = [];
  unregisteredDevices: Array<ReturnType<DevicePagingService["devices"]>[number]> = [];

  breadcrumbs: AdminBreadcrumb[] = [
    {
      title: "Dashboard",
      iconClass: "fa fa-dashboard",
    },
  ];

  private $state: any;
  private destroy$ = new Subject<void>();

  currentUser: User | null = null;

  constructor(
    private userService: AdminUserService,
    private deviceService: AdminDeviceService,
    private devicePagingService: DevicePagingService,
    private userPagingService: UserPagingService,
    @Inject("$injector") private $injector: any
  ) {
    this.$state = this.$injector.get("$state");
  }

  ngOnInit(): void {
    this.stateAndData = this.userPagingService.constructDefault();
    this.deviceStateAndData = this.devicePagingService.constructDefault();

    this.userService.myself$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });

    this.devicePagingService
      .refresh(this.deviceStateAndData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.unregisteredDevices = this.devicePagingService.devices(
          this.deviceStateAndData[this.deviceState]
        );
      });

    this.userPagingService
      .refresh(this.stateAndData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.inactiveUsers = this.userPagingService.users(
          this.stateAndData[this.userState]
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  count(): number {
    return this.userPagingService.count(this.stateAndData[this.userState]);
  }

  hasNext(): boolean {
    return this.userPagingService.hasNext(this.stateAndData[this.userState]);
  }

  next(): void {
    this.userPagingService
      .next(this.stateAndData[this.userState])
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.inactiveUsers = users;
      });
  }

  hasPrevious(): boolean {
    return this.userPagingService.hasPrevious(
      this.stateAndData[this.userState]
    );
  }

  previous(): void {
    this.userPagingService
      .previous(this.stateAndData[this.userState])
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.inactiveUsers = users;
      });
  }

  deviceCount(): number {
    return this.devicePagingService.count(
      this.deviceStateAndData[this.deviceState]
    );
  }

  hasNextDevice(): boolean {
    return this.devicePagingService.hasNext(
      this.deviceStateAndData[this.deviceState]
    );
  }

  nextDevice(): void {
    this.devicePagingService
      .next(this.deviceStateAndData[this.deviceState])
      .pipe(takeUntil(this.destroy$))
      .subscribe((devices) => {
        this.unregisteredDevices = devices;
      });
  }

  hasPreviousDevice(): boolean {
    return this.devicePagingService.hasPrevious(
      this.deviceStateAndData[this.deviceState]
    );
  }

  previousDevice(): void {
    this.devicePagingService
      .previous(this.deviceStateAndData[this.deviceState])
      .pipe(takeUntil(this.destroy$))
      .subscribe((devices) => {
        this.unregisteredDevices = devices;
      });
  }

  search(): void {
    this.userPagingService
      .search(this.stateAndData[this.userState], this.userSearch)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.inactiveUsers = users;
      });
  }

  searchDevices(): void {
    this.devicePagingService
      .search(this.deviceStateAndData[this.deviceState], this.deviceSearch)
      .pipe(takeUntil(this.destroy$))
      .subscribe((devices) => {
        this.unregisteredDevices = devices;
      });
  }

  iconClass(device: any): string {
    if (!device) return "";
    if (device.iconClass) return device.iconClass;

    const userAgent = (device.userAgent || "").toLowerCase();
    if (device.appVersion === "Web Client")
      return "fa fa-desktop admin-desktop-icon-xs";
    if (userAgent.includes("android"))
      return "fa fa-android admin-android-icon-xs";
    if (userAgent.includes("ios"))
      return "fa fa-apple admin-apple-icon-xs";
    return "fa fa-mobile admin-generic-icon-xs";
  }

  gotoUser(user: any): void {
    this.$state.go("admin.user", { userId: user.id });
  }

  gotoDevice(device: any): void {
    this.$state.go("admin.device", { deviceId: device.id });
  }

  hasPermission(permission: string): boolean {
    return this.currentUser?.role?.permissions?.includes(permission) || false;
  }

  activateUser(event: MouseEvent, user: any): void {
    event.stopPropagation();
    user.active = true;

    this.userService.updateUser(user.id, user, () => {
      this.userPagingService
        .refresh(this.stateAndData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.inactiveUsers = this.userPagingService.users(
            this.stateAndData[this.userState]
          );
        });

      this.onUserActivated.emit({ user });
    });
  }

  registerDevice(event: MouseEvent, device: any): void {
    event.stopPropagation();

    this.deviceService
      .updateDevice(device.id, { registered: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe((updatedDevice) => {
        this.devicePagingService
          .refresh(this.deviceStateAndData)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.unregisteredDevices = this.devicePagingService.devices(
              this.deviceStateAndData[this.deviceState]
            );
          });

        this.onDeviceEnabled.emit({ device: updatedDevice });
      });
  }
}
