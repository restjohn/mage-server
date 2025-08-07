import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef, DoBootstrap } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './routing.module';
import { LocalStorageService } from './http/local-storage.service';
import { TokenInterceptorService } from './http/token.interceptor';
import { MageCommonModule } from '@ngageoint/mage.web-core-lib/common';
import { settingsProvider } from 'admin/src/app/upgrade/ajs-upgraded-providers';
import { UpgradeModule } from '@angular/upgrade/static';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    UpgradeModule,
    AppRoutingModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    MageCommonModule
  ],
  bootstrap: [ AppComponent ],
  providers: [
    LocalStorageService,
    TokenInterceptorService,
    settingsProvider,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true }
  ]
})
export class AppModule implements DoBootstrap {
  constructor(private upgrade: UpgradeModule) {}

  public ngDoBootstrap(_appRef: ApplicationRef): void {
    this.upgrade.bootstrap(document.body, ['hybridMage'], { strictDi: true });
  }
}