import { Injectable, Injector } from '@angular/core';

export interface AuthLoginData {
    token: string;
    newUser?: boolean;
}

export interface SigninEvent {
    user: any;
    token: string;
    strategy: string;
}

/**
 * Angular service that wraps the AngularJS authService functionality.
 * This service handles authentication login confirmation and HTTP buffer retry logic.
 * 
 * Note: We access AngularJS services lazily via Angular's Injector to avoid bootstrap timing issues
 * in the hybrid AngularJS/Angular app.
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private loginData: AuthLoginData | null = null;
    private listenerInitialized = false;
    private _$injector: any;

    constructor(
        private injector: Injector
    ) { }

    private get $injector(): any {
        if (!this._$injector) {
            this._$injector = this.injector.get('$injector');
        }
        return this._$injector;
    }

    private get $rootScope(): any {
        return this.$injector.get('$rootScope');
    }

    private get httpBuffer(): any {
        return this.$injector.get('httpBuffer');
    }

    private initializeListener(): void {
        if (this.listenerInitialized) return;
        this.listenerInitialized = true;

        this.$rootScope.$on('event:auth-login', (_event: any, data: AuthLoginData) => {
            this.loginData = data;
        });
    }

    /**
     * Call this function to indicate that authentication was successful and trigger a
     * retry of all deferred requests.
     * @param configUpdater an optional function to update the config before retrying
     */
    loginConfirmed(configUpdater?: (config: any) => any): void {
        this.initializeListener();
        const updater = configUpdater || ((config: any) => config);
        this.$rootScope.$broadcast('event:auth-loginConfirmed', this.loginData);
        if (this.loginData && !this.loginData.newUser) {
            this.httpBuffer.retryAll(updater);
        } else {
            this.httpBuffer.retryAllGets(updater);
        }
    }
}
