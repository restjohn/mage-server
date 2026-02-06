import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { CanComponentDeactivate } from './guard/can-component-deactivate';

@Injectable({ providedIn: 'root' })
export class AdminUnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate) {
    return component.onUnsavedChanges();
  }
}
