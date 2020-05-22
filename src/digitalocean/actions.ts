import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';

ActionConfigurationRegistry.register('DigitalOcean.Droplet', {
  order: ['start', 'stop', 'restart', 'resize', 'unlink', 'destroy'],
  options: {
    resize: {
      component: 'dropletResizeDialog',
      useResolve: true,
    },
  },
});
