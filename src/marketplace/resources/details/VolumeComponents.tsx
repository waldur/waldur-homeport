import { QuotaSingleView } from './QuotaSingleView';
import { getStorageTitle } from './storageTitle';

export const VolumeComponents = ({ resource }) => (
  <QuotaSingleView
    title={getStorageTitle(resource.type_name)}
    usage={(resource.size / 1024).toFixed()}
    displayUnit="GB"
  />
);
