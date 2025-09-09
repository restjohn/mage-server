import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Inject,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { StateService } from '@uirouter/angular';
import { LocalStorageService } from 'admin/src/app/upgrade/ajs-upgraded-providers';
import { UserService } from 'admin/src/app/upgrade/ajs-upgraded-providers';
import { UserPagingService } from 'admin/src/app/upgrade/ajs-upgraded-providers';
import { DeleteUserComponent } from '../delete-user/delete-user.component';
import { User } from 'core-lib-src/user';
import { CreateUserModalComponent } from '../create-user/create-user.component';
import { Role } from '../user';
import { BulkUserComponent } from '../bulk-user/bulk-user.component';
import { TeamsService } from '../../admin-teams/teams-service';
import { Team } from '../../admin-teams/team';

@Component({
  selector: 'admin-users',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  users: User[] = []; // Displayed users
  dataSource: User[] = []; // Used in *ngFor for the table
  displayedColumns: string[] = ['user', 'actions'];

  userSearch: string = '';

  totalUsers = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  token: string;
  error: string | null = null;

  hasUserCreatePermission = false;
  hasUserEditPermission = false;
  hasUserDeletePermission = false;

  private $state: any;
  stateAndData: any;

  roles: Role[] = [];
  teams: Team[] = [];

  @Output() onUserActivated = new EventEmitter<any>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private localStorageService: LocalStorageService,
    private stateService: StateService,
    @Inject(TeamsService) private teamService: TeamsService,
    @Inject(UserService) private userService,
    @Inject(UserPagingService) private userPagingService,
    @Inject('$injector') private $injector: any
  ) {
    this.token = this.localStorageService.getToken();
    this.stateAndData = this.userPagingService.constructDefault();
    this.$state = this.$injector.get('$state');
  }

  ngOnInit(): void {
    this.initPermissions();
    this.refreshUsers();
    this.loadRoles();
    this.fetchTeams();
  }

  private initPermissions(): void {
    const permissions = this.userService.myself.role?.permissions || [];
    this.hasUserCreatePermission = permissions.includes('CREATE_USER');
    this.hasUserEditPermission = permissions.includes('UPDATE_USER');
    this.hasUserDeletePermission = permissions.includes('DELETE_USER');
  }

  private loadRoles(): void {
    this.userService.getRoles().then((roles: any[]) => {
      this.roles = roles;
    });
  }

  private fetchTeams(): void {
    this.teamService
      .getTeams({
        limit: 9999,
        sort: { name: 1 },
        omit_event_teams: true
      })
      .subscribe((results) => {
        if (results?.length > 0) {
          const teams = results[0];
          this.teams = teams.items;
        }
      });
  }

refreshUsers(): void {
    const state = this.stateAndData['all'];
    state.pageSize = this.pageSize;
    state.pageIndex = this.pageIndex;

    this.userPagingService.refresh(this.stateAndData).then(() => {
      const users = this.userPagingService.users(state);
      this.users = users;
      this.dataSource = users;
      this.totalUsers = state.pageInfo.totalCount || 0;

      console.log('Refreshed users:', this.users.length);
      console.log('Total users from backend:', this.totalUsers);
    });
  }

  onSearchTermChanged(term: string): void {
    this.userSearch = term;
    this.search();
  }

  onSearchCleared(): void {
    this.userSearch = '';
    this.refreshUsers();
  }

  search(): void {
    this.userPagingService
      .search(this.stateAndData['all'], this.userSearch)
      .then((users) => {
        this.users = users;
        this.dataSource = users;
        this.totalUsers =
          this.stateAndData['all'].pageInfo.totalCount || users.length;
      });
  }

  reset(): void {
    this.userSearch = '';
    this.stateAndData = this.userPagingService.constructDefault();
    this.pageIndex = 0;
    this.refreshUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.refreshUsers();
  }

  newUser(): void {
    this.router.navigate(['/admin/create-user']);
  }

  bulkImport(): void {
    this.router.navigate(['/admin/bulk-user']);
  }

  gotoUser(user: User): void {
    this.$state.go('admin.user', { userId: user.id });
  }

  createUser(): void {
    const dialogRef = this.dialog.open(CreateUserModalComponent, {
      width: '80%',
      disableClose: true,
      data: {
        roles: this.roles
      }
    });

    dialogRef.afterClosed().subscribe((newUser) => {
      if (newUser?.confirmed) {
        const error = (response: any) => {
          console.error(response);
        };
        this.userService.createUser(newUser.user, error).then(() => {
          this.refreshUsers();
        });
      }
    });
  }

  openImportModal(): void {
    const dialogRef = this.dialog.open(BulkUserComponent, {
      width: '80vw',
      data: {
        roles: this.roles,
        teams: this.teams
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.users?.length) {
        this.bulkCreateUsers(result.users).then((createdUsers) => {
          if (result.selectedTeam) {
            createdUsers.forEach((u) => {
              this.teamService
                .addUserToTeam(result.selectedTeam.id, u)
                .subscribe();
            });
          }
        });
      }
    });
  }

  async bulkCreateUsers(users: any[]): Promise<User[]> {
    const usersAdded: User[] = [];

    const promises = users.map((userData) => {
      return new Promise<void>((resolve) => {
        const success = (ret: any) => {
          usersAdded.push(ret);
          resolve();
        };
        const error = (err: any) => {
          console.error(`Failed to create user ${userData.username}`, err);
          resolve();
        };

        this.userService.createUser(userData, success, error);
      });
    });

    await Promise.allSettled(promises);
    this.refreshUsers();
    return usersAdded;
  }

  editUser(event: MouseEvent, user: User): void {
    event.stopPropagation();
    this.stateService.go('admin.editUser', { userId: user.id });
  }

  deleteUser(event: MouseEvent, user: User): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(DeleteUserComponent, {
      data: { user }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.userService.deleteUser(user).then(() => {
          this.refreshUsers();
        });
      }
    });
  }

  activateUser(event: MouseEvent, user: User): void {
    event.stopPropagation();

    user.active = true;
    this.userService.updateUser(user.id, user).then({
      next: () => {
        this.refreshUsers();
        this.onUserActivated.emit({ user });
      },
      error: (err) => {
        this.error = err?.message || 'Failed to activate user';
      }
    });
  }

  enableUser(event: MouseEvent, user: User): void {
    event.stopPropagation();

    user.enabled = true;
    this.userService.updateUser(user.id, user).then(() => {
      this.refreshUsers();
    });
  }
}
