import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EventResourceService {
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

    return this.httpClient.get<any[]>('/api/events', { params: parameters });
  }

  get(id: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/events/${id}`);
  }

  create(event: any): Observable<any> {
    return this.httpClient.post<any>('/api/events', event, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  update(event: any): Observable<any> {
    return this.httpClient.put<any>(`/api/events/${event.id}`, event, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  delete(event: any): Observable<any> {
    return this.httpClient.delete<any>(`/api/events/${event.id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  count(): Observable<any> {
    return this.httpClient.get<any>('/api/events/count', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addTeam(eventId: string | number, teamId: string | number): Observable<any> {
    return this.httpClient.post<any>(`/api/events/${eventId}/teams`, { teamId }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  removeTeam(eventId: string | number, teamId: string | number): Observable<any> {
    return this.httpClient.delete<any>(`/api/events/${eventId}/teams/${teamId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addLayer(eventId: string | number, layerId: string | number): Observable<any> {
    return this.httpClient.post<any>(`/api/events/${eventId}/layers`, { layerId }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  removeLayer(eventId: string | number, layerId: string | number): Observable<any> {
    return this.httpClient.delete<any>(`/api/events/${eventId}/layers/${layerId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addFeed(eventId: string | number, feedId: string | number): Observable<any> {
    return this.httpClient.post<any>(`/api/events/${eventId}/feeds`, { feedId }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  removeFeed(eventId: string | number, feedId: string | number): Observable<any> {
    return this.httpClient.delete<any>(`/api/events/${eventId}/feeds/${feedId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getMembers(eventId: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/events/${eventId}/members`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getNonMembers(eventId: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/events/${eventId}/nonMembers`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getTeams(eventId: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/events/${eventId}/teams`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getNonTeams(eventId: string | number): Observable<any> {
    return this.httpClient.get<any>(`/api/events/${eventId}/nonTeams`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
