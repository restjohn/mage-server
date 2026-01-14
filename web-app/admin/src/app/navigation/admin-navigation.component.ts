import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

import { AdminUserService } from '../admin/services/admin-user.service';
import { LocalStorageService } from 'src/app/http/local-storage.service';

@Component({
  selector: 'admin-navigation',
  templateUrl: './admin-navigation.component.html',
  styleUrls: ['./admin-navigation.component.scss']
})
export class AdminNavigationComponent implements OnInit, OnDestroy {
  token: string | null = null;
  myself: any = null;
  amAdmin = false;
  state = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: AdminUserService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    // Track current URL for active state / breadcrumbs etc.
    this.state = this.router.url;

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((e) => (this.state = e.urlAfterRedirects));

    // Initialize token immediately
    this.token = this.localStorageService.getToken();

    // Reactively update user/admin state
    this.userService.myself$
      .pipe(takeUntil(this.destroy$))
      .subscribe((u) => {
        this.myself = u;
        // token may change after authorize/signin
        this.token = this.localStorageService.getToken();
      });

    this.userService.isAdmin$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAdmin) => (this.amAdmin = isAdmin));

    // Kick off session hydrate if needed (optional but usually desired)
    // This makes sure myself$ is populated when you refresh the page with a token.
    this.userService.checkLoggedInUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    // Use the service’s observable (it clears state + redirects)
    this.userService.logout().subscribe();
  }
}
