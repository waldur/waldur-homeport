import { FunctionComponent } from 'react';
import { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Field } from 'redux-form';

import { organizationDivisionAutocomplete } from '@waldur/customer/list/api';
import { RIGHT_ARROW_HTML } from '@waldur/customer/list/constants';
import { translate } from '@waldur/i18n';

interface SelectOrganizationDivisionFieldProps {
  isFilterForm?: boolean;
}

const Option: FunctionComponent<any> = (props) => (
  <components.Option {...props}>
    {props.data.parent_name ? (
      <>
        {props.data.parent_name} {RIGHT_ARROW_HTML}{' '}
      </>
    ) : null}
    {props.data.name}
  </components.Option>
);

const SingleValue: FunctionComponent<any> = (props) => {
  const parent_name: string = props.data.name.split(' ')[0];
  const name: string = props.data.name.split(' ')[2];
  return (
    <components.SingleValue {...props}>
      {parent_name === 'undefined' ? name : props.data.name}
    </components.SingleValue>
  );
};

export const SelectOrganizationDivisionField: FunctionComponent<SelectOrganizationDivisionFieldProps> =
  (props) => (
    <div className={`form-group${props.isFilterForm ? ' col-sm-3' : ''}`}>
      <label
        className={`control-label${props.isFilterForm ? '' : ' col-sm-2'}`}
      >
        {translate('Division')}
      </label>
      <div className={props.isFilterForm ? '' : 'col-sm-8'}>
        <Field
          name="division"
          component={(fieldProps) => (
            <AsyncPaginate
              placeholder={translate('Select division...')}
              loadOptions={organizationDivisionAutocomplete}
              components={{ Option, SingleValue }}
              defaultOptions
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              value={fieldProps.input.value}
              onChange={(value) => fieldProps.input.onChange(value)}
              noOptionsMessage={() => translate('No divisions')}
              isClearable={true}
              additional={{
                page: 1,
              }}
            />
          )}
        />
      </div>
    </div>
  );
