import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';

import { AccessSubnetFormData } from './AccessSubnetForm';

const AccessSubnetForm = lazyComponent(() =>
  import('./AccessSubnetForm').then((module) => ({
    default: module.AccessSubnetForm,
  })),
);

export const AccessSubnetCreateButton = ({
  refetch,
  customer_url,
}: Omit<AccessSubnetFormData, 'row'>) => (
  <CreateModalButton
    dialog={AccessSubnetForm as any}
    resolve={{ refetch, customer_url }}
    size="lg"
    title={translate('Add access subnet')}
  />
);
