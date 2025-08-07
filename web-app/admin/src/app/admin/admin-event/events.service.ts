import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '@ngageoint/mage.web-core-lib/user';

export interface SearchOptions {
    populate?: boolean;
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
    omit_event_teams?: boolean;
    term?: string;
    start?: string;
    id?: string;
}

@Injectable({
    providedIn: 'root'
})
export class EventsService {

    constructor(private http: HttpClient) { }

    getEvents(options: SearchOptions): Observable<any> {
        let params = new HttpParams();

        if (options.populate !== undefined) {
            params = params.set('populate', String(options.populate));
        }
        if (options.limit !== undefined) {
            params = params.set('limit', String(options.limit));
        }
        if (options.sort !== undefined) {
            params = params.set('sort', JSON.stringify(options.sort));
        }
        if (options.omit_event_teams !== undefined) {
            params = params.set('omit_event_teams', String(options.omit_event_teams));
        }
        if (options.term !== undefined) {
            params = params.set('term', options.term);
        }
        if (options.start !== undefined) {
            params = params.set('start', options.start);
        }

        return this.http.get('/api/events', { params });
    }

    getNonMembers(options: SearchOptions): Observable<User[]> {
        let params = new HttpParams();

        if (options.populate !== undefined) {
            params = params.set('populate', String(options.populate));
        }
        if (options.limit !== undefined) {
            params = params.set('limit', String(options.limit));
        }
        if (options.sort !== undefined) {
            params = params.set('sort', JSON.stringify(options.sort));
        }
        if (options.omit_event_teams !== undefined) {
            params = params.set('omit_event_teams', String(options.omit_event_teams));
        }
        if (options.term !== undefined) {
            params = params.set('term', options.term);
        }
        if (options.start !== undefined) {
            params = params.set('start', options.start);
        }

        return this.http.get<User[]>(`/api/events/${options.id}/nonMembers`, { params });
    }
}
