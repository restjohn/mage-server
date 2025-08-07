import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { Settings } from 'admin/src/app/upgrade/ajs-upgraded-providers';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss', '../../../node_modules/font-awesome/css/font-awesome.min.css']
})
export class AboutComponent implements OnInit {
  mageVersion: {
    major: number,
    minor: number,
    micro: number
  }
  apk: string
  nodeVersion: string
  mongoVersion: string
  adminPhone: string = null;
  adminEmail: string = null;

  constructor(
    private router: Router,
    @Inject(ApiService) public apiService: ApiService,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    this.apiService.getApi().subscribe(api =>{
      this.mageVersion = api.version;
      this.apk = api.apk;
      this.nodeVersion = api.environment.nodeVersion;
      this.mongoVersion = api.environment.mongodbVersion;
    })

  const injSettings = this.injector.get(Settings);

  console.log(injSettings)

    const settingsPromise = injSettings.query().$promise;

    settingsPromise.then(result => {
        const settings: any = {};

        result.forEach(element => {
            settings[element.type] = {};
            Object.keys(element).forEach(key => {
                if (key !== 'type') {
                    settings[element.type][key] = element[key];
                }
            });
        });

        this.adminEmail = settings.contactinfo ? settings.contactinfo.settings.email : null;
        this.adminPhone = settings.contactinfo ? settings.contactinfo.settings.phone : null;
    }).catch(err => {
        console.log(err);
    });
  }

  onBack(): void {
    this.router.navigate(['home']);
  }
}
