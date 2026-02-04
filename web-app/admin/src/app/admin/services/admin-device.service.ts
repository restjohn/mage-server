import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Device } from 'admin/src/@types/dashboard/devices-dashboard';

export interface SearchOptions {
  term?: string;
  teamId?: string;
  excludeTeamId?: string;
  id?: string;
  page?: number;
  page_size?: number;
  userId?: string;
  state?: string;

  limit?: number;
  start?: string;
  sort?: any;
  registered?: boolean;
  or?: any;
  expand?: string;
  user?: boolean;
  includePagination?: boolean;
}

export interface DevicesResponse {
  pageSize?: number;
  page?: number;
  items: { devices: Device[] };
  totalCount?: number;
  links?: { next?: string; prev?: string };
}

export interface DeviceCountDoc {
  count: number;
}

export interface DevicePageInfo {
  devices: Device[];
  links?: { next?: string; prev?: string };
}

export interface PagedResponse<T> {
  pageSize?: number;
  pageIndex?: number;
  items: T[];
  totalCount?: number;
}

const setParams = (options: any): HttpParams => {
  let params = new HttpParams();
  for (const key of Object.keys(options || {})) {
    const v = options[key];
    if (v !== undefined && v !== null) {
      params = params.set(key, typeof v === 'string' ? v : JSON.stringify(v));
    }
  }
  return params;
};

@Injectable({
  providedIn: 'root'
})
export class AdminDeviceService {
  constructor(private http: HttpClient) {}

  getDevices(options: SearchOptions): Observable<DevicesResponse> {
    let params = setParams(options);
    params = params.set('includePagination', 'true');
    return this.http.get<DevicesResponse>('/api/devices', { params });
  }

  getAllDevices(filter: any): Observable<DevicePageInfo> {
    const params = setParams({ ...filter, includePagination: true });
    return this.http.get<any>('/api/devices', { params }).pipe(
      map((res) => {
        const devices =
          res?.devices ??
          res?.items?.devices ??
          res?.items ??
          res?.pageInfo?.devices ??
          [];
        const links = res?.links ?? res?.pageInfo?.links ?? {};
        return { devices, links } as DevicePageInfo;
      })
    );
  }

  count(filter: any): Observable<DeviceCountDoc> {
    const params = setParams(filter);
    return this.http.get<DeviceCountDoc>('/api/devices/count', { params });
  }

  getDeviceById(deviceId: string): Observable<Device> {
    return this.http.get<Device>(`/api/devices/${deviceId}`);
  }

  updateDevice(deviceId: string, device: Partial<Device>): Observable<Device> {
    return this.http.put<Device>(`/api/devices/${deviceId}`, device);
  }

  updateDevicePatch<T extends Partial<Device>>(
    deviceId: string,
    patch: T
  ): Observable<Device> {
    const cleaned: any = {};
    Object.keys(patch || {}).forEach((k) => {
      const v = (patch as any)[k];
      if (v !== undefined) cleaned[k] = v;
    });
    return this.http.put<Device>(`/api/devices/${deviceId}`, cleaned);
  }

  deleteDevice(deviceId: string): Observable<void> {
    return this.http.delete<void>(`/api/devices/${deviceId}`);
  }

  createDevice(deviceData: Partial<Device>): Observable<Device> {
    return this.http.post<Device>('/api/devices', deviceData);
  }
}
