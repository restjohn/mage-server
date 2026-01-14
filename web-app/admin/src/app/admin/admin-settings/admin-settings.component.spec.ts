import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdminSettingsComponent } from './admin-settings.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {
  MatSnackBarModule,
  MatSnackBar,
  MatSnackBarDismiss
} from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';

import { Subject, Observable, BehaviorSubject, of } from 'rxjs';
import { StateService, TransitionService } from '@uirouter/core';

import { AdminUserService } from '../services/admin-user.service';
import { LocalStorageService } from 'src/app/http/local-storage.service';

import { SettingsService } from 'admin/src/app/services/settings.service';
import { TeamService } from 'admin/src/app/services/team.service';
import { EventService } from 'admin/src/app/services/event.service';
import { AuthenticationConfigurationService } from '../services/admin-authentication-configuration.service';

class MockSnackbarRef {
  private readonly afterDismissedObservable = new Subject<MatSnackBarDismiss>();

  afterDismissed(): Observable<MatSnackBarDismiss> {
    return this.afterDismissedObservable;
  }

  dismiss(): void {
    this.afterDismissedObservable.next({ dismissedByAction: false });
    this.afterDismissedObservable.complete();
  }

  dismissWithAction(): void {
    this.afterDismissedObservable.next({ dismissedByAction: true });
    this.afterDismissedObservable.complete();
  }
}

class MockSnackbar {
  private snackbarRef = new MockSnackbarRef();

  get _openedSnackBarRef(): any {
    return this.snackbarRef;
  }

  open(): any {
    return this.snackbarRef;
  }
}

class MockSettingsService {
  query(): Observable<any> {
    return of({});
  }
}

class MockTeamService {
  query(): Observable<any[]> {
    return of([]);
  }
}

class MockEventService {
  query(): Observable<any[]> {
    return of([]);
  }
}

class MockAuthenticationConfigurationService {
  getAllConfigurations(): Observable<any> {
    return of({ data: [] });
  }
}

class MockStateService {}

class MockTransitionService {
  onExit(_a: any, _b: any, _c: any): void {}
}

describe('AdminSettingsComponent', () => {
  let component: AdminSettingsComponent;
  let fixture: ComponentFixture<AdminSettingsComponent>;

  beforeEach(
    waitForAsync(() => {
      const mockLocalStorageService = { getToken: (): string => '1' };
      const mockDialogRef = { close: (): void => {} };

      const myself$ = new BehaviorSubject<any>({
        role: { permissions: ['UPDATE_AUTH_CONFIG'] }
      });

      const mockUserService: any = {
        myself: myself$.value,
        myself$,
        getMyself: jasmine.createSpy('getMyself').and.returnValue(of(myself$.value))
      };

      TestBed.configureTestingModule({
        imports: [
          NoopAnimationsModule,
          MatPaginatorModule,
          MatSortModule,
          MatSnackBarModule,
          MatTableModule,
          MatDialogModule,
          MatProgressSpinnerModule,
          MatInputModule,
          MatFormFieldModule,
          MatIconModule,
          HttpClientTestingModule,
          MatCheckboxModule,
          MatListModule,
          MatCardModule,
          MatExpansionModule,
          MatRadioModule,
          MatSelectModule,
          MatOptionModule,
          MatDatepickerModule,
          MatNativeDateModule,
          FormsModule,
          MatChipsModule
        ],
        providers: [
          { provide: LocalStorageService, useValue: mockLocalStorageService },
          { provide: SettingsService, useClass: MockSettingsService },
          { provide: TeamService, useClass: MockTeamService },
          { provide: EventService, useClass: MockEventService },
          {
            provide: AuthenticationConfigurationService,
            useClass: MockAuthenticationConfigurationService
          },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MatSnackBar, useClass: MockSnackbar },
          { provide: AdminUserService, useValue: mockUserService },
          { provide: StateService, useClass: MockStateService },
          { provide: TransitionService, useClass: MockTransitionService }
        ],
        declarations: [AdminSettingsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
