import { get } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';

const getConsoleURL = (id: string) =>
  get(`/vmware-virtual-machine/${id}/console/`);

export function actionsConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('VMware.VirtualMachine', {
    order: [
      'console',
      'update',
      'create_disk',
      'start',
      'stop',
      'reset',
      'suspend',
      'destroy',
    ],
    options: {
      create_disk: {
        tab: 'disks',
      },
      console: {
        name: 'console',
        title: translate('Open console'),
        type: 'callback',
        enabled: true,
        execute: resource => {
          getConsoleURL(resource.uuid).then(response => {
            window.open(response.data.url);
          }).catch(error => {
            const ctx = {message: format(error)};
            const message = translate('Unable to open console. Error message: {message}', ctx);
            alert(message);
          });
        },
        validators: [validateState('OK')],
      },
    },
  });

  ActionConfigurationProvider.register('VMware.Disk', {
    options: {
      extend: {
        fields: {
          size: {
            resource_default_value: true,
          },
        },
      },
    },
  });
}

actionsConfig.$inject = ['ActionConfigurationProvider'];
