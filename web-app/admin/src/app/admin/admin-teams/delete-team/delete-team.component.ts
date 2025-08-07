import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, forkJoin } from 'rxjs';
import { Team } from '../team';
import { TeamsService } from '../teams-service';
import { UserService } from 'admin/src/app/upgrade/ajs-upgraded-providers';

@Component({
  selector: 'mage-delete-team',
  templateUrl: './delete-team.component.html',
  styleUrls: ['./delete-team.component.scss']
})
export class DeleteTeamComponent implements OnInit {
  team: Team;
  deleteAllUsers = false;
  deleting = false;
  confirm: { text?: string } = {};

  constructor(
    public dialogRef: MatDialogRef<DeleteTeamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { team: Team },
    private teamsService: TeamsService,
    @Inject(UserService) private UserService
  ) {
    this.team = data.team;
  }

  ngOnInit(): void {
  }

  deleteTeam(): void {
    this.deleting = true;

    this.teamsService.deleteTeam(this.team.id.toString()).subscribe({
      next: () => {
        if (this.deleteAllUsers && (this.confirm.text === this.team.name)) {
          this.deleteUsers();
        } else {
          this.dialogRef.close(this.team);
        }
      },
      error: (error) => {
        console.error('Error deleting team:', error);
        this.deleting = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private deleteUsers(): void {
    const users = this.team.users || [];

    if (users.length === 0) {
      this.dialogRef.close(this.team);
      return;
    }

    const deletePromises: Observable<any>[] = users.map(user =>
      this.UserService.deleteUser(user)
    );

    forkJoin(deletePromises).subscribe({
      next: () => {
        this.dialogRef.close(this.team);
      },
      error: (error) => {
        console.error('Error deleting users:', error);
        this.dialogRef.close(this.team);
      }
    });
  }
}
