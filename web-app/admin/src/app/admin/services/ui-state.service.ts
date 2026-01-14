import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get params(): Record<string, any> {
    const snapshot = this.route.snapshot;

    return {
      ...snapshot.paramMap.keys.reduce((acc, k) => {
        acc[k] = snapshot.paramMap.get(k);
        return acc;
      }, {} as Record<string, any>),

      ...snapshot.queryParamMap.keys.reduce((acc, k) => {
        acc[k] = snapshot.queryParamMap.get(k);
        return acc;
      }, {} as Record<string, any>)
    };
  }

  go(
    commands: string | any[],
    params?: Record<string, any>,
    extras: NavigationExtras = {}
  ): Promise<boolean> {
    const navExtras: NavigationExtras = {
      ...extras,
      queryParams: params ?? extras.queryParams
    };

    if (typeof commands === 'string') {
      return this.router.navigateByUrl(commands, navExtras);
    }

    return this.router.navigate(commands, navExtras);
  }
}
