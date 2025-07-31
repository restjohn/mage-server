import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface CardActionButton {
  label: string;
  type: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  action: () => void;
}

@Component({
  selector: 'mage-card-navbar',
  templateUrl: './card-navbar.component.html',
  styleUrls: ['./card-navbar.component.scss']
})
export class CardNavbarComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() isSearchable = false;
  @Input() searchPlaceholder = 'Search...';
  @Input() actionButtons: CardActionButton[] = [];

  @Output() searchTermChanged = new EventEmitter<string>();
  @Output() searchCleared = new EventEmitter<void>();

  searchTerm: string = '';
  debounceTime = 250;

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() { }

  ngOnInit(): void {
    this.searchSubject$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTermChanged.emit(searchTerm);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject$.next('');
    this.searchCleared.emit();
  }

  onActionButtonClick(button: CardActionButton): void {
    if (button.action) {
      button.action();
    }
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject$.next(term);
  }
}
