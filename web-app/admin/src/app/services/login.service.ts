import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private httpClient: HttpClient) { }

  query(options?: any): Observable<any> {
    options = options || {};
    const filter = options.filter || {};

    let parameters = new HttpParams();

    if (filter.user) {
      parameters = parameters.set('userId', filter.user.id);
    }
    if (filter.deviceIds) {
      parameters = parameters.set('deviceIds', filter.deviceIds.join(','));
    } else if (filter.device) {
      parameters = parameters.set('deviceId', filter.device.id);
    }
    if (filter.startDate) {
      parameters = parameters.set('startDate', moment(filter.startDate).toISOString());
    }
    if (filter.endDate) {
      parameters = parameters.set('endDate', moment(filter.endDate).toISOString());
    }
    if (options.limit) {
      parameters = parameters.set('limit', options.limit.toString());
    }

    const url = options.url || '/api/logins';
    return this.httpClient.get<any>(url, { params: parameters });
  }
}
