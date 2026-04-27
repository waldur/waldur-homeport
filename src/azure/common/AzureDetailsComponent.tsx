import { FunctionComponent } from 'react';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SecretValueField } from '@/marketplace/SecretValueField';
import { OrderDetailsProps } from '@/marketplace/types';

export const AzureDetailsComponent: FunctionComponent<OrderDetailsProps> = (
  props,
) => {
  const { attributes } = props.order;
  return (
    <>
      {typeof attributes['username'] === 'string' && (
        <FormTable.Item label={translate('Admin username')}>
          {attributes['username']}
        </FormTable.Item>
      )}
      {typeof attributes['password'] === 'string' && (
        <FormTable.Item label={translate('Admin password')}>
          <SecretValueField
            className="max-w-300"
            value={attributes['password']}
          />
        </FormTable.Item>
      )}
    </>
  );
};
