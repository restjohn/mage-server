import { Component, Inject, OnInit } from '@angular/core';
import { StateService } from '@uirouter/angular';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '../../../upgrade/ajs-upgraded-providers';
import { TeamsService } from '../teams-service';
import { EventsService } from '../../admin-event/events.service';
import { Team } from '../team';
import { User } from '@ngageoint/mage.web-core-lib/user';
import { Event } from 'src/app/filter/filter.types';
import { DeleteTeamComponent } from '../delete-team/delete-team.component';
import { CardActionButton } from '../../../core/card-navbar/card-navbar.component';
import { SearchModalComponent, SearchModalData, SearchModalResult, SearchModalColumn } from '../search-modal/search-modal.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'mage-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss']
})
export class TeamDetailsComponent implements OnInit {
  team: Team;
  teamId: string;
  hasUpdatePermission = false;
  hasDeletePermission = false;

  editingDetails = false;

  // Form values for editing
  editForm = {
    name: '',
    description: ''
  };

  loadingMembers = true;
  membersPageIndex = 0;
  membersPageSize = 5;
  memberSearchTerm: string;

  // Material table properties for members
  membersDataSource = new MatTableDataSource<User>();
  membersDisplayedColumns = ['content'];
  totalMembers = 0;
  pageSizeOptions = [5, 10, 25];

  loadingEvents = true;
  teamEvents: Event[] = [];
  teamEventsPage = 0;
  eventsPerPage = 5;
  eventSearch: string;
  teamEventSearch: string;

  filteredEvents: Event[] = [];

  // Material table properties for events
  eventsDataSource = new MatTableDataSource<Event>();
  eventsDisplayedColumns = ['content'];
  totalEvents = 0;
  eventsPageSize = 5;

  actionButtons: CardActionButton[] = [];
  memberActionButtons: CardActionButton[] = [];
  eventActionButtons: CardActionButton[] = [];

  private updateActionButtons(): void {
    this.actionButtons = [];
    this.memberActionButtons = [];
    this.eventActionButtons = [];

    if (this.hasUpdatePermission) {
      this.actionButtons.push({
        label: this.editingDetails ? 'Cancel' : 'Edit',
        action: () => this.toggleEditDetails(),
        type: this.editingDetails ? 'primary' : 'secondary'
      });

      this.memberActionButtons.push({
        label: 'Add Member',
        action: () => this.addMember(),
        type: 'primary'
      });

      this.eventActionButtons.push({
        label: 'Add Event',
        action: () => this.addEventToTeam(),
        type: 'primary'
      });
    }
  }

  constructor(
    private stateService: StateService,
    private dialog: MatDialog,
    @Inject(UserService) private UserService,
    @Inject(TeamsService) private teamService: TeamsService,
    @Inject(EventsService) private eventsService: EventsService
  ) { }

  ngOnInit(): void {
    this.teamId = this.stateService.params.teamId;
    if (this.teamId) {
      this.teamService.getTeamById(this.teamId).subscribe((team: Team) => {
        this.team = team;

        const myAccess = this.team.acl[this.UserService.myself.id];
        const aclPermissions = myAccess ? myAccess.permissions : [];

        this.hasUpdatePermission = this.UserService.myself.role.permissions.includes('UPDATE_TEAM') || aclPermissions.includes('update');
        this.hasDeletePermission = this.UserService.myself.role.permissions.includes('DELETE_TEAM') || aclPermissions.includes('delete');

        this.updateActionButtons();
        this.getMembers();
        this.getTeamEvents();
      });
    }
  }

  getMembers(): void {
    if (!this.team?.id) {
      return;
    }

    this.teamService.getMembers({
      id: this.team.id,
      term: this.memberSearchTerm,
      page: this.membersPageIndex,
      page_size: this.membersPageSize
    }).subscribe({
      next: (results) => {
        this.loadingMembers = false;
        this.membersDataSource.data = results.items || [];
        this.totalMembers = results.totalCount || 0;
      },
      error: (error) => {
        this.loadingMembers = false;
        console.error('Error fetching members:', error);
        this.membersDataSource.data = [];
        this.totalMembers = 0;
      }
    });
  }

  getTeamEvents(): void {
    this.eventsService.getEvents({
      term: this.teamEventSearch,
      teamId: this.teamId,
      page: this.teamEventsPage,
      page_size: this.eventsPerPage
    }).subscribe((results) => {
      this.loadingEvents = false;
      this.teamEvents = results.items || [];
      this.eventsDataSource.data = results.items || [];
      this.totalEvents = results.totalCount || 0;
    });
  }

  getNonTeamEvents(): void {
    this.eventsService.getEvents({
      term: '',
      teamId: this.teamId,
      page: 0,
      page_size: 1000
    }).subscribe((results) => {
    });
  }

  onMembersPageChange(event: PageEvent): void {
    this.membersPageSize = event.pageSize;
    this.membersPageIndex = event.pageIndex;
    this.getMembers();
  }

