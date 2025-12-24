import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  myself: any = null;
  amAdmin: boolean = false;

  constructor(private httpClient: HttpClient) { }

  getMyself(): Observable<any> {
    return this.httpClient.get<any>('/api/users/myself', {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }).pipe(
      tap(user => {
        this.myself = user;
        this.amAdmin = user?.role?.permissions?.includes('CREATE_DEVICE') || false;
      })
    );
  }

  getUserCount(options?: any): Observable<any> {
    options = options || {};
    return this.httpClient.get<any>('/api/users/count', { params: options });
  }

  getUser(id: string | number, options?: any): Observable<any> {
    options = options || {};
    return this.httpClient.get<any>(`/api/users/${id}`, { params: options });
  }

  getAllUsers(options?: any): Observable<any> {
    options = options || {};
    return this.httpClient.get<any>('/api/users', { params: options });
  }

  createUser(user: any): Observable<any> {
    return this.httpClient.post<any>('/api/users', user, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  updateUser(id: string | number, user: any): Observable<any> {
    return this.httpClient.put<any>(`/api/users/${id}`, user, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  deleteUser(user: any): Observable<any> {
    return this.httpClient.delete<any>(`/api/users/${user.id}`);
  }

  getRoles(): Observable<any> {
    return this.httpClient.get<any>('/api/roles');
  }

  updatePassword(userId: string | number, authentication: any): Observable<any> {
    return this.httpClient.put<any>(`/api/users/${userId}/password`, authentication, {
      headers: { "Content-Type": "application/json" }
    });
  }

  hasPermission(permission: string): boolean {
    return this.myself?.role?.permissions?.includes(permission) || false;
  }

  addRecentEvent(eventId: string | number): Observable<any> {
    return this.httpClient.post<any>(`/api/users/${this.myself.id}/events/${eventId}/recent`, {});
  }

  getRecentEventId(): string | number | null {
    return this.myself?.recentEventIds?.[0] || null;
  }
}
