import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { DetailsField } from '@waldur/marketplace/common/DetailsField';
import { SecretValueField } from '@waldur/marketplace/SecretValueField';
import { OrderDetailsProps } from '@waldur/marketplace/types';

export const AzureVirtualMachineDetails: FunctionComponent<
  OrderDetailsProps
> = (props) => {
  const { attributes } = props.order;
  return (
    <>
      <DetailsField label={translate('Admin username')}>
        {attributes.username}
      </DetailsField>
      <DetailsField label={translate('Admin password')}>
        <SecretValueField className="max-w-300" value={attributes.password} />
      </DetailsField>
    </>
  );
};
