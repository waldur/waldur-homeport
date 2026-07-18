import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';

import { OfferingAccessSubnetFormData } from './OfferingAccessSubnetForm';

const OfferingAccessSubnetForm = lazyComponent(() =>
  import('./OfferingAccessSubnetForm').then((module) => ({
    default: module.OfferingAccessSubnetForm,
  })),
);

export const OfferingAccessSubnetCreateButton = ({
  refetch,
  offering_url,
}: Omit<OfferingAccessSubnetFormData, 'row'>) => (
  <CreateModalButton
    dialog={OfferingAccessSubnetForm}
    resolve={{ refetch, offering_url }}
    size="lg"
    title={translate('Add default subnet')}
  />
);
