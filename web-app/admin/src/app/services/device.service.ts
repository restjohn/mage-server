import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  constructor(private httpClient: HttpClient) { }

  count(options?: any): Observable<any> {
    options = options || {};
    return this.httpClient.get<any>('/api/devices/count', { params: options });
  }

  getAllDevices(options?: any): Observable<any> {
    options = options || {};
    return this.httpClient.get<any>('/api/devices', { params: options });
  }

  getDevice(id: string | number, options?: any): Observable<any> {
    options = options || {};
    return this.httpClient.get<any>(`/api/devices/${id}`, { params: { expand: 'user' } });
  }

  createDevice(device: any): Observable<any> {
    return this.httpClient.post<any>('/api/devices', device, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
  }

  updateDevice(device: any): Observable<any> {
    return this.httpClient.put<any>(`/api/devices/${device.id}`, device, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
  }

  deleteDevice(device: any): Observable<any> {
    return this.httpClient.delete<any>(`/api/devices/${device.id}`);
  }
}
