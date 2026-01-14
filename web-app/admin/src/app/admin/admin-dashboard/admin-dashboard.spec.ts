import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from "@angular/core";
import { of } from "rxjs";

import { AdminDashboardComponent } from "./admin-dashboard";
import { AdminBreadcrumbModule } from "../admin-breadcrumb/admin-breadcrumb.module";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { MatBadgeModule } from "@angular/material/badge";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatNativeDateModule } from "@angular/material/core";
import { MatTableModule } from "@angular/material/table";

import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";

import { AdminUserService } from "../services/admin-user.service";
import { AdminDeviceService } from "../services/admin-device.service";
import { DevicePagingService } from "../../services/device-paging.service";
import { UserPagingService } from "../../services/user-paging.service";

const TEST_USERS: any[] = [
  {
    id: "1",
    username: "ranma77",
    displayName: "Ranma Saotome",
    active: true,
    enabled: true,
    authentication: "LOCAL",
    createdAt: new Date().toDateString(),
    lastUpdated: new Date().toDateString(),
    recentEventIds: [],
    role: {
      id: "Test",
      name: "martial artist",
      permissions: [],
    },
    email: "ranma@example.com",
    phones: [],
  },
  {
    id: "2",
    username: "yusuke23",
    displayName: "Yusuke Urameshi",
    active: true,
    enabled: true,
    authentication: "LOCAL",
    createdAt: new Date().toDateString(),
    lastUpdated: new Date().toDateString(),
    recentEventIds: [],
    role: {
      id: "Test",
      name: "spirit detective",
      permissions: [],
    },
    email: "yusuke@example.com",
    phones: [],
  },
  {
    id: "3",
    username: "goku_saiyan",
    displayName: "Goku",
    active: true,
    enabled: true,
    authentication: "LOCAL",
    createdAt: new Date().toDateString(),
    lastUpdated: new Date().toDateString(),
    recentEventIds: [],
    role: {
      id: "Test",
      name: "saiyan warrior",
      permissions: [],
    },
    email: "goku@example.com",
    phones: [],
  },
];

const TEST_DEVICES: any[] = [
  {
    id: "d1",
    uid: "Ranma's Phone",
    registered: true,
    appVersion: "Web Client",
    userAgent: "",
    iconClass: "",
  },
  {
    id: "d2",
    uid: "Yusuke's Spirit Detector Device",
    registered: true,
    appVersion: "mobile",
    userAgent: "iOS",
    iconClass: "",
  },
  {
    id: "d3",
    uid: "Goku's Dragon Radar",
    registered: false,
    appVersion: "mobile",
    userAgent: "android",
    iconClass: "",
  },
];

const mockUserService: Partial<AdminUserService> & any = {
  myself$: of({
    id: "me",
    role: { permissions: ["test.permission"] },
  }),
  updateUser: jasmine.createSpy("updateUser"),
};

const mockDeviceService: Partial<AdminDeviceService> & any = {
  updateDevice: jasmine.createSpy("updateDevice").and.callFake((_id: string, patch: any) => {
    const updated = { ...TEST_DEVICES[0], ...patch };
    return of(updated);
  }),
};

const userStateAndData = {
  inactive: {},
};

const deviceStateAndData = {
  unregistered: {},
};

const mockUserPagingService: Partial<UserPagingService> & any = {
  constructDefault: jasmine.createSpy("constructDefault").and.returnValue(userStateAndData),
  refresh: jasmine.createSpy("refresh").and.returnValue(of([])),
  users: jasmine.createSpy("users").and.callFake((_state: any) => TEST_USERS),
  count: jasmine.createSpy("count").and.returnValue(TEST_USERS.length),
  hasNext: jasmine.createSpy("hasNext").and.returnValue(true),
  hasPrevious: jasmine.createSpy("hasPrevious").and.returnValue(false),
  next: jasmine.createSpy("next").and.returnValue(of([TEST_USERS[1]])),
  previous: jasmine.createSpy("previous").and.returnValue(of([TEST_USERS[0]])),
  search: jasmine.createSpy("search").and.callFake((_state: any, term: string) => {
    return of(
      TEST_USERS.filter((u) =>
        (u.displayName || "").toLowerCase().includes((term || "").toLowerCase())
      )
    );
  }),
};

const mockDevicePagingService: Partial<DevicePagingService> & any = {
  constructDefault: jasmine.createSpy("constructDefault").and.returnValue(deviceStateAndData),
  refresh: jasmine.createSpy("refresh").and.returnValue(of([])),
  devices: jasmine.createSpy("devices").and.callFake((_state: any) => TEST_DEVICES),
  count: jasmine.createSpy("count").and.returnValue(TEST_DEVICES.length),
  hasNext: jasmine.createSpy("hasNext").and.returnValue(true),
  hasPrevious: jasmine.createSpy("hasPrevious").and.returnValue(false),
  next: jasmine.createSpy("next").and.returnValue(of([TEST_DEVICES[1]])),
  previous: jasmine.createSpy("previous").and.returnValue(of([TEST_DEVICES[0]])),
  search: jasmine.createSpy("search").and.callFake((_state: any, term: string) => {
    return of(
      TEST_DEVICES.filter((d) =>
        (d.uid || "").toString().toLowerCase().includes((term || "").toLowerCase())
      )
    );
  }),
};

