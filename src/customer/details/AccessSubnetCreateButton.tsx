import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';

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
