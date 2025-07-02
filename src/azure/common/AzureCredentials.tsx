import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { SecretValueField } from '@waldur/marketplace/SecretValueField';
import { OrderDetailsProps } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

export const AzureCredentials: FunctionComponent<OrderDetailsProps> = (
  props,
) => {
  const { attributes } = props.order;
  return (
    <>
      {typeof attributes['username'] === 'string' && (
        <Field label={translate('Admin username')}>
          {attributes['username']}
        </Field>
      )}
      {typeof attributes['password'] === 'string' && (
        <Field label={translate('Admin password')}>
          <SecretValueField
            className="max-w-300"
            value={attributes['password']}
          />
        </Field>
      )}
    </>
  );
};
