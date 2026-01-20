import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { UserSearchBoxComponent } from './user-search-box.component';
import { UserPagingService } from '../../../services/user-paging.service';

describe('UserSearchBoxComponent', () => {
  let component: UserSearchBoxComponent;
  let fixture: ComponentFixture<UserSearchBoxComponent>;

  const mockUsers = [
    { id: '1', displayName: 'Alice Adams' } as any,
    { id: '2', displayName: 'Bob Brown' } as any
  ];

  const mockUserPaging = {
    constructDefault: jasmine
      .createSpy('constructDefault')
      .and.returnValue({ all: {} }),
    refresh: jasmine.createSpy('refresh').and.returnValue(Promise.resolve()),
    search: jasmine
      .createSpy('search')
      .and.returnValue(Promise.resolve(mockUsers))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [UserSearchBoxComponent],
      providers: [{ provide: UserPagingService, useValue: mockUserPaging }]
    }).compileComponents();
  
    fixture = TestBed.createComponent(UserSearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  
    mockUserPaging.search.calls.reset();
  });  

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(mockUserPaging.constructDefault).toHaveBeenCalled();
    expect(mockUserPaging.refresh).toHaveBeenCalled();
  });

  it('should call search and update results when user types', fakeAsync(() => {
    component.onUserInput('al');
    flushMicrotasks();

    expect(mockUserPaging.search).toHaveBeenCalledWith(
      component.userStateAndData[component.userState],
      'al'
    );
    expect(component.searchResults.length).toBe(2);
    expect(component.searchResults[0].displayName).toBe('Alice Adams');
  }));

  it('should clear results when input is empty', fakeAsync(() => {
    component.searchResults = [...mockUsers];

    component.onUserInput('');
    flushMicrotasks();

    expect(component.searchResults.length).toBe(0);
    expect(mockUserPaging.search).not.toHaveBeenCalled();
  }));

  it('should emit selected user and update text', () => {
    const emitSpy = spyOn(component.userSelected, 'emit');

    component.searchResults = [...mockUsers];
    component.selectUser(mockUsers[1]);

    expect(emitSpy).toHaveBeenCalledWith(mockUsers[1]);
    expect(component.userText).toBe('Bob Brown');
    expect(component.searchResults.length).toBe(0);
  });

  it('should emit null when cleared', () => {
    const emitSpy = spyOn(component.userSelected, 'emit');

    component.userText = 'something';
    component.searchResults = [...mockUsers];

    component.clear();

    expect(emitSpy).toHaveBeenCalledWith(null);
    expect(component.userText).toBe('');
    expect(component.searchResults.length).toBe(0);
  });

  it('should cap results at 10', fakeAsync(() => {
    const many = Array.from({ length: 25 }).map((_, i) => ({
      id: String(i),
      displayName: `User ${i}`
    })) as any[];
    mockUserPaging.search.and.returnValue(Promise.resolve(many));

    component.onUserInput('u');
    flushMicrotasks();

    expect(component.searchResults.length).toBe(10);
  }));
});
