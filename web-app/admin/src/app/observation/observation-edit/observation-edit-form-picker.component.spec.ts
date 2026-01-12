import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { ObservationEditFormPickerComponent } from './observation-edit-form-picker.component';
import { AdminEventsService } from '../../admin/services/admin-events.service';
import { FilterService } from 'src/app/filter/filter.service';

class MockFilterService {
  getEvent(): any {
    return {}
  }
}

class MockEventService {
  getFormsForEvent(): any {
    return []
  }
}

describe('ObservationEditFormPickerComponent', () => {
  let component: ObservationEditFormPickerComponent;
  let fixture: ComponentFixture<ObservationEditFormPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ObservationEditFormPickerComponent ],
      providers: [{
        provide: FilterService,
        useClass: MockFilterService
      },{
        provide: AdminEventsService,
        useClass: MockEventService
      },{
        provide: MatBottomSheetRef,
        useValue: {}
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationEditFormPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
