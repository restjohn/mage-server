import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamsService } from '../teams-service';
import { Team } from '../team';

@Component({
    selector: 'mage-admin-team-create',
    templateUrl: './admin-team-create.component.html',
    styleUrls: ['./admin-team-create.component.scss']
})
export class AdminTeamCreateComponent {
    teamForm: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<AdminTeamCreateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { team: Partial<Team> },
        private fb: FormBuilder,
        private teamsService: TeamsService
    ) {
        this.teamForm = this.fb.group({
            name: [data.team.name || '', [Validators.required]],
            description: [data.team.description || '']
        });
    }

    save(): void {
        if (this.teamForm.invalid) {
            return;
        }

        const teamData = this.teamForm.value;
        this.teamsService.createTeam(teamData).subscribe(newTeam => {
            this.dialogRef.close(newTeam);
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
