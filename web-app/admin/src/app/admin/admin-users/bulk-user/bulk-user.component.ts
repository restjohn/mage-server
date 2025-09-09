import { Component, Inject, EventEmitter, Output, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Papa from 'papaparse';
import { Role, User } from '../user';
import { Team } from '../../admin-teams/team';

@Component({
  selector: 'app-bulk-user',
  templateUrl: './bulk-user.component.html',
  styleUrls: ['./bulk-user.component.scss']
})
export class BulkUserComponent implements OnInit {
  @Output() importData = new EventEmitter<any>();

  roles: Role[] = [];
  teams: Team[] = [];

  selectedRole: any = null;
  selectedTeam: any = null;

  filename: string = '';
  users: User[] = [];
  columns: string[] = [];
  displayedColumns: string[] = [];

  unmappedFields: { title: string; value: string }[] = [];
  importing: boolean = false;
  importStatus: string | null = null;
  editRowIndex: number | null = null;

  requiredFields = ['username', 'displayname', 'password'];

  columnOptions = [
    { value: 'username', title: 'Username' },
    { value: 'displayname', title: 'Display Name' },
    { value: 'email', title: 'Email' },
    { value: 'phone', title: 'Phone Number' },
    { value: 'password', title: 'Password' },
    { value: 'iconInitials', title: 'Icon Initials' },
    { value: 'iconColor', title: 'Icon Color' }
  ];

  constructor(
    public dialogRef: MatDialogRef<BulkUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.roles = this.data.roles || [];
    this.teams = this.data.teams || [];
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input?.files?.length) return;

    const file = input.files[0];
    this.filename = file.name;
    this.importFile(file);
  }

  importFile(file: File): void {
    Papa.parse(file, {
      complete: (results: Papa.ParseResult<any>) => {
        const [headerRow, ...dataRows] = results.data.filter(
          (row) => row.length
        );

        const newColumns = headerRow.map((col: string) => col.trim());

        newColumns.forEach((col) => {
          if (!this.columns.includes(col)) {
            this.columns.push(col);
          }
        });

        this.displayedColumns = ['team', 'role', ...this.columns];

        const newUsers: User[] = dataRows.map((row: string[]) => {
          const user: any = {};

          newColumns.forEach((col, i) => {
            const key = col.trim();
            user[key] = row[i]?.trim() || '';
          });

          user.team = this.selectedTeam;
          user.role = this.selectedRole;

          return user as User;
        });

        this.users = [...this.users, ...newUsers]; // Additive
        this.validateMapping();
      },
      skipEmptyLines: true
    });
  }

  validateMapping(): void {
    const normalizedColumns = this.columns.map((c) => c.trim().toLowerCase());

    this.unmappedFields = this.requiredFields
      .filter((requiredField) => {
        const requiredTitle = this.columnOptions
          .find((opt) => opt.value === requiredField)
          ?.title.toLowerCase();
        return !normalizedColumns.includes(requiredTitle || '');
      })
      .map((field) => this.columnOptions.find((opt) => opt.value === field)!)
      .filter(Boolean);
  }

  onSubmit(): void {
    const formattedUsers = this.users.map((user) => ({
      username: user['Username'],
      displayName: user['Display Name'],
      email: user['Email'] || '',
      phone: user['Phone Number'] || '',
      password: user['Password'],
      passwordconfirm: user['Password'],
      roleId: this.selectedRole.id,
      team: this.selectedTeam.id,
      avatar: null,
      icon: null,
      iconMetadata: null
    }));

    this.dialogRef.close({
      users: formattedUsers,
      selectedRole: this.selectedRole,
      selectedTeam: this.selectedTeam
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
