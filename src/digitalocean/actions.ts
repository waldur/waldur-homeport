import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

import { DropletResizeDialog } from './DropletResizeDialog';

ActionConfigurationRegistry.register('DigitalOcean.Droplet', {
  order: ['start', 'stop', 'restart', 'resize', 'unlink', 'destroy'],
  options: {
    resize: {
      component: DropletResizeDialog,
      useResolve: true,
    },
  },
});
