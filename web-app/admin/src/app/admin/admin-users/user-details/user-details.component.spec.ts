import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StateService } from '@uirouter/angular';
import { UserDetailsComponent } from './user-details.component';
import {
  UserService,
  LoginService,
  DevicePagingService,
  Team
} from '../../../upgrade/ajs-upgraded-providers';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;

  const mockStateService = {
    params: { userId: 'test-user-id' },
    go: jasmine.createSpy('go')
  };

  const mockUserService = {
    myself: { role: { permissions: ['UPDATE_USER', 'DELETE_USER'] } },
    getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({
      id: 'test-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
      active: true,
      enabled: true,
      phones: [{ number: '123-456-7890' }],
      role: 'USER_ROLE',
      authentication: { type: 'local' }
    })),
    updateUser: jasmine.createSpy('updateUser')
  };

  const mockLoginService = {
    query: jasmine.createSpy('query').and.returnValue(Promise.resolve({
      logins: []
    }))
  };

  const mockDevicePagingService = {
    constructDefault: jasmine.createSpy('constructDefault').and.returnValue({}),
    refresh: jasmine.createSpy('refresh').and.returnValue(Promise.resolve()),
    devices: jasmine.createSpy('devices').and.returnValue([]),
    search: jasmine.createSpy('search').and.returnValue(Promise.resolve([]))
  };

  const mockTeam = {
    addUser: jasmine.createSpy('addUser'),
    removeUser: jasmine.createSpy('removeUser')
  };

  const mockDialog = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [UserDetailsComponent],
      providers: [
        { provide: StateService, useValue: mockStateService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: UserService, useValue: mockUserService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: DevicePagingService, useValue: mockDevicePagingService },
        { provide: Team, useValue: mockTeam }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', async () => {
    await component.ngOnInit();
    expect(mockUserService.getUser).toHaveBeenCalledWith('test-user-id');
  });

  it('should check user permissions', () => {
    component.ngOnInit();
    expect(component.hasUserEditPermission).toBe(true);
    expect(component.hasUserDeletePermission).toBe(true);
  });
});
