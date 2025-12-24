import { Injectable } from "@angular/core";
import { AdminUserService } from "./admin-user.service";
import { Observable, forkJoin, map } from "rxjs";

interface PageData {
  countFilter: any;
  userFilter: any;
  searchFilter: string;
  userCount: number;
  pageInfo: any;
}

interface StateAndData {
  [key: string]: PageData;
}

@Injectable({
  providedIn: 'root'
})
export class UserPagingService {
  constructor(private userService: AdminUserService) { }

  constructDefault(): StateAndData {
    return {
      all: {
        countFilter: {},
        userFilter: {
          pageSize: 10,
          pageIndex: 0,
          sort: { displayName: 1, _id: 1 }
        },
        searchFilter: '',
        userCount: 0,
        pageInfo: {}
      },
      active: {
        countFilter: { active: true },
        userFilter: {
          pageSize: 10,
          pageIndex: 0,
          sort: { displayName: 1, _id: 1 },
          active: true
        },
        searchFilter: '',
        userCount: 0,
        pageInfo: {}
      },
      inactive: {
        countFilter: { active: false },
        userFilter: {
          pageSize: 10,
          pageIndex: 0,
          sort: { displayName: 1, _id: 1 },
          active: false
        },
        searchFilter: '',
        userCount: 0,
        pageInfo: {}
      },
      disabled: {
        countFilter: { enabled: false },
        userFilter: {
          pageSize: 10,
          pageIndex: 0,
          sort: { displayName: 1, _id: 1 },
          enabled: false
        },
        searchFilter: '',
        userCount: 0,
        pageInfo: {}
      }
    };
  }

  refresh(stateAndData: StateAndData): Observable<any> {
    const observables: Observable<any>[] = [];

    for (const [key, value] of Object.entries(stateAndData)) {
      const backendParams = {
        pageSize: value.userFilter.limit,
        pageIndex: value.userFilter.page,
        active: value.userFilter.active,
        enabled: value.userFilter.enabled,
        term: value.searchFilter
      };

      const observable = this.userService.getAllUsers(backendParams).pipe(
        map((page: any) => {
          stateAndData[key].userCount = page.totalCount;
          stateAndData[key].pageInfo = page;
          return key;
        })
      );

      observables.push(observable);
    }

    return forkJoin(observables);
  }

  count(data: PageData): number {
    return data.userCount;
  }

  hasNext(data: PageData): boolean {
    return data.pageInfo && data.pageInfo.links && data.pageInfo.links.next !== null;
  }

  next(data: PageData): Observable<any> {
    return this.move(data.pageInfo.links.next, data);
  }

  hasPrevious(data: PageData): boolean {
    return data.pageInfo && data.pageInfo.links && data.pageInfo.links.prev !== null;
  }

  previous(data: PageData): Observable<any> {
    return this.move(data.pageInfo.links.prev, data);
  }

  users(data: PageData): any[] {
    return data.pageInfo?.users || [];
  }

  search(data: PageData, searchTerm: string): Observable<any> {
    data.searchFilter = searchTerm;
    data.userFilter.pageIndex = 0;

    const backendParams = {
      pageSize: data.userFilter.limit,
      pageIndex: data.userFilter.page,
      active: data.userFilter.active,
      enabled: data.userFilter.enabled,
      term: data.searchFilter
    };

    return this.userService.getAllUsers(backendParams).pipe(
      map((page: any) => {
        data.userCount = page.totalCount;
        data.pageInfo = page;
        return data;
      })
    );
  }

  private move(url: string, data: PageData): Observable<any> {
    return this.userService.getAllUsers({ url }).pipe(
      map((page: any) => {
        data.pageInfo = page;
        return data;
      })
    );
  }
}
