import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class LocalStorageService {
    tokenKey = "token";
    timeZoneViewKey = "timeZoneView";
    timeFormatKey = "timeFormat";

    getToken(): string | null {
        return this.getLocalItem(this.tokenKey);
    }

    setToken(token: any): void {
        this.setLocalItem(this.tokenKey, token);
    }

    removeToken(): void {
        this.removeLocalItem(this.tokenKey);
    }

    getTimeZoneView(): string {
        return this.getLocalItem(this.timeZoneViewKey) || "local";
    }

    setTimeZoneView(timeZone: any): void {
        this.setLocalItem(this.timeZoneViewKey, timeZone);
    }

    getTimeFormat(): string {
        return this.getLocalItem(this.timeFormatKey) || "absolute";
    }

    setTimeFormat(timeFormat: any): void {
        this.setLocalItem(this.timeFormatKey, timeFormat);
    }

    getLocalItem(key: string): string | null {
        try {
            if ("localStorage" in window && window["localStorage"] !== null) {
                return localStorage.getItem(key);
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    setLocalItem(key: string, value: any): void {
        try {
            if ("localStorage" in window && window["localStorage"] !== null) {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.error("Error setting localStorage item", e);
        }
    }

    removeLocalItem(key: string): void {
        try {
            if ("localStorage" in window && window["localStorage"] !== null) {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.error("Error removing localStorage item", e);
        }
    }
}
