import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { components } from 'react-select';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { SelectField } from '@/form/select/SelectField';
import { translate } from '@/i18n';

import { IssueTypeRenderer } from './IssueTypeRenderer';

const Option: FunctionComponent<any> = (props) => (
  <components.Option {...props}>
    <IssueTypeRenderer {...props.data} />
  </components.Option>
);

const SingleValue: FunctionComponent<any> = (props) => (
  <components.SingleValue {...props}>
    <IssueTypeRenderer {...props.data} />
  </components.SingleValue>
);

export const TypeField: FunctionComponent<{ issueTypes; isDisabled }> = ({
  issueTypes,
  isDisabled,
}) => (
  <Field
    name="type"
    component={FormGroup}
    label={translate('Request type')}
    required={true}
    validate={required}
  >
    <SelectField
      placeholder={translate('Select request type...')}
      options={issueTypes}
      isDisabled={isDisabled}
      getOptionValue={(option) => option.id}
      components={{ Option, SingleValue }}
      isClearable={false}
      required={true}
      noOptionsMessage={() => translate('No request types available')}
    />
  </Field>
);