  onMembersSearchChange(searchTerm: string = ''): void {
    this.membersPageIndex = 0;
    this.memberSearchTerm = searchTerm;
    this.getMembers();
  }

  toggleEditDetails(): void {
    if (!this.editingDetails) {
      this.editForm.name = this.team.name;
      this.editForm.description = this.team.description;
    }
    this.editingDetails = !this.editingDetails;
    this.updateActionButtons();
  }

  saveTeamDetails(): void {
    const name = this.editForm.name;
    const description = this.editForm.description;

    this.teamService.editTeam(this.team.id, {
      name: name,
      description: description
    }).subscribe((updatedTeam: Team) => {
      this.team = updatedTeam;
      this.editingDetails = false;
      this.updateActionButtons();
    });
  }

  cancelEditDetails(): void {
    this.editingDetails = false;
    this.updateActionButtons();

    this.editForm.name = this.team?.name;
    this.editForm.description = this.team?.description;
  }

  goToTeams(): void {
    this.stateService.go('admin.teams');
  }

  addMember(): void {
    const dialogRef = this.dialog.open(SearchModalComponent, {
      panelClass: 'search-modal-dialog',
      data: {
        title: 'Add Members to Team',
        searchPlaceholder: 'Search for users to add...',
        type: 'members',
        teamId: this.team?.id,
        searchFunction: (searchTerm: string, page: number, pageSize: number): Observable<any> => {
          return this.teamService.getNonMembers({
            id: this.team?.id || '',
            term: searchTerm,
            page: page,
            page_size: pageSize
          });
        },
        columns: [
          {
            key: 'name',
            label: 'Name',
            displayFunction: (user: User) => user.username || 'Unknown',
            width: '40%'
          },
          {
            key: 'displayName',
            label: 'Display Name',
            displayFunction: (user: User) => user.displayName || 'Unknown',
            width: '35%'
          },
          {
            key: 'email',
            label: 'Email',
            displayFunction: (user: User) => user.email || 'No email provided',
            width: '35%'
          }
        ] as SearchModalColumn[]
      } as SearchModalData
    });

    dialogRef.afterClosed().subscribe((result: SearchModalResult) => {
      if (result && result.selectedItem) {
        console.log('Selected user to add:', result.selectedItem);
        this.teamService.addUserToTeam(this.team.id, result.selectedItem).subscribe({
          next: () => {
            this.getMembers();
          }
        });
      }
    });
  }

  removeMember($event: MouseEvent, user: User): void {
    $event.stopPropagation();
    this.teamService.removeMember(this.team.id, user.id).subscribe({
      next: () => {
        this.getMembers();
      },
      error: (error) => {
        console.error('Error removing member:', error);
      }
    });
  }

  goToUserProfile(user: User): void {
    this.stateService.go('admin.user', { userId: user.id });
  }

  goToAccess(): void {
    this.stateService.go('admin.teamAccess', { teamId: this.team.id });
  }

  addEventToTeam(): void {
    const dialogRef = this.dialog.open(SearchModalComponent, {
      panelClass: 'search-modal-dialog',
      data: {
        title: 'Add Events to Team',
        searchPlaceholder: 'Search for events to add...',
        type: 'events',
        searchFunction: (searchTerm: string, page: number, pageSize: number): Observable<any> => {
          return this.eventsService.getEvents({
            term: searchTerm,
            page: page,
            page_size: pageSize,
          });
        },
        columns: [
          {
            key: 'name',
            label: 'Event Name',
            displayFunction: (event: any) => event.name || 'Unnamed Event',
            width: '50%'
          },
          {
            key: 'description',
            label: 'Description',
            displayFunction: (event: any) => event.description || 'No description',
            width: '50%'
          }
        ] as SearchModalColumn[]
      } as SearchModalData
    });

    dialogRef.afterClosed().subscribe((result: SearchModalResult) => {
      if (result && result.selectedItem) {
        console.log('Selected event to add:', result.selectedItem);
        // TODO: Implement adding events to team
        // For now, just refresh the events list
        this.getTeamEvents();
      }
    });
  }

  removeEventFromTeam($event: MouseEvent, event: Event): void {
    $event.stopPropagation();
    this.eventsService.removeEvent(event.id.toString()).subscribe({
      next: () => {
        this.getTeamEvents();
      },
      error: (error) => {
        console.error('Error removing event:', error);
      }
    });
  }

  goToEventPage(event: Event): void {
    this.stateService.go('admin.event', { eventId: event.id });
  }

  deleteTeam(): void {
    const dialogRef = this.dialog.open(DeleteTeamComponent, {
      data: { team: this.team },
      width: '40rem'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.stateService.go('admin.teams');
      }
    });
  }

  onEventsPageChange(event: PageEvent): void {
    this.eventsPageSize = event.pageSize;
    this.teamEventsPage = event.pageIndex;
    this.getTeamEvents();
  }

  onTeamEventSearchChange(searchTerm?: string): void {
    this.teamEventsPage = 0;
    this.teamEventSearch = searchTerm;
    this.getTeamEvents();
  }
}
