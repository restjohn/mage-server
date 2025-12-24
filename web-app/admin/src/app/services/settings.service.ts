import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor(private httpClient: HttpClient) { }

  query(): Observable<any[]> {
    return this.httpClient.get<any[]>('/api/settings');
  }

  get(type: string): Observable<any> {
    return this.httpClient.get<any>(`/api/settings/${type}`);
  }

  update(type: string, settings: any): Observable<any> {
    return this.httpClient.put<any>(`/api/settings/${type}`, settings, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
