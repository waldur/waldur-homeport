import { FunctionComponent } from 'react';
import { components } from 'react-select';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
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
  <SelectGroup
    name="type"
    label={translate('Request type')}
    required={true}
    validate={required}
    placeholder={translate('Select request type...')}
    options={issueTypes}
    isDisabled={isDisabled}
    getOptionValue={(option) => option.id}
    components={{ Option, SingleValue }}
    isClearable={false}
    noOptionsMessage={() => translate('No request types available')}
  />
);
