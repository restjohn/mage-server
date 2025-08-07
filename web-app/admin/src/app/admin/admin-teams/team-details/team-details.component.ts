import { Component, Inject, OnInit } from '@angular/core';
import { StateService } from '@uirouter/angular';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../upgrade/ajs-upgraded-providers';
import { TeamsService } from '../teams-service';
import { EventsService } from '../../admin-event/events.service';
import { Team } from '../team';
import { DeleteTeamComponent } from '../delete-team/delete-team.component';
import { CardActionButton } from '../../../core/card-navbar/card-navbar.component';

interface Page<T> {
  items: T[];
  totalCount: number;
}

interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
}

interface TeamModel {
  id: string;
  name: string;
  description: string;
  userIds: string[];
  acl: any;
  $save: (params: any, callback: (team: TeamModel) => void) => void;
}

interface EventModel {
  id: string;
  name: string;
  description: string;
  teams: any[];
}

@Component({
  selector: 'mage-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss']
})
export class TeamDetailsComponent implements OnInit {
  team: TeamModel;
  teamId: string;
  hasUpdatePermission = false;
  hasDeletePermission = false;

  edit = false;
  editEvent = false;
  editingDetails = false;

  // Form values for editing
  editForm = {
    name: '',
    description: ''
  };

  loadingMembers = false;
  membersPageIndex = 0;
  membersPageSize = 5;
  membersPage: Page<User> = {
    items: [],
    totalCount: 0
  };
  memberSearchTerm: string;

  loadingNonMembers = false;
  nonMembersPageIndex = 0;
  nonMembersPageSize = 5;
  nonMembersPage: Page<User> = {
    items: [],
    totalCount: 0
  };
  nonMemberSearchTerm: string;

  teamEvents: EventModel[] = [];
  nonTeamEvents: EventModel[] = [];
  teamEventsPage = 0;
  nonTeamEventsPage = 0;
  eventsPerPage = 5;
  eventSearch: string;
  teamEventSearch: string;

  filteredEvents: EventModel[] = [];
  filteredNonTeamEvents: EventModel[] = [];

  actionButtons: CardActionButton[] = [{
    label: 'Edit',
    action: () => this.edit = true,
    type: 'primary'
  }];

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
      this.teamService.getTeamById(this.teamId).subscribe((team: TeamModel) => {
        console.log('Team details:', team);
        this.team = team;

        const myAccess = this.team.acl[this.UserService.myself.id];
        const aclPermissions = myAccess ? myAccess.permissions : [];

        this.hasUpdatePermission = this.UserService.myself.role.permissions.includes('UPDATE_TEAM') || aclPermissions.includes('update');
        this.hasDeletePermission = this.UserService.myself.role.permissions.includes('DELETE_TEAM') || aclPermissions.includes('delete');
      });

      this.getMembersPage();
      // TODO: Replace non members page with modal
      this.getNonMembersPage();

      // Fetch team events
      this.eventsService.getEvents({
        omit_event_teams: true,
        term: '',
        start: '0',
        sort: { name: 1 },
        id: this.teamId
      }).subscribe((results) => {
        if (results?.length > 0) {
          console.log('Fetched events:', results);
          // this.teamEvents = results[0].items;
          // this.nonTeamEvents = results[1].items;
          // this.updateFilteredEvents();
        }
      });
      // this.Event.query((events: EventModel[]) => {
      //   this.teamEvents = events.filter(event => {
      //     return event.teams.some(team => team.id === this.team.id);
      //   });

      //   this.nonTeamEvents = events.filter(event => {
      //     return !event.teams.some(team => team.id === this.team.id);
      //   });

