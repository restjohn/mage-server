import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  constructor(private httpClient: HttpClient) { }

  query(options?: any): Observable<any[]> {
    options = options || {};
    const parameters: any = {};
    if (options.state) {
      parameters.state = options.state;
    }
    if (options.populate !== undefined) {
      parameters.populate = options.populate;
    }

    return this.httpClient.get<any[]>('/api/teams/', { params: parameters });
  }

  get(id: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/teams/${id}`);
  }

  create(team: any): Observable<any> {
    return this.httpClient.post<any>('/api/teams', team, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  update(team: any): Observable<any> {
    return this.httpClient.put<any>(`/api/teams/${team.id}`, team, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  delete(team: any): Observable<any> {
    return this.httpClient.delete<any>(`/api/teams/${team.id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  count(): Observable<any> {
    return this.httpClient.get<any>('/api/teams/count', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addUser(teamId: string | number, userId: string | number): Observable<any> {
    return this.httpClient.post<any>(`/api/teams/${teamId}/users`, { userId }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  removeUser(teamId: string | number, userId: string | number): Observable<any> {
    return this.httpClient.delete<any>(`/api/teams/${teamId}/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getMembers(teamId: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/teams/${teamId}/members`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getNonMembers(teamId: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/teams/${teamId}/nonMembers`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
