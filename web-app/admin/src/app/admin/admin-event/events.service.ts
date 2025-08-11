import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '@ngageoint/mage.web-core-lib/user';
import { Event } from 'src/app/filter/filter.types';

export interface SearchOptions {
    term?: string;
    teamId?: string;
    id?: string;
    page?: number;
    page_size?: number;
}

interface EventsResponse {
    pageSize?: number;
    page?: number;
    items: Event[];
    totalCount?: number;
}

@Injectable({
    providedIn: 'root'
})
export class EventsService {

    constructor(private http: HttpClient) { }

    getEvents(options: SearchOptions): Observable<EventsResponse> {
        let params = new HttpParams();

        if (options.term !== undefined) {
            params = params.set('term', options.term);
        }
        if (options.page !== undefined) {
            params = params.set('start', String(options.page));
        }
        if (options.page_size !== undefined) {
            params = params.set('limit', String(options.page_size));
        }
        if (options.teamId !== undefined) {
            params = params.set('teamId', options.teamId);
        }

        params = params.set('includePagination', 'true');

        return this.http.get<EventsResponse>('/api/events', { params });
    }

    removeEvent(eventId: string): Observable<void> {
        return this.http.delete<void>(`/api/events/${eventId}`);
    }
}
