import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationConfigurationService {
  constructor(private http: HttpClient) {}

  getAllConfigurations(options: any = {}): Observable<any> {
    let params = new HttpParams();
    for (const key of Object.keys(options || {})) {
      const v = options[key];
      if (v !== undefined && v !== null) params = params.set(key, String(v));
    }
    return this.http.get('/api/authentication/configuration/', { params });
  }

  updateConfiguration(config: any): Observable<any> {
    return this.http.put(`/api/authentication/configuration/${config._id}`, config, {
      headers: { 'content-type': 'application/json' }
    });
  }

  deleteConfiguration(config: any): Observable<any> {
    return this.http.delete(`/api/authentication/configuration/${config._id}`);
  }

  createConfiguration(config: any): Observable<any> {
    return this.http.post('/api/authentication/configuration/', config, {
      headers: { 'content-type': 'application/json' }
    });
  }

  countUsers(id: string): Observable<any> {
    return this.http.get(`/api/authentication/configuration/count/${id}`);
  }
}
