import {
    Component,
    OnDestroy,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef
  } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { Subject, takeUntil } from 'rxjs';
  
  import { PluginService } from '../../../plugin/plugin.service';
  
  @Component({
    selector: 'mage-plugins-host',
    templateUrl: './plugins-host.component.html',
    styleUrls: ['./plugins-host.component.scss']
  })
  export class PluginHostComponent implements OnInit, OnDestroy {
    @ViewChild('host', { read: ViewContainerRef, static: true })
    host!: ViewContainerRef;
  
    loading = true;
    error: string | null = null;
  
    private destroy$ = new Subject<void>();
  
    constructor(
      private route: ActivatedRoute,
      private pluginService: PluginService
    ) {}
  
    ngOnInit(): void {
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(async (params) => {
        const pluginId = params.get('pluginId');
        if (!pluginId) return;
  
        this.loading = true;
        this.error = null;
        this.host.clear();
  
        try {
          const plugins = await this.pluginService.availablePlugins();
          const plugin = plugins[pluginId];
  
          if (!plugin?.MAGE_WEB_HOOKS) {
            throw new Error(`Plugin not found: ${pluginId}`);
          }
  
          const moduleRef = await this.pluginService.loadPluginModule(pluginId);
  
          const hooks: any = plugin.MAGE_WEB_HOOKS;
          const root: Type<any> | undefined = hooks.rootComponent;
  
          if (!root) {
            throw new Error(
              `Plugin "${pluginId}" does not export MAGE_WEB_HOOKS.rootComponent`
            );
          }
  
          this.host.createComponent(root, {
            injector: moduleRef.injector
          });
        } catch (e: any) {
          this.error = e?.message ?? 'Failed to load plugin.';
        } finally {
          this.loading = false;
        }
      });
    }
  
    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }
  