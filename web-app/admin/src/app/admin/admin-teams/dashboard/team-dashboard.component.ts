import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Team } from '../team';
import { Subject } from 'rxjs';
import { TeamsService } from '../teams-service';
import { CreateTeamDialogComponent } from '../create-team/create-team.component';
import { CardActionButton } from '../../../core/card-navbar/card-navbar.component';

@Component({
  selector: 'mage-admin-teams',
  templateUrl: './team-dashboard.component.html',
  styleUrls: ['./team-dashboard.component.scss']
})
export class TeamDashboardComponent implements OnInit, OnDestroy {
  teamSearch = '';
  teams: Team[] = [];
  totalTeams = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  dataSource = new MatTableDataSource<Team>();
  displayedColumns = ['name', 'description'];

  actionButtons: CardActionButton[] = [{ label: 'New Team', type: 'primary', action: () => this.newTeam() }];

  private destroy$ = new Subject<void>();

  constructor(
    private modal: MatDialog,
    private teamService: TeamsService
  ) { }

  ngOnInit(): void {
    this.fetchTeams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchTeams(): void {
    this.teamService.getTeams({
      term: this.teamSearch,
      sort: { name: 1 },
      limit: this.pageSize,
      start: String(this.pageIndex * this.pageSize)
    }).subscribe((results) => {
      if (results?.length > 0) {
        const teams = results[0];
        this.teams = teams.items;
        this.totalTeams = teams.totalCount;
        this.dataSource.data = this.teams;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.fetchTeams();
  }

  onSearchTermChanged(term: string): void {
    this.teamSearch = term;
    this.pageIndex = 0; // Reset to first page when searching
    this.fetchTeams();
  }

  onSearchCleared(): void {
    this.teamSearch = '';
    this.pageIndex = 0;
    this.fetchTeams();
  }

  newTeam(): void {
    const dialogRef = this.modal.open(CreateTeamDialogComponent, {
      width: '50rem',
      height: '25rem',
      data: { team: {} }
    });

    dialogRef.afterClosed().subscribe(newTeam => {
      if (newTeam) {
        this.fetchTeams();
      }
    });
  }

  gotoTeam(team: Team): void {
    // TODO: convert to this to using a router once upgrade is complete
    const baseUrl = window.location.href.split('#')[0];
    window.location.href = `${baseUrl}#/home/teams/${team.id}`;
  }
}
