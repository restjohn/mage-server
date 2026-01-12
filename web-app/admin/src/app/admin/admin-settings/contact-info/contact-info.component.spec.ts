import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ContactInfoComponent } from './contact-info.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { of, throwError } from 'rxjs';
import { SettingsService } from 'admin/src/app/services/settings.service';

const MOCK_CONTACT_INFO = {
  phone: '123-456-7890',
  email: 'test@example.com',
  showDevContact: true
};

const MOCK_SETTINGS_RESPONSE = [
  {
    type: 'contactinfo',
    settings: { ...MOCK_CONTACT_INFO }
  }
];

const MOCK_EMPTY_RESPONSE: any[] = [];

class MockSettingsService {
  query() {
    return of(MOCK_SETTINGS_RESPONSE);
  }

  update(params: any, data: any) {
    return of(null);
  }
}

describe('ContactInfoComponent', () => {
  let component: ContactInfoComponent;
  let fixture: ComponentFixture<ContactInfoComponent>;
  let settingsService: MockSettingsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, HttpClientTestingModule, MatMenuModule],
      declarations: [ContactInfoComponent],
      providers: [{ provide: SettingsService, useClass: MockSettingsService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactInfoComponent);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService) as any;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load settings in ngOnInit', fakeAsync(() => {
    spyOn(settingsService, 'query').and.callThrough();

    component.ngOnInit();
    tick();

    expect(settingsService.query).toHaveBeenCalled();
    expect(component.contactinfo).toEqual(MOCK_CONTACT_INFO);
    expect(component.oldEmail).toBe(MOCK_CONTACT_INFO.email);
    expect(component.oldPhone).toBe(MOCK_CONTACT_INFO.phone);
    expect(component.oldShowDevContact).toBe(MOCK_CONTACT_INFO.showDevContact);
  }));

  it('should handle empty settings in ngOnInit', fakeAsync(() => {
    spyOn(settingsService, 'query').and.returnValue(of(MOCK_EMPTY_RESPONSE));

    component.ngOnInit();
    tick();

    expect(component.contactinfo).toEqual({
      phone: '',
      email: '',
      showDevContact: false
    });
  }));

  it('should handle error in ngOnInit', fakeAsync(() => {
    const consoleSpy = spyOn(console, 'log');
    spyOn(settingsService, 'query').and.returnValue(throwError(() => 'Error!'));

    component.ngOnInit();
    tick();

    expect(consoleSpy).toHaveBeenCalledWith('Error!');
  }));

  it('should call save() from ngOnChanges if beginSave changes and form is dirty', () => {
    const saveSpy = spyOn(component, 'save');
    component.isDirty = true;

    const changes = {
      beginSave: new SimpleChange(false, true, false)
    };

    component.ngOnChanges(changes);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should NOT call save() if form is not dirty', () => {
    const saveSpy = spyOn(component, 'save');
    component.isDirty = false;

    const changes = {
      beginSave: new SimpleChange(false, true, false)
    };

    component.ngOnChanges(changes);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should emit onDirty from setDirty()', () => {
    const dirtySpy = spyOn(component.onDirty, 'emit');

    component.setDirty(true);

    expect(component.isDirty).toBeTrue();
    expect(dirtySpy).toHaveBeenCalledWith(true);
  });

  it('should emit saveComplete(true) on successful save', fakeAsync(() => {
    const saveSpy = spyOn(component.saveComplete, 'emit');

    spyOn(settingsService, 'update').and.returnValue(of(null));

    component.save();
    tick();

    expect(saveSpy).toHaveBeenCalledWith(true);
  }));

  it('should emit saveComplete(false) on failed save', fakeAsync(() => {
    const saveSpy = spyOn(component.saveComplete, 'emit');

    spyOn(settingsService, 'update').and.returnValue(
      throwError(() => new Error('nope'))
    );

    component.save();
    tick();

    expect(saveSpy).toHaveBeenCalledWith(false);
  }));
});
