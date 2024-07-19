import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { components, Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { organizationGroupAutocomplete } from '@waldur/customer/list/api';
import { RIGHT_ARROW_HTML } from '@waldur/customer/list/constants';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

interface SelectOrganizationGroupFieldProps {
  isFilterForm?: boolean;
}

const Option: FC<any> = (props) => (
  <components.Option {...props}>
    {props.data.parent_name ? (
      <>
        {props.data.parent_name} {RIGHT_ARROW_HTML}{' '}
      </>
    ) : null}
    {props.data.name}
  </components.Option>
);

const SingleValue: FC<any> = (props) => {
  const parent_name: string = props.data.name.split(' ')[0];
  const name: string = props.data.name.split(' ')[2];
  return (
    <components.SingleValue {...props}>
      {parent_name === 'undefined' ? name : props.data.name}
    </components.SingleValue>
  );
};

interface SelectFieldProps {
  reactSelectProps?: Partial<SelectProps>;
}

export const SelectOrganizationGroupFieldPure: FC<SelectFieldProps> = (
  props,
) => (
  <Field
    name="organization_group"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select organization group...')}
        loadOptions={organizationGroupAutocomplete}
        components={{ Option, SingleValue }}
        defaultOptions
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No organization groups')}
        isClearable={true}
        {...props.reactSelectProps}
      />
    )}
  />
);

export const SelectOrganizationGroupField: FC<
  SelectOrganizationGroupFieldProps
> = (props) => (
  <Form.Group className={props.isFilterForm ? ' col-sm-3' : ''}>
    <Form.Label className={props.isFilterForm ? '' : 'd-none'}>
      {translate('Organization group')}
    </Form.Label>
    <div className={props.isFilterForm ? '' : 'mb-7'}>
      <SelectOrganizationGroupFieldPure />
    </div>
  </Form.Group>
);
