import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AsyncPaginate } from 'react-select-async-paginate';
import { change, Field } from 'redux-form';

import { CustomerCreateForm } from '@waldur/customer/create/CustomerCreateForm';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';

import { FormGroup } from '../offerings/FormGroup';

import { FORM_ID } from './constants';
import { formSelector } from './utils';

const CUSTOMER_CREATE_FIELD = 'customer_create_request';
const CUSTOMER_SELECT_FIELD = 'customer';

export const CustomerCreateGroup = () => {
  const dispatch = useDispatch();
  const initialValues = useSelector((state) =>
    formSelector(state, CUSTOMER_CREATE_FIELD),
  );
  const openCustomerCreateDialog = () =>
    dispatch(
      openModalDialog(CustomerCreateForm, {
        size: 'lg',
        onSubmit: (formData) => {
          dispatch(change(FORM_ID, CUSTOMER_CREATE_FIELD, formData));
          dispatch(change(FORM_ID, CUSTOMER_SELECT_FIELD, undefined));
          dispatch(closeModalDialog());
        },
        initialValues,
      }),
    );
  return (
    <FormGroup
      labelClassName="col-sm-3"
      valueClassName="col-sm-9"
      label={translate('Organization')}
      required={true}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flexGrow: 1, marginRight: 10 }}>
          <Field
            name={CUSTOMER_SELECT_FIELD}
            component={(fieldProps) => (
              <AsyncPaginate
                placeholder={translate('Select organization...')}
                loadOptions={(query, prevOptions, additional) =>
                  organizationAutocomplete(
                    query,
                    prevOptions,
                    additional,
                    null,
                    ['name', 'url'],
                  )
                }
                defaultOptions
                value={fieldProps.input.value}
                onChange={(value) => {
                  fieldProps.input.onChange(value);
                  dispatch(change(FORM_ID, CUSTOMER_CREATE_FIELD, undefined));
                }}
                getOptionValue={(option) => option.url}
                getOptionLabel={(option) => option.name}
                noOptionsMessage={() => translate('No organizations')}
                isClearable={true}
                additional={{
                  page: 1,
                }}
              />
            )}
          />
        </div>
        <Button onClick={openCustomerCreateDialog}>
          {initialValues ? (
            <i className="fa fa-pencil" />
          ) : (
            <i className="fa fa-plus" />
          )}{' '}
          {initialValues
            ? translate('Edit organization request ({name})', {
                name: initialValues.name,
              })
            : translate('Create organization request')}
        </Button>
      </div>
    </FormGroup>
  );
};
