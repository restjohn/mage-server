import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AdminBreadcrumbModule } from '../../admin-breadcrumb/admin-breadcrumb.module';
import { AdminFeedComponent } from './admin-feed.component';
import { AdminUserService } from '../../services/admin-user.service';
import { EventService } from 'admin/src/app/services/event.service';
import { FeedService } from 'core-lib-src/feed';
import { of } from 'rxjs';
import { UiStateService } from '../../services/ui-state.service';

class MockUserService {
  getMyself() {
    return of({
      id: 'user-1',
      role: {
        permissions: []
      }
    });
  }
}

class MockStateService {
  get params(): any {
    return {};
  }

  go(): void {}
}

class MockEventService {
  addFeed() {
    return of({});
  }

  removeFeed() {
    return of({});
  }
}

class MockFeedService {
  fetchFeed() {
    return of(null);
  }

  fetchServiceType() {
    return of(null);
  }

  deleteFeed() {
    return of(null);
  }
}

describe('AdminFeedComponent', () => {
  let component: AdminFeedComponent;
  let fixture: ComponentFixture<AdminFeedComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: UiStateService, useClass: MockStateService },
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: AdminUserService, useClass: MockUserService },
          { provide: EventService, useClass: MockEventService },
          { provide: FeedService, useClass: MockFeedService }
        ],
        imports: [
          MatDialogModule,
          MatFormFieldModule,
          MatIconModule,
          MatCardModule,
          MatAutocompleteModule,
          MatListModule,
          MatPaginatorModule,
          MatSnackBarModule,
          FormsModule,
          MatSelectModule,
          NgxMatSelectSearchModule,
          ReactiveFormsModule,
          HttpClientModule,
          AdminBreadcrumbModule
        ],
        declarations: [AdminFeedComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
