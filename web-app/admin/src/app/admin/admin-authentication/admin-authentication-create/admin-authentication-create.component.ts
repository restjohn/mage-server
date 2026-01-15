import { Component, Inject, OnInit } from '@angular/core';
import { TypeChoice } from './admin-create.model';
import { AdminBreadcrumb } from '../../admin-breadcrumb/admin-breadcrumb.model';
import { CdkStepper, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { AuthenticationConfigurationService } from '../../services/admin-authentication-configuration.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Strategy } from '../../admin-authentication/admin-settings.model';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'admin-authentication-create',
  templateUrl: './admin-authentication-create.component.html',
  styleUrls: ['./admin-authentication-create.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class AuthenticationCreateComponent implements OnInit {
  breadcrumbs: AdminBreadcrumb[] = [
    {
      title: 'Security',
      icon: 'shield',
      route: ['../../security']
    }
  ];

  strategy: Strategy & { settings: any } = this.buildDefaultStrategy();

  readonly TYPE_CHOICES: TypeChoice[] = [
    {
      title: 'OpenID Connect',
      type: 'openidconnect',
      name: 'openidconnect'
    },
    {
      title: 'OAuth2',
      type: 'oauth',
      name: 'oauth'
    },
    {
      title: 'LDAP',
      type: 'ldap',
      name: 'ldap'
    },
    {
      title: 'SAML',
      type: 'saml',
      name: 'saml'
    }
  ];

  private readonly REQUIRED_SETTINGS: Record<string, string[]> = {
    oauth: [
      'clientSecret',
      'clientID',
      'authorizationURL',
      'tokenURL',
      'profileURL'
    ],
    openidconnect: [
      'clientSecret',
      'clientID',
      'issuer',
      'authorizationURL',
      'tokenURL',
      'profileURL'
    ],
    ldap: ['url'],
    saml: ['entryPoint', 'cert']
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    @Inject(AuthenticationConfigurationService)
    private readonly authenticationConfigurationService: AuthenticationConfigurationService
  ) {
    this.breadcrumbs.push({ title: 'New' });
    this.reset();
  }

  ngOnInit(): void {
    this.authenticationConfigurationService
      .getAllConfigurations({ includeDisabled: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const strategies: any[] = Array.isArray(response?.data)
            ? response.data
            : [];
          strategies.forEach((strategy) => {
            const idx = this.TYPE_CHOICES.findIndex(
              (choice) => choice.name === strategy?.name
            );
            if (idx > -1) {
              this.TYPE_CHOICES.splice(idx, 1);
            }
          });
        },
        error: () => {
          return;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  stepChanged(stepper: CdkStepper): void {
    const selected = stepper?.selected;
    const label = selected?.label;

    if (!selected || typeof label !== 'string') {
      return;
    }

    if (label === 'Title') {
      selected.hasError = !((this.strategy?.title?.length || 0) > 0);
    } else if (label === 'Type') {
      selected.hasError = !(this.strategy?.name?.length > 0);
      this.loadTemplate();
    } else if (label === 'Settings') {
      selected.hasError = !this.hasRequiredSettings();
    }
  }

  loadTemplate(): void {
    this.strategy.settings = {
      usersReqAdmin: { enabled: true },
      devicesReqAdmin: { enabled: true },
      headers: {},
      profile: {}
    };

    this.strategy.buttonColor = '#1E88E5';
    this.strategy.textColor = '#FFFFFF';

    switch (this.strategy.name) {
      case 'geoaxis':
        this.strategy.type = 'oauth';
        break;
      default:
        this.strategy.type = this.strategy.name;
        break;
    }

    const required = this.REQUIRED_SETTINGS[this.strategy.type] || [];
    required.forEach((setting) => {
      this.strategy.settings[setting] = null;
    });
  }

  save(): void {
    this.authenticationConfigurationService
      .createConfiguration(this.strategy)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/admin/security');
        },
        error: () => {
          this.snackBar.open(
            'An error occured while creating ' + (this.strategy?.title || ''),
            undefined,
            { duration: 2000 }
          );
          this.router.navigateByUrl('/admin/security');
        }
      });
  }

  isValid(): boolean {
    return (
      (this.strategy?.title?.length ?? 0) > 0 &&
      (this.strategy?.name?.length ?? 0) > 0 &&
      this.hasRequiredSettings()
    );
  }

  private hasRequiredSettings(): boolean {
    const type = this.strategy?.type || '';
    const requiredSettings = this.REQUIRED_SETTINGS[type] || [];
    const settings = this.strategy?.settings || {};

    const missing = requiredSettings.filter((key) => {
      const value = settings[key];
      return value == null || value === '';
    });

    return missing.length === 0;
  }

  reset(): void {
    this.strategy = this.buildDefaultStrategy();
  }

  private buildDefaultStrategy(): Strategy & { settings: any } {
    return {
      enabled: true,
      name: '',
      type: '',
      title: '',
      textColor: '#FFFFFF',
      buttonColor: '#1E88E5',
      icon: null,
      settings: {
        usersReqAdmin: { enabled: true },
        devicesReqAdmin: { enabled: true },
        headers: {},
        profile: {}
      }
    };
  }
}
