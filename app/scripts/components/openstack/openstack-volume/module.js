import OpenStackVolumeConfig from './openstack-volume-config';
import volumeExtendDialog from './volume-extend';
import snapshotCreateDialog from './snapshot-create';
import { openstackVolumeSummary } from './openstack-volume-summary';
import openstackVolumeCheckoutSummary from './openstack-volume-checkout-summary';
import openstackVolumesService from './openstack-volumes-service';
import openstackInstanceVolumes from './openstack-instance-volumes';
import openstackVolumeSnapshots from './openstack-volume-snapshots';
import openstackVolumesList from './openstack-volumes-list';

export default module => {
  module.service('openstackVolumesService', openstackVolumesService);
  module.directive('volumeExtendDialog', volumeExtendDialog);
  module.directive('snapshotCreateDialog', snapshotCreateDialog);
  module.component('openstackVolumeSummary', openstackVolumeSummary);
  module.directive('openstackVolumeCheckoutSummary', openstackVolumeCheckoutSummary);
  module.component('openstackInstanceVolumes', openstackInstanceVolumes);
  module.component('openstackVolumeSnapshots', openstackVolumeSnapshots);
  module.component('openstackVolumesList', openstackVolumesList);

  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Volume', OpenStackVolumeConfig);
}

// @ngInject
function actionConfig(ActionConfigurationProvider, DEFAULT_EDIT_ACTION) {
  ActionConfigurationProvider.register('OpenStackTenant.Volume', {
    order: [
      'edit',
      'pull',
      'attach',
      'detach',
      'extend',
      'snapshot',
      'destroy',
      'create_snapshot_schedule',
    ],
    options: {
      edit: angular.merge({}, DEFAULT_EDIT_ACTION, {
        successMessage: gettext('Volume has been updated')
      }),
      pull: {
        title: gettext('Synchronise')
      },
      extend: {
        component: 'volumeExtendDialog'
      },
      snapshot: {
        tab: 'snapshots',
        title: gettext('Create'),
        dialogTitle: gettext('Create snapshot for '),
        iconClass: 'fa fa-plus',
        component: 'snapshotCreateDialog',
        fields: {
          kept_until: {
            help_text: gettext('Guaranteed time of snapshot retention. If null - keep forever.'),
            label: gettext('Kept until'),
            required: false,
            type: 'datetime'
          }
        }
      },
      create_snapshot_schedule: {
        title: gettext('Create'),
        dialogTitle: gettext('Create snapshot schedule for OpenStack volume'),
        tab: 'snapshot_schedules',
        iconClass: 'fa fa-plus',
        fields: {
          schedule: {
            type: 'crontab'
          }
        }
      },
    }
  });
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Volume', {
    error_states: [
      'error'
    ]
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Volume', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'snapshots',
      'snapshot_schedules',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      snapshots: {
        heading: gettext('Snapshots'),
        component: 'openstackVolumeSnapshots'
      },
      snapshot_schedules: {
        heading: gettext('Snapshot schedules'),
        component: 'openstackSnapshotSchedulesList'
      },
    })
  });
}
