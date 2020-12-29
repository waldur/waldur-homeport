import { FC } from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FormField } from './FormField';

interface Choice {
  url: string;
  name: string;
}

interface Props {
  choices: Choice[];
}

export const RemoteGroupField: FC<Props> = ({ choices }) => (
  <Field name="remote_group" component={FormField} componentClass="select">
    <option value="">{translate('None')}</option>
    {choices.map((choice, index) => (
      <option key={index} value={choice.url}>
        {choice.name}
      </option>
    ))}
  </Field>
);
