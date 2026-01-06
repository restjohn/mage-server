import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../upgrade/ajs-upgraded-providers';
import { ContactInfo } from '../local-signin/local-signin.component';

@Component({
    selector: 'authorize',
    templateUrl: './authorize.component.html',
    styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit, AfterViewInit {
    @Input() strategy: string;
    @Input() token: string;
    @Input() user: any;
    @Output() onCancel = new EventEmitter<void>();
    @Output() onAuthorized = new EventEmitter<{ device?: any }>();

    @ViewChild('deviceIdInput') deviceIdInput: ElementRef<HTMLInputElement>;

    showAuthorize = false;
    private _uid = '';

    get uid(): string {
        return this._uid;
    }

    set uid(value: string) {
        this._uid = value;
        if (value) {
            this.deviceIdValid = true;
        }
        if (this.statusMessage) {
            this.statusMessage = '';
            this.status = 0;
        }
    }

    status = 0;
    statusTitle = '';
    statusMessage = '';
    statusLevel = '';
    info: ContactInfo;
    contactOpen = { opened: false };
    deviceIdValid = true;

    private stateParamsToken: string;

    constructor(
        @Inject(UserService) private userService: any,
        @Inject('$stateParams') private $stateParams: any
    ) {
        this.stateParamsToken = this.$stateParams?.token;
    }

    ngOnInit(): void {
        this.showAuthorize = false;
        this.userService.authorize(this.token, null).then(
            () => {
                this.onAuthorized.emit();
            },
            () => {
                this.showAuthorize = true;
            }
        );
    }

    ngAfterViewInit(): void {
        // MDC components initialize automatically
    }

    authorize(): void {
        // Reset validation
        this.deviceIdValid = true;
        this.statusMessage = '';
        this.status = 0;

        // Validate field
        if (!this.uid || this.uid.trim() === '') {
            this.deviceIdValid = false;
            return;
        }

        const token = this.stateParamsToken || this.token;
        this.userService.authorize(token, this.uid).then(
            (authz: any) => {
                if (authz.device.registered) {
                    this.onAuthorized.emit({ device: authz });
                } else {
                    this.status = authz.status;
                    this.statusTitle = 'Invalid Device ID';
                    this.statusMessage = authz.errorMessage || 'Device ID is invalid, please check your device ID, and try again.';
                    this.deviceIdValid = false;
                    this.statusLevel = 'alert-warning';
                    this.info = {
                        statusTitle: this.statusTitle,
                        statusMessage: this.statusMessage,
                        id: this.uid
                    };
                    this.contactOpen = { opened: true };
                }
            },
            (res: any) => {
                if (res.status === 403) {
                    this.status = res.status;
                    this.statusTitle = 'Invalid Device ID';
                    this.statusMessage = res.errorMessage || 'Device ID is invalid, please check your device ID, and try again.';
                    this.deviceIdValid = false;
                    this.statusLevel = 'alert-warning';
                } else if (res.status === 401) {
                    this.onCancel.emit();
                    return;
                }
                this.info = {
                    statusTitle: this.statusTitle,
                    statusMessage: this.statusMessage,
                    id: this.uid
                };
                this.contactOpen = { opened: true };
            }
        );
    }

    onContactClose(): void {
        this.contactOpen = { opened: false };
    }
}
