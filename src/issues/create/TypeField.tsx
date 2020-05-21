import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { IssueTypeRenderer } from './IssueTypeRenderer';
import { SelectField } from './SelectField';

export const TypeField = ({ issueTypes, disabled }) => (
  <Field
    name="type"
    component={SelectField}
    placeholder={translate('Select request type...')}
    options={issueTypes}
    disabled={disabled}
    valueKey="id"
    labelKey="label"
    optionRenderer={IssueTypeRenderer}
    valueRenderer={IssueTypeRenderer}
    clearable={false}
    required={true}
  />
);
