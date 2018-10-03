import { formatFlavor } from '@waldur/resource/utils';

export const formatPackage = resource =>
  `${resource.name} / ${resource.category} (${formatFlavor(resource)})`;
