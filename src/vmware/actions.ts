import { get } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { $rootScope } from '@waldur/core/services';
import { translate, gettext } from '@waldur/i18n';
import { ActionConfigurationRegistry } from '@waldur/resource/actions/action-configuration';
import { validateState } from '@waldur/resource/actions/base';

interface ConsleResponse {
  url: string;
}

const getConsoleURL = (id: string) =>
  get<ConsleResponse>(`/vmware-virtual-machine/${id}/console/`);

ActionConfigurationRegistry.register('VMware.VirtualMachine', {
  order: [
    'pull',
    'console',
    'update',
    'create_disk',
    'create_port',
    'start',
    'stop',
    'reset',
    'shutdown_guest',
    'reboot_guest',
    'suspend',
    'destroy',
  ],
  options: {
    pull: {
      title: gettext('Synchronise'),
    },
    create_disk: {
      tab: 'disks',
      title: translate('Create disk'),
      fields: {
        size: {
          help_text: gettext('Size in GiB'),
        },
      },
      onSuccess: () => {
        $rootScope.$broadcast('refreshResource');
        $rootScope.$broadcast('refreshList');
      },
    },
    create_port: {
      tab: 'ports',
      title: translate('Create Network adapter'),
      onSuccess: () => {
        $rootScope.$broadcast('refreshResource');
        $rootScope.$broadcast('refreshList');
      },
    },
    update: {
      title: translate('Edit'),
      fields: {
        ram: {
          help_text: gettext('Size in GiB'),
        },
      },
    },
    console: {
      name: 'console',
      title: translate('Open console'),
      type: 'callback',
      enabled: true,
      execute: resource => {
        getConsoleURL(resource.uuid)
          .then(response => {
            window.open(response.data.url);
          })
          .catch(error => {
            const ctx = { message: format(error) };
            const message = translate(
              'Unable to open console. Error message: {message}',
              ctx,
            );
            alert(message);
          });
      },
      validators: [validateState('OK')],
    },
  },
});

ActionConfigurationRegistry.register('VMware.Disk', {
  options: {
    pull: {
      title: gettext('Synchronise'),
    },
    extend: {
      fields: {
        size: {
          resource_default_value: true,
          help_text: gettext('Size in GiB'),
        },
      },
    },
  },
});

ActionConfigurationRegistry.register('VMware.Port', {
  options: {
    pull: {
      title: gettext('Synchronise'),
    },
  },
});
