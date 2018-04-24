import * as ResourceSummary from '@waldur/resource/summary/registry';

import instanceCreateConfig from './InstanceCreateConfig';
import { InstanceSummary } from './InstanceSummary';
import volumeCreateConfig from './VolumeCreateConfig';
import { VolumeSummary } from './VolumeSummary';
import './ProviderConfig';

export default module => {
  ResourceSummary.register('Rijkscloud.Instance', InstanceSummary);
  ResourceSummary.register('Rijkscloud.Volume', VolumeSummary);
  module.config(instanceCreateConfig);
  module.config(volumeCreateConfig);
  module.config(actionConfig);
  module.run(registerImportEndpoint);
  module.run(registerImportEndpoint);
};

// @ngInject
function registerImportEndpoint(ImportResourcesEndpointRegistry, ENV) {
  ImportResourcesEndpointRegistry.registerEndpoint(ENV.resourcesTypes.vms, 'Rijkscloud', 'rijkscloud-instances');
  ImportResourcesEndpointRegistry.registerEndpoint(ENV.resourcesTypes.volumes, 'Rijkscloud', 'rijkscloud-volumes');
}

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  const actions = {
    order: ['pull', 'destroy'],
    options: {
      pull: {
        title: gettext('Synchronise')
      },
    }
  };
  ActionConfigurationProvider.register('Rijkscloud.Volume', actions);
  ActionConfigurationProvider.register('Rijkscloud.Instance', actions);
}
