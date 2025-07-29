import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamsService } from '../teams-service';
import { Team } from '../team';

@Component({
    selector: 'mage-admin-team-create',
    templateUrl: './create-team.component.html',
    styleUrls: ['./create-team.component.scss']
})
export class CreateTeamDialogComponent {
    teamForm: FormGroup;
    errorMessage: string = '';

    constructor(
        public dialogRef: MatDialogRef<CreateTeamDialogComponent>,
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
            this.errorMessage = 'Please fill in all required fields.';
            return;
        }

        this.errorMessage = '';
        const teamData = this.teamForm.value;
        this.teamsService.createTeam(teamData).subscribe({
            next: (newTeam) => {
                this.dialogRef.close(newTeam);
            },
            error: () => {
                this.errorMessage = 'Failed to create team. Please try again.';
            }
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
