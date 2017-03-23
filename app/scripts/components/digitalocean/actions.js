// @ngInject
export default function actionConfig(ActionConfigurationProvider) {
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
