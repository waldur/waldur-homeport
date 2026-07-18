import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';

import { ResourceAccessSubnetFormData } from './ResourceAccessSubnetForm';

const ResourceAccessSubnetForm = lazyComponent(() =>
  import('./ResourceAccessSubnetForm').then((module) => ({
    default: module.ResourceAccessSubnetForm,
  })),
);

export const ResourceAccessSubnetCreateButton = ({
  refetch,
  resource_url,
}: Omit<ResourceAccessSubnetFormData, 'row'>) => (
  <CreateModalButton
    dialog={ResourceAccessSubnetForm}
    resolve={{ refetch, resource_url }}
    size="lg"
    title={translate('Add access subnet')}
  />
);
