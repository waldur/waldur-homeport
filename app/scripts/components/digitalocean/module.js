import dropletResizeDialog from './droplet-resize';
import DigitalOceanDropletConfig from './digitalocean-droplet-config';

export default module => {
  module.directive('dropletResizeDialog', dropletResizeDialog);
  module.config(actionConfig);
  module.config(fieldsConfig);
}

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('DigitalOcean.Droplet', DigitalOceanDropletConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('DigitalOcean.Droplet', {
    order: [
      'start',
      'stop',
      'restart',
      'resize',
      'unlink',
      'destroy'
    ],
    options: {
      resize: {
        component: 'dropletResizeDialog'
      }
    }
  });
}
