import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { StateService, TransitionService } from '@uirouter/angular';
import { UserService, LocalStorageService } from '../upgrade/ajs-upgraded-providers';

/**
 * Admin Navigation Component for Angular 14
 * 
 * Combined component that manages authentication state and displays the navigation bar.
 * This component replaces the legacy MageNavComponent and AdminNavbarComponent.
 * 
 * Responsibilities:
 * - Listens for user login/logout events from the AngularJS layer
 * - Maintains user state (myself, token, amAdmin)
 * - Displays the top navigation bar with user profile and actions
 * - Provides logout functionality
 */
@Component({
    selector: 'admin-navigation',
    templateUrl: './admin-navigation.component.html',
    styleUrls: ['./admin-navigation.component.scss']
})
export class AdminNavigationComponent implements OnInit, OnDestroy {
    token: string | null = null;
    myself: any = null;
    amAdmin: boolean = false;
    state: string = '';

    private eventListeners: Array<() => void> = [];
    private transitionDeregisterFn: Function | null = null;

    constructor(
        @Inject('$rootScope') private $rootScope: any,
        @Inject('$scope') private $scope: any,
        @Inject(UserService) private userService: any,
        @Inject(LocalStorageService) private localStorageService: any,
        private stateService: StateService,
        private transitionService: TransitionService
    ) { }

    ngOnInit(): void {
        // Get current state
        this.state = this.stateService.current.name || '';

        // Subscribe to state transitions (returns deregistration function)
        this.transitionDeregisterFn = this.transitionService.onSuccess({}, (transition) => {
            this.state = transition.to().name || '';
        });

        // Listen for user login events from AngularJS layer
        const userListener = this.$rootScope.$on('event:user', (_e: any, login: any) => {
            this.token = login.token;
            this.myself = login.user;
            this.amAdmin = login.isAdmin;

            // Update AngularJS scope for template access
            this.$scope.token = this.token;
            this.$scope.myself = this.myself;
            this.$scope.amAdmin = this.amAdmin;

            this.$scope.$applyAsync();
        });

        // Listen for logout events from AngularJS layer
        const logoutListener = this.$rootScope.$on('logout', () => {
            this.myself = null;
            this.amAdmin = false;
            this.token = null;

            // Update AngularJS scope
            this.$scope.myself = null;
            this.$scope.amAdmin = false;
            this.$scope.token = null;

            this.$scope.$applyAsync();
        });

        // Store deregistration functions for cleanup
        this.eventListeners.push(userListener);
        this.eventListeners.push(logoutListener);

        // Initialize state from existing session if available
        this.initializeState();
    }

    ngOnDestroy(): void {
        this.eventListeners.forEach(deregister => deregister());
        if (this.transitionDeregisterFn) {
            this.transitionDeregisterFn();
        }
    }

    /**
     * Initialize user state from existing session
     */
    private initializeState(): void {
        const token = this.localStorageService.getToken();
        if (token && this.userService.myself) {
            this.token = token;
            this.myself = this.userService.myself;
            this.amAdmin = this.userService.amAdmin;

            // Set on AngularJS scope
            this.$scope.token = this.token;
            this.$scope.myself = this.myself;
            this.$scope.amAdmin = this.amAdmin;
        }
    }

    /**
     * Log out the current user and reload the page
     */
    logout(): void {
        this.userService.logout();
        window.location.reload();
    }
}
