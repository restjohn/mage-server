import { Injectable } from "@angular/core";
import { DeviceService } from "./device.service";
import { Observable, forkJoin, map } from "rxjs";

interface PageData {
  countFilter: any;
  deviceFilter: any;
  searchFilter: string;
  deviceCount: number;
  pageInfo: any;
}

interface StateAndData {
  [key: string]: PageData;
}

@Injectable({
  providedIn: 'root'
})
export class DevicePagingService {
  constructor(private deviceService: DeviceService) { }

  constructDefault(): StateAndData {
    return {
      all: {
        countFilter: {},
        deviceFilter: { limit: 10, sort: { userAgent: 1, _id: 1 } },
        searchFilter: '',
        deviceCount: 0,
        pageInfo: {}
      },
      registered: {
        countFilter: { registered: true },
        deviceFilter: { limit: 10, sort: { userAgent: 1, _id: 1 }, registered: true },
        searchFilter: '',
        deviceCount: 0,
        pageInfo: {}
      },
      unregistered: {
        countFilter: { registered: false },
        deviceFilter: { limit: 10, sort: { userAgent: 1, _id: 1 }, registered: false },
        searchFilter: '',
        deviceCount: 0,
        pageInfo: {}
      }
    };
  }

  refresh(stateAndData: StateAndData): Observable<any> {
    const observables: Observable<any>[] = [];

    for (const [key, value] of Object.entries(stateAndData)) {
      const observable = forkJoin({
        count: this.deviceService.count(value.countFilter).pipe(map((countDoc: any) => countDoc.count)),
        pageInfo: this.deviceService.getAllDevices(value.deviceFilter)
      }).pipe(
        map((result: any) => {
          stateAndData[key].deviceCount = result.count;
          stateAndData[key].pageInfo = result.pageInfo;
          return key;
        })
      );

      observables.push(observable);
    }

    return forkJoin(observables);
  }

  count(data: PageData): number {
    return data.deviceCount;
  }

  hasNext(data: PageData): boolean {
    return data.pageInfo && data.pageInfo.links && data.pageInfo.links.next != null && data.pageInfo.links.next !== "";
  }

  next(data: PageData): Observable<any> {
    return this.move(data.pageInfo.links.next, data);
  }

  hasPrevious(data: PageData): boolean {
    return data.pageInfo && data.pageInfo.links && data.pageInfo.links.prev != null && data.pageInfo.links.prev !== "";
  }

  previous(data: PageData): Observable<any> {
    return this.move(data.pageInfo.links.prev, data);
  }

  devices(data: PageData): any[] {
    return data.pageInfo?.devices || [];
  }

  search(data: PageData, searchTerm: string): Observable<any> {
    data.searchFilter = searchTerm;

    return forkJoin({
      count: this.deviceService.count(data.countFilter).pipe(map((countDoc: any) => countDoc.count)),
      pageInfo: this.deviceService.getAllDevices(data.deviceFilter)
    }).pipe(
      map((result: any) => {
        data.deviceCount = result.count;
        data.pageInfo = result.pageInfo;
        return data;
      })
    );
  }

  private move(url: string, data: PageData): Observable<any> {
    return this.deviceService.getAllDevices({ url }).pipe(
      map((page: any) => {
        data.pageInfo = page;
        return data;
      })
    );
  }
}
