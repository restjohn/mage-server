import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

export interface SearchModalColumn {
    key: string;
    label: string;
    displayFunction: (item: any) => string;
    width?: string;
}

export interface SearchModalData {
    title: string;
    searchPlaceholder: string;
    teamId?: string;
    searchFunction: (searchTerm: string, page: number, pageSize: number) => Observable<any>;
    columns: SearchModalColumn[];
    selectedItem?: any;
}

export interface SearchModalResult {
    selectedItem: any;
}

@Component({
    selector: 'app-search-modal',
    templateUrl: './search-modal.component.html',
    styleUrls: ['./search-modal.component.scss']
})
export class SearchModalComponent implements OnInit, OnDestroy {
    dataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [];
    columns: SearchModalColumn[] = [];

    loading = false;
    pageIndex = 0;
    pageSize = 5;
    totalCount = 0;
    pageSizeOptions = [5];

    selectedItem: any = null;
    currentSearchTerm = '';

    private destroy$ = new Subject<void>();

    constructor(
        public dialogRef: MatDialogRef<SearchModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SearchModalData
    ) {
        if (data.selectedItem) {
            this.selectedItem = data.selectedItem;
        }

        this.columns = data.columns;
        this.displayedColumns = data.columns.map(col => col.key);
    }

    ngOnInit(): void {
        this.search();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    search(): void {
        const searchTerm = this.currentSearchTerm || '';
        this.loading = true;

        this.data.searchFunction(searchTerm, this.pageIndex, this.pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (results) => {
                    this.loading = false;
                    this.dataSource.data = results.items || results || [];
                    this.totalCount = this.dataSource.data.length;
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Search error:', error);
                    this.dataSource.data = [];
                    this.totalCount = 0;
                }
            });
    }

    onPageChange(event: PageEvent): void {
        this.pageIndex = event.pageIndex;
        this.search();
    }

    isSelected(item: any): boolean {
        return this.selectedItem && this.isSameItem(this.selectedItem, item);
    }

    toggleSelection(item: any): void {
        if (this.isSelected(item)) {
            this.selectedItem = null;
        } else {
            this.selectedItem = item;
        }
    }

    onRowClick(item: any, event: MouseEvent): void {
        event.preventDefault();
        this.toggleSelection(item);
    }

    private isSameItem(item1: any, item2: any): boolean {
        // Compare by id if available, otherwise by reference
        if (item1.id && item2.id) {
            return item1.id === item2.id;
        }
        return item1 === item2;
    }

    getColumnValue(item: any, column: SearchModalColumn): string {
        return column.displayFunction(item);
    }

    getColumnByKey(key: string): SearchModalColumn | undefined {
        return this.columns.find(col => col.key === key);
    }

    onSearchTermChanged(searchTerm: string): void {
        this.currentSearchTerm = searchTerm;
        this.pageIndex = 0;
        this.search();
    }

    onSearchCleared(): void {
        this.currentSearchTerm = '';
        this.pageIndex = 0;
        this.search();
    }

    onConfirm(): void {
        this.dialogRef.close({
            selectedItem: this.selectedItem
        } as SearchModalResult);
    }

    getSelectedCount(): number {
        return this.selectedItem ? 1 : 0;
    }
}