      //   this.updateFilteredEvents();
      // });
    }
  }

  getMembersPage(): void {
    // this.loadingMembers = true;
    // this.Team.getMembers({
    //   id: this.team.id,
    //   page: this.membersPageIndex,
    //   page_size: this.membersPageSize,
    //   total: true,
    //   term: this.memberSearchTerm
    // }, (page: Page<User>) => {
    //   this.loadingMembers = false;
    //   this.membersPage = page;
    // });
  }

  getNonMembersPage(): void {
    this.loadingNonMembers = true;
    this.teamService.getNonMembers({
      id: this.teamId,
      term: this.nonMemberSearchTerm
    }).subscribe((results) => {
      this.loadingNonMembers = false;
      console.log('Non-members:', results);
      // this.nonMembersPage = {
      //   items: results,
      //   totalCount: results.length
      // };
    });
  }

  hasNextMember(): boolean {
    return (this.membersPageIndex + 1) * this.membersPageSize < this.membersPage.totalCount;
  }

  hasPreviousMember(): boolean {
    return this.membersPageIndex > 0 && this.membersPage.totalCount > 0;
  }

  nextMemberPage(): void {
    // if (this.hasNextMember()) {
    //   this.membersPageIndex++;
    //   this.getMembersPage();
    // }
  }

  previousMemberPage(): void {
    // if (this.hasPreviousMember()) {
    //   this.membersPageIndex--;
    //   this.getMembersPage();
    // }
  }

  searchMembers(): void {
    this.membersPageIndex = 0;
    this.getMembersPage();
  }

  hasNextNonMember(): boolean {
    return (this.nonMembersPageIndex + 1) * this.nonMembersPageSize < this.nonMembersPage.totalCount;
  }

  hasPreviousNonMember(): boolean {
    return this.nonMembersPageIndex > 0 && this.nonMembersPage.totalCount > 0;
  }

  nextNonMemberPage(): void {
    if (this.hasNextNonMember()) {
      this.nonMembersPageIndex++;
      this.getNonMembersPage();
    }
  }

  previousNonMemberPage(): void {
    if (this.hasPreviousNonMember()) {
      this.nonMembersPageIndex--;
      this.getNonMembersPage();
    }
  }

  searchNonMember(): void {
    this.nonMembersPageIndex = 0;
    this.getNonMembersPage();
  }

  toggleEditDetails(): void {
    if (!this.editingDetails) {
      // Entering edit mode - populate form with current values
      this.editForm.name = this.team.name;
      this.editForm.description = this.team.description;
    }
    this.editingDetails = !this.editingDetails;
  }

  saveTeamDetails(): void {
    // Update the team object with form values
    this.team.name = this.editForm.name;
    this.team.description = this.editForm.description;

    // Save the team
    this.teamService.editTeam(this.team.id, {
      name: this.team.name,
      description: this.team.description
    }).subscribe((updatedTeam: Team) => {
      // this.team = updatedTeam;
      this.editingDetails = false;
      // Optionally, refresh members and non-members
      this.getMembersPage();
      this.getNonMembersPage();
    });
    // this.team.$save(null, (team: TeamModel) => {
    //   this.team = team;
    //   this.editingDetails = false;
    // });
  }

  cancelEditDetails(): void {
    this.editingDetails = false;
    // Reset form values
    this.editForm.name = this.team.name;
    this.editForm.description = this.team.description;
  }

  goToTeams(): void {
    this.stateService.go('admin.teams');
  }

  addMember($event: MouseEvent, nonMember: User): void {
    $event.stopPropagation();
    this.team.userIds.push(nonMember.id);
    this.saveTeam();
  }

  removeMember($event: MouseEvent, user: User): void {
    $event.stopPropagation();
    this.team.userIds = this.team.userIds.filter(id => id !== user.id);
    this.saveTeam();
  }

  saveTeam(): void {
    this.team.$save(null, (team: TeamModel) => {
      this.team = team;
      this.getMembersPage();
      this.getNonMembersPage();
    });
  }

  editAccess(team: TeamModel): void {
    this.stateService.go('admin.teams.access', { teamId: team.id });
  }

  gotoEvent(event: EventModel): void {
    this.stateService.go('admin.events.detail', { eventId: event.id });
  }

  gotoUser(user: User): void {
    this.stateService.go('admin.users.detail', { userId: user.id });
  }

  addEventToTeam($event: MouseEvent, event: EventModel): void {
    // $event.stopPropagation();
    // this.Event.addTeam({ id: event.id }, this.team, (updatedEvent: EventModel) => {
    //   this.teamEvents.push(updatedEvent);
    //   this.nonTeamEvents = this.nonTeamEvents.filter(e => e.id !== updatedEvent.id);
    //   this.updateFilteredEvents();
    // });
  }

  removeEventFromTeam($event: MouseEvent, event: EventModel): void {
    // $event.stopPropagation();
    // this.Event.removeTeam({ id: event.id, teamId: this.team.id }, (updatedEvent: EventModel) => {
    //   this.teamEvents = this.teamEvents.filter(e => e.id !== updatedEvent.id);
    //   this.nonTeamEvents.push(updatedEvent);
    //   this.updateFilteredEvents();
    // });
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

  updateFilteredEvents(): void {
    this.filteredEvents = this.teamEvents.filter(event =>
      this.teamEventSearch ? event.name.toLowerCase().includes(this.teamEventSearch.toLowerCase()) : true
    );
    this.filteredNonTeamEvents = this.nonTeamEvents.filter(event =>
      this.eventSearch ? event.name.toLowerCase().includes(this.eventSearch.toLowerCase()) : true
    );
  }

  onEventSearchChange(): void {
    this.updateFilteredEvents();
  }

  onTeamEventSearchChange(): void {
    this.updateFilteredEvents();
  }

  getPagedEvents(events: EventModel[], page: number): EventModel[] {
    const start = page * this.eventsPerPage;
    return events.slice(start, start + this.eventsPerPage);
  }

  canGoPreviousNonTeamEvents(): boolean {
    return this.nonTeamEventsPage > 0;
  }

  canGoNextNonTeamEvents(): boolean {
    return this.nonTeamEventsPage < Math.ceil(this.filteredNonTeamEvents.length / this.eventsPerPage) - 1;
  }

  canGoPreviousTeamEvents(): boolean {
    return this.teamEventsPage > 0;
  }

  canGoNextTeamEvents(): boolean {
    return this.teamEventsPage < Math.ceil(this.filteredEvents.length / this.eventsPerPage) - 1;
  }
}
