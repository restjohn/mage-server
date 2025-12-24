import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationConfigurationService {
  constructor(private httpClient: HttpClient) { }

  getAllConfigurations(options?: any): Observable<any> {
    options = options || {};
    return this.httpClient.get<any>('/api/authentication/configuration/', { params: options });
  }

  updateConfiguration(config: any): Observable<any> {
    return this.httpClient.put<any>(`/api/authentication/configuration/${config._id}`, config, {
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  deleteConfiguration(config: any): Observable<any> {
    return this.httpClient.delete<any>(`/api/authentication/configuration/${config._id}`);
  }

  createConfiguration(config: any): Observable<any> {
    return this.httpClient.post<any>('/api/authentication/configuration/', config, {
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  countUsers(id: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/authentication/configuration/count/${id}`);
  }
}
