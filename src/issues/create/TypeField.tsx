import { FunctionComponent } from 'react';
import { components } from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { IssueTypeRenderer } from './IssueTypeRenderer';
import { SelectField } from './SelectField';

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
    component={SelectField}
    placeholder={translate('Select request type...')}
    options={issueTypes}
    isDisabled={isDisabled}
    getOptionValue={(option) => option.id}
    components={{ Option, SingleValue }}
    isClearable={false}
    required={true}
    noOptionsMessage={'No request types'}
  />
);
