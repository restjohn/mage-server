import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of, throwError } from "rxjs";
import { SecurityDisclaimerComponent } from "./security-disclaimer.component";
import { SettingsService } from "admin/src/app/services/settings.service";

describe("SecurityDisclaimerComponent", () => {
  let component: SecurityDisclaimerComponent;
  let fixture: ComponentFixture<SecurityDisclaimerComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(
    waitForAsync(() => {
      settingsService = jasmine.createSpyObj<SettingsService>("SettingsService", [
        "get",
        "update",
      ]);

      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule],
        declarations: [SecurityDisclaimerComponent],
        providers: [{ provide: SettingsService, useValue: settingsService }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    // default happy-path stubs
    settingsService.get.and.returnValue(of({ settings: { show: true, title: "T", text: "X" } }));
    settingsService.update.and.returnValue(of({}));

    fixture = TestBed.createComponent(SecurityDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load disclaimer settings on init", () => {
    expect(settingsService.get).toHaveBeenCalledWith("disclaimer");
    expect(component.disclaimer).toEqual(
      jasmine.objectContaining({ show: true, title: "T", text: "X" })
    );
  });

  it("should save when dirty and beginSave changes", () => {
    component.setDirty(true);
    settingsService.update.calls.reset();

    component.ngOnChanges({
      beginSave: {
        currentValue: {},
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(settingsService.update).toHaveBeenCalledWith("disclaimer", component.disclaimer);
  });

  it("should emit saveComplete true on successful save", () => {
    const emitSpy = spyOn(component.saveComplete, "emit");
    component.setDirty(true);

    component.ngOnChanges({
      beginSave: {
        currentValue: {},
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it("should emit saveComplete false on save error", () => {
    const emitSpy = spyOn(component.saveComplete, "emit");
    settingsService.update.and.returnValue(throwError(() => ({ error: "nope" })));

    component.setDirty(true);
    component.ngOnChanges({
      beginSave: {
        currentValue: {},
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(emitSpy).toHaveBeenCalledWith(false);
  });
});
