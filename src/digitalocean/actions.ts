import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

const DropletResizeDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "DropletResizeDialog" */ './DropletResizeDialog'
    ),
  'DropletResizeDialog',
);

ActionConfigurationRegistry.register('DigitalOcean.Droplet', {
  order: ['start', 'stop', 'restart', 'resize', 'unlink', 'destroy'],
  options: {
    resize: {
      component: DropletResizeDialog,
    },
  },
});
