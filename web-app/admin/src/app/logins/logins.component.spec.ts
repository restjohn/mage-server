import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { LoginsComponent } from './logins.component';

import { LoginService } from '../services/login.service';
import { UserPagingService } from '../services/user-paging.service';
import { DevicePagingService } from '../services/device-paging.service';

import { AdminUserService } from '../admin/services/admin-user.service';
import { AdminDeviceService } from '../admin/services/admin-device.service';
import { UiStateService } from '../admin/services/ui-state.service';

describe('LoginsComponent', () => {
  let component: LoginsComponent;
  let fixture: ComponentFixture<LoginsComponent>;

  const mockState = jasmine.createSpyObj<UiStateService>('StateService', ['go']);

  const mockLoginService = {
    query: jasmine
      .createSpy('query')
      .and.returnValue(of({ logins: [], next: undefined, prev: undefined }))
  };

  const mockUserPaging = {
    constructDefault: jasmine
      .createSpy('constructDefault')
      .and.returnValue({ all: {} }),
    refresh: jasmine.createSpy('refresh').and.returnValue(of(null)),
    users: jasmine.createSpy('users').and.returnValue([]),
    search: jasmine.createSpy('search').and.returnValue(of([]))
  };

  const mockDevicePaging = {
    constructDefault: jasmine
      .createSpy('constructDefault')
      .and.returnValue({ all: {} }),
    refresh: jasmine.createSpy('refresh').and.returnValue(of(null)),
    devices: jasmine.createSpy('devices').and.returnValue([]),
    search: jasmine.createSpy('search').and.returnValue(of([]))
  };

  const mockAdminUserService = {
    hasPermission: jasmine
      .createSpy('hasPermission')
      .and.callFake((p: string) => p === 'p1')
  };

  async function createComponent(init?: Partial<LoginsComponent>) {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LoginsComponent],
      providers: [
        { provide: UiStateService, useValue: mockState },
        { provide: LoginService, useValue: mockLoginService },
        { provide: UserPagingService, useValue: mockUserPaging },
        { provide: DevicePagingService, useValue: mockDevicePaging },
        { provide: AdminUserService, useValue: mockAdminUserService },
        { provide: AdminDeviceService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginsComponent);
    component = fixture.componentInstance;

    Object.assign(component, init || {});
    fixture.detectChanges();
  }

  beforeEach(() => {
    mockState.go.calls.reset();
    mockLoginService.query.calls.reset();

    mockUserPaging.constructDefault.calls.reset();
    mockUserPaging.refresh.calls.reset();
    mockUserPaging.users.calls.reset();
    mockUserPaging.search.calls.reset();

    mockDevicePaging.constructDefault.calls.reset();
    mockDevicePaging.refresh.calls.reset();
    mockDevicePaging.devices.calls.reset();
    mockDevicePaging.search.calls.reset();

    mockAdminUserService.hasPermission.calls.reset();
  });

  it('ngOnInit should set filter.user/device when userId/deviceId inputs are provided', fakeAsync(() => {
    createComponent({ userId: 'u1', deviceId: 'd1' } as any);
    tick();

    expect((component.filter as any).user).toEqual({ id: 'u1' } as any);
    expect((component.filter as any).device).toEqual({ id: 'd1' } as any);
  }));

  it('initUserSourceIfNeeded should NOT call paging when users list is provided', fakeAsync(() => {
    createComponent({ users: [{ displayName: 'A' } as any] } as any);
    tick();

    expect(mockUserPaging.constructDefault).not.toHaveBeenCalled();
    expect(mockUserPaging.refresh).not.toHaveBeenCalled();
  }));

  it('initUserSourceIfNeeded should call paging when users list empty and no userId', fakeAsync(() => {
    mockUserPaging.users.and.returnValue([{ displayName: 'Paged User' } as any]);

    createComponent({ users: [] } as any);
    tick();

    expect(mockUserPaging.constructDefault).toHaveBeenCalled();
    expect(mockUserPaging.refresh).toHaveBeenCalled();
    expect(component.users.length).toBe(1);
    expect(component.users[0].displayName).toBe('Paged User');
  }));

  it('initDeviceSourceIfNeeded should copy devices into loginDeviceSearchResults when devices provided', fakeAsync(() => {
    const devs = [{ uid: 'X' }, { uid: 'Y' }] as any[];
    createComponent({ devices: devs } as any);
    tick();

    expect(component.loginDeviceSearchResults).toEqual(devs);
    expect(mockDevicePaging.constructDefault).not.toHaveBeenCalled();
  }));

  it('initDeviceSourceIfNeeded should call device paging when devices not provided', fakeAsync(() => {
    mockDevicePaging.devices.and.returnValue([{ uid: 'Paged Device' } as any]);

    createComponent({ devices: [] } as any);
    tick();

    expect(mockDevicePaging.constructDefault).toHaveBeenCalled();
    expect(mockDevicePaging.refresh).toHaveBeenCalled();
    expect(component.loginDeviceSearchResults.length).toBe(1);
    expect((component.loginDeviceSearchResults[0] as any).uid).toBe('Paged Device');
  }));

  it('hasNext should be false for invalid next links and true for valid link', fakeAsync(() => {
    createComponent();
    tick();

    component.loginPage = { logins: [], next: 'null', prev: null } as any;
    expect(component.hasNext).toBe(false);

    component.loginPage = { logins: [], next: '   ', prev: null } as any;
    expect(component.hasNext).toBe(false);

    component.loginPage = { logins: [], next: 'http://next', prev: null } as any;
    expect(component.hasNext).toBe(true);
  }));

  it('hasPrev should be false when firstLogin missing, no logins, or invalid prev; true when conditions met', fakeAsync(() => {
    createComponent();
    tick();

    component.loginPage = { prev: 'http://prev', logins: [{ id: 'a' }] } as any;
    component.firstLogin = null as any;
    expect(component.hasPrev).toBe(false);

    component.firstLogin = { id: 'a' } as any;
    component.loginPage = { prev: 'http://prev', logins: [] } as any;
    expect(component.hasPrev).toBe(false);

    component.loginPage = { prev: 'null', logins: [{ id: 'b' }] } as any;
    expect(component.hasPrev).toBe(false);

    component.loginPage = { prev: 'http://prev', logins: [{ id: 'b' }] } as any;
    component.firstLogin = { id: 'a' } as any;
    expect(component.hasPrev).toBe(true);

    component.loginPage = { prev: 'http://prev', logins: [{ id: 'a' }] } as any;
    expect(component.hasPrev).toBe(false);
  }));

  it('pageLogin should not call loginService.query for invalid url', fakeAsync(() => {
    createComponent();
    tick();
    mockLoginService.query.calls.reset();

    component.pageLogin('   ');
    tick();

    expect(mockLoginService.query).not.toHaveBeenCalled();
  }));

  it('pageLogin should update loginPage for a non-empty next page', fakeAsync(() => {
    createComponent();
    tick();

    component.loginPage = { logins: [{ id: 'old' }], next: 'http://next', prev: null } as any;

    mockLoginService.query.and.returnValue(
      of({ logins: [{ id: 'new' }], next: 'http://next2', prev: 'http://prev2' })
    );

    component.pageLogin('http://next');
    tick();

    expect(component.loginPage!.logins[0].id).toBe('new');
    expect((component.loginPage as any).next).toBe('http://next2');
    expect((component.loginPage as any).prev).toBe('http://prev2');
  }));

  it('pageLogin should guard against server next leading to empty page and null out current loginPage.next', fakeAsync(() => {
    createComponent();
    tick();

    component.loginPage = { logins: [{ id: 'old' }], next: 'http://next', prev: null } as any;

    mockLoginService.query.and.returnValue(
      of({ logins: [], next: 'http://still-next', prev: 'http://prev' })
    );

    component.pageLogin('http://next');
    tick();

    expect(component.loginPage!.logins[0].id).toBe('old');
    expect((component.loginPage as any).next).toBeNull();
  }));

  it('filterLogins should call loadInitialLogins when no user/device/date filters selected', fakeAsync(() => {
    createComponent();
    tick();

    spyOn(component as any, 'loadInitialLogins').and.callThrough();

    component.user = null as any;
    component.device = [];
    component.login.startDate = null;
    component.login.endDate = null;

    component.filterLogins();
    tick();

    expect((component as any).loadInitialLogins).toHaveBeenCalled();
  }));

  it('filterLogins should set device filter from selected device[0].id, and endDate to end-of-day', fakeAsync(() => {
    createComponent();
    tick();

    const end = new Date('2025-12-17T10:00:00.000Z');
    component.user = { id: 'u2', displayName: 'User Two' } as any;
    component.device = [{ id: 'd2', uid: 'UID2' } as any];
    component.login.startDate = new Date('2025-12-01T00:00:00.000Z');
    component.login.endDate = end;

    mockLoginService.query.and.returnValue(of({ logins: [], next: null, prev: null }));

    component.filterLogins();
    tick();

    const passed = mockLoginService.query.calls.mostRecent().args[0];
    expect(passed.filter.user.id).toBe('u2');
    expect(passed.filter.device.id).toBe('d2');
    expect(passed.filter.startDate).toBe(component.login.startDate);

    expect(new Date(passed.filter.endDate).getTime()).not.toBe(end.getTime());
  }));

  it('onUserSearchChange should clear results and call filterLogins when term is cleared', fakeAsync(() => {
    createComponent();
    tick();

    spyOn(component, 'filterLogins').and.stub();

    component.loginSearchResults = [{ displayName: 'x' } as any];
    component.onUserSearchChange('');
    tick();

    expect(component.loginSearchResults).toEqual([]);
    expect(component.filterLogins).toHaveBeenCalled();
  }));

  it('searchLoginsAgainstUsers should use pagingService.search when userStateAndData is set', fakeAsync(() => {
    createComponent();
    tick();

    (component as any).userStateAndData = { all: {} } as any;

    mockUserPaging.search.and.returnValue(of([{ displayName: 'U1' } as any, { displayName: 'U2' } as any]));

    component.searchLoginsAgainstUsers('abc');
    tick();

    expect(mockUserPaging.search).toHaveBeenCalledWith((component as any).userStateAndData.all, 'abc');
    expect(component.loginSearchResults.length).toBe(2);
  }));

  it('searchLoginsAgainstUsers should set first 10 users when searchString empty or ".*" (local list branch)', fakeAsync(() => {
    createComponent({
      users: Array.from({ length: 12 }).map((_, i) => ({ displayName: `User${i}` } as any))
    } as any);
    tick();

    (component as any).userStateAndData = null;

    component.searchLoginsAgainstUsers(null);
    tick();
    expect(component.loginSearchResults.length).toBe(10);

    component.searchLoginsAgainstUsers('.*');
    tick();
    expect(component.loginSearchResults.length).toBe(10);
  }));

  it('onDeviceSearchChange should use devicePagingService.search when deviceStateAndData exists', fakeAsync(() => {
    createComponent();
    tick();

    (component as any).deviceStateAndData = { all: {} } as any;

    mockDevicePaging.search.and.returnValue(of([{ uid: 'A' }, { uid: 'B' }] as any));
    component.onDeviceSearchChange('term');
    tick();

    expect(mockDevicePaging.search).toHaveBeenCalled();
    expect(component.loginDeviceSearchResults.length).toBe(2);
  }));

  it('onDeviceSearchChange should filter local devices by uid/userAgent when no paging state exists', fakeAsync(() => {
    createComponent({
      devices: [
        { uid: 'ABC', userAgent: 'iOS Something' } as any,
        { uid: 'ZZZ', userAgent: 'Android Something' } as any
      ] as any
    } as any);
    tick();

    (component as any).deviceStateAndData = null;

    component.onDeviceSearchChange('ab');
    tick();
    expect(component.loginDeviceSearchResults.length).toBe(1);
    expect((component.loginDeviceSearchResults[0] as any).uid).toBe('ABC');

    component.onDeviceSearchChange('android');
    tick();
    expect(component.loginDeviceSearchResults.length).toBe(1);
    expect((component.loginDeviceSearchResults[0] as any).uid).toBe('ZZZ');
  }));

  it('selectUser should set user, userText, clear results, and call filterLogins', fakeAsync(() => {
    createComponent();
    tick();

    spyOn(component, 'filterLogins').and.stub();

    component.loginSearchResults = [{ displayName: 'x' } as any];
    component.selectUser({ id: 'u1', displayName: 'Name' } as any);

    expect(component.userText).toBe('Name');
    expect(component.loginSearchResults).toEqual([]);
    expect(component.filterLogins).toHaveBeenCalled();
  }));

  it('selectDevice should set device/deviceText, clear device results, and call filterLogins', fakeAsync(() => {
    createComponent();
    tick();

    spyOn(component, 'filterLogins').and.stub();

    component.loginDeviceSearchResults = [{ uid: 'x' } as any];
    component.selectDevice({ id: 'd1', uid: 'UID1' } as any);

    expect(component.device.length).toBe(1);
    expect(component.deviceText).toBe('UID1');
    expect(component.loginDeviceSearchResults).toEqual([]);
    expect(component.filterLogins).toHaveBeenCalled();
  }));

  it('clearUserFilter and clearDeviceFilter should reset and call filterLogins when no locked ids', fakeAsync(() => {
    createComponent();
    tick();

    spyOn(component, 'filterLogins').and.stub();

    component.user = { id: 'u' } as any;
    component.userText = 'x';
    component.device = [{ id: 'd' } as any];
    component.deviceText = 'y';

    component.clearUserFilter();
    component.clearDeviceFilter();

    expect(component.user).toBeNull();
    expect(component.userText).toBe('');
    expect(component.device.length).toBe(0);
    expect(component.deviceText).toBe('');
    expect(component.filterLogins).toHaveBeenCalled();
  }));

  it('gotoUser and gotoDevice should call state.go with correct params', fakeAsync(() => {
    createComponent();
    tick();

    component.gotoUser({ id: 'u99' } as any);
    component.gotoDevice({ id: 'd99' } as any);

    expect(mockState.go).toHaveBeenCalledWith('admin.user', { userId: 'u99' });
    expect(mockState.go).toHaveBeenCalledWith('admin.device', { deviceId: 'd99' });
  }));

  it('iconClass should handle null device and device.iconClass override', fakeAsync(() => {
    createComponent();
    tick();

    expect(component.iconClass(null as any)).toBe('');

    expect(component.iconClass({ iconClass: 'custom-class' } as any)).toBe('custom-class');
  }));

  it('displayUser/displayDevice should return empty string when missing fields', fakeAsync(() => {
    createComponent();
    tick();

    expect(component.displayUser(null as any)).toBe('');
    expect(component.displayUser({} as any)).toBe('');

    expect(component.displayDevice(null as any)).toBe('');
    expect(component.displayDevice({} as any)).toBe('');
  }));

  it('hasPermission should delegate to AdminUserService.hasPermission', fakeAsync(() => {
    createComponent();
    tick();

    expect(component.hasPermission('p1')).toBeTrue();
    expect(component.hasPermission('nope')).toBeFalse();

    expect(mockAdminUserService.hasPermission).toHaveBeenCalledWith('p1');
    expect(mockAdminUserService.hasPermission).toHaveBeenCalledWith('nope');
  }));
});
