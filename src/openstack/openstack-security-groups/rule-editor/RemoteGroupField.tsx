import { FC } from 'react';
import { Field } from 'react-final-form';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { translate } from '@/i18n';

import { FormSelectField } from './FormField';

export const RemoteGroupField: FC<{
  name: string;
  choices: Pick<OpenStackSecurityGroup, 'name' | 'url'>[];
  component?: any;
}> = ({ name, choices, component = FormSelectField }) => (
  <Field name={name} component={component}>
    <option value="">{translate('None')}</option>
    {choices.map((sg) => (
      <option key={sg.url} value={sg.url}>
        {sg.name}
      </option>
    ))}
  </Field>
);