describe("AdminDashboardComponent", () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminDashboardComponent],
      imports: [
        CommonModule,
        FormsModule,
        RouterTestingModule, // ✅ add
        MatToolbarModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatListModule,
        MatBadgeModule,
        MatSelectModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatNativeDateModule,
        MatTableModule,
        AdminBreadcrumbModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AdminUserService, useValue: mockUserService },
        { provide: AdminDeviceService, useValue: mockDeviceService },
        { provide: DevicePagingService, useValue: mockDevicePagingService },
        { provide: UserPagingService, useValue: mockUserPagingService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, "navigate").and.returnValue(Promise.resolve(true)); // ✅ spy

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call paging refresh in ngOnInit and populate lists", fakeAsync(() => {
    tick();
    expect(mockUserPagingService.refresh).toHaveBeenCalled();
    expect(mockDevicePagingService.refresh).toHaveBeenCalled();
    expect(component.inactiveUsers.length).toBe(TEST_USERS.length);
    expect(component.unregisteredDevices.length).toBe(TEST_DEVICES.length);
  }));

  it("should navigate to user and device", () => {
    component.gotoUser(TEST_USERS[0]);
    expect(router.navigate).toHaveBeenCalledWith(["/admin/users", TEST_USERS[0].id]);

    component.gotoDevice(TEST_DEVICES[0]);
    expect(router.navigate).toHaveBeenCalledWith(["/admin/devices", TEST_DEVICES[0].id]);
  });

  it("should activate user and emit event", fakeAsync(() => {
    const user = { ...TEST_USERS[0], active: false };
    component.onUserActivated = new EventEmitter();
    spyOn(component.onUserActivated, "emit");

    mockUserService.updateUser.and.callFake((_id: string, _user: any, cb: Function) => cb());

    component.activateUser(new MouseEvent("click"), user);
    tick();

    expect(user.active).toBeTrue();
    expect(component.onUserActivated.emit).toHaveBeenCalledWith({ user });
  }));

  it("should register device and emit event", fakeAsync(() => {
    const device = { ...TEST_DEVICES[0], registered: false };
    component.onDeviceEnabled = new EventEmitter();
    spyOn(component.onDeviceEnabled, "emit");

    component.registerDevice(new MouseEvent("click"), device);
    tick();

    expect(mockDeviceService.updateDevice).toHaveBeenCalledWith(device.id, { registered: true });
    expect(component.onDeviceEnabled.emit).toHaveBeenCalledWith({
      device: jasmine.objectContaining({ id: "d1", registered: true }),
    });
  }));

  it("should return true if user has permission", () => {
    expect(component.hasPermission("test.permission")).toBeTrue();
    expect(component.hasPermission("other.permission")).toBeFalse();
  });

  it("should search users", fakeAsync(() => {
    component.userSearch = "Ranma Saotome";
    component.search();
    tick();
    expect(component.inactiveUsers).toEqual([TEST_USERS[0]]);
  }));

  it("should search devices", fakeAsync(() => {
    component.deviceSearch = "Yusuke's Spirit Detector Device";
    component.searchDevices();
    tick();
    expect(component.unregisteredDevices).toEqual([TEST_DEVICES[1]]);
  }));

  it("should handle previous and next user pages", fakeAsync(() => {
    expect(component.hasNext()).toBeTrue();
    expect(component.hasPrevious()).toBeFalse();

    component.next();
    tick();
    expect(component.inactiveUsers).toEqual([TEST_USERS[1]]);

    component.previous();
    tick();
    expect(component.inactiveUsers).toEqual([TEST_USERS[0]]);
  }));

  it("should handle previous and next device pages", fakeAsync(() => {
    expect(component.hasNextDevice()).toBeTrue();
    expect(component.hasPreviousDevice()).toBeFalse();

    component.nextDevice();
    tick();
    expect(component.unregisteredDevices).toEqual([TEST_DEVICES[1]]);

    component.previousDevice();
    tick();
    expect(component.unregisteredDevices).toEqual([TEST_DEVICES[0]]);
  }));

  it("should set icon classes correctly", () => {
    expect(component.iconClass(TEST_DEVICES[0])).toContain("desktop");
    expect(component.iconClass(TEST_DEVICES[2])).toContain("android");
    expect(component.iconClass(TEST_DEVICES[1])).toContain("apple");
    expect(component.iconClass({ ...TEST_DEVICES[1], userAgent: "mobile" })).toContain("mobile");
    expect(component.iconClass(null as any)).toEqual("");
  });
});
