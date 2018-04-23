import * as ResourceSummary from '@waldur/resource/summary/registry';

import './ProviderConfig';
import volumeCreateConfig from './VolumeCreateConfig';
import instanceCreateConfig from './InstanceCreateConfig';
import { InstanceSummary } from './InstanceSummary';
import { VolumeSummary } from './VolumeSummary';

export default module => {
  ResourceSummary.register('Rijkscloud.Instance', InstanceSummary);
  ResourceSummary.register('Rijkscloud.Volume', VolumeSummary);
  module.config(volumeCreateConfig);
  module.config(instanceCreateConfig);
};
