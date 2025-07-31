import { Component, Inject, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

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

interface Team {
  id: string;
  name: string;
  description: string;
  userIds: string[];
  acl: any;
  $save: (params: any, callback: (team: Team) => void) => void;
}

interface Event {
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
  team: Team;
  hasUpdatePermission = false;
  hasDeletePermission = false;

  edit = false;
  editEvent = false;

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

  teamEvents: Event[] = [];
  nonTeamEvents: Event[] = [];
  teamEventsPage = 0;
  nonTeamEventsPage = 0;
  eventsPerPage = 5;
  eventSearch: string;
  teamEventSearch: string;

  filteredEvents: Event[] = [];
  filteredNonTeamEvents: Event[] = [];

  constructor(
    // private route: ActivatedRoute,
    // private router: Router,
    private dialog: MatDialog,
    @Inject('Team') private Team: any,
    @Inject('Event') private Event: any,
    @Inject('UserService') private UserService: any
  ) { }

  ngOnInit(): void {
    // this.route.paramMap.subscribe(params => {
    //   const teamId = params.get('teamId');
    //   if (teamId) {
    //     this.Team.get({ id: teamId, populate: false }, (team: Team) => {
    //       this.team = team;

    //       const myAccess = this.team.acl[this.UserService.myself.id];
    //       const aclPermissions = myAccess ? myAccess.permissions : [];

    //       this.hasUpdatePermission = this.UserService.myself.role.permissions.includes('UPDATE_TEAM') || aclPermissions.includes('update');
    //       this.hasDeletePermission = this.UserService.myself.role.permissions.includes('DELETE_TEAM') || aclPermissions.includes('delete');
    //     });

    //     this.getMembersPage();
    //     this.getNonMembersPage();

    //     this.Event.query((events: Event[]) => {
    //       this.teamEvents = events.filter(event => {
    //         return event.teams.some(team => team.id === this.team.id);
    //       });

    //       this.nonTeamEvents = events.filter(event => {
    //         return !event.teams.some(team => team.id === this.team.id);
    //       });

    //       this.updateFilteredEvents();
    //     });
    //   }
    // });
  }

  getMembersPage(): void {
    this.loadingMembers = true;
    this.Team.getMembers({
      id: this.team.id,
      page: this.membersPageIndex,
      page_size: this.membersPageSize,
      total: true,
      term: this.memberSearchTerm
    }, (page: Page<User>) => {
      this.loadingMembers = false;
      this.membersPage = page;
    });
  }

  getNonMembersPage(): void {
    this.loadingNonMembers = true;
    this.Team.getNonMembers({
      id: this.team.id,
      page: this.nonMembersPageIndex,
      page_size: this.nonMembersPageSize,
      total: true,
      term: this.nonMemberSearchTerm
    }, (page: Page<User>) => {
      this.loadingNonMembers = false;
      this.nonMembersPage = page;
    });
  }

  hasNextMember(): boolean {
    return (this.membersPageIndex + 1) * this.membersPageSize < this.membersPage.totalCount;
  }

  hasPreviousMember(): boolean {
    return this.membersPageIndex > 0 && this.membersPage.totalCount > 0;
  }

  nextMemberPage(): void {
    if (this.hasNextMember()) {
      this.membersPageIndex++;
      this.getMembersPage();
    }
  }

  previousMemberPage(): void {
    if (this.hasPreviousMember()) {
      this.membersPageIndex--;
      this.getMembersPage();
    }
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

  editTeam(team: Team): void {
    // this.router.navigate(['/admin/teams', team.id, 'edit']);
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
    this.team.$save(null, (team: Team) => {
      this.team = team;
      this.getMembersPage();
      this.getNonMembersPage();
    });
  }

  editAccess(team: Team): void {
    // this.router.navigate(['/admin/teams', team.id, 'access']);
  }

  gotoEvent(event: Event): void {
    // this.router.navigate(['/admin/events', event.id]);
  }

  gotoUser(user: User): void {
    // this.router.navigate(['/admin/users', user.id]);
  }

  addEventToTeam($event: MouseEvent, event: Event): void {
    $event.stopPropagation();
    this.Event.addTeam({ id: event.id }, this.team, (updatedEvent: Event) => {
      this.teamEvents.push(updatedEvent);
      this.nonTeamEvents = this.nonTeamEvents.filter(e => e.id !== updatedEvent.id);
      this.updateFilteredEvents();
    });
  }

  removeEventFromTeam($event: MouseEvent, event: Event): void {
    $event.stopPropagation();
    this.Event.removeTeam({ id: event.id, teamId: this.team.id }, (updatedEvent: Event) => {
      this.teamEvents = this.teamEvents.filter(e => e.id !== updatedEvent.id);
      this.nonTeamEvents.push(updatedEvent);
      this.updateFilteredEvents();
    });
  }

  deleteTeam(): void {
    // TODO: Replace with Angular Material dialog
    // const dialogRef = this.dialog.open(AdminTeamDeleteComponent, {
    //   data: { team: this.team }
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.router.navigate(['/admin/teams']);
    //   }
    // });
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

  getPagedEvents(events: Event[], page: number): Event[] {
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
