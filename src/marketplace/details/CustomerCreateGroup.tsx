import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change } from 'redux-form';

import { CustomerCreateForm } from '@waldur/customer/create/CustomerCreateForm';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';

import { FormGroup } from '../offerings/FormGroup';

import { FORM_ID } from './constants';
import { formSelector } from './utils';

const FIELD_ID = 'customer_create_request';

export const CustomerCreateGroup = () => {
  const dispatch = useDispatch();
  const initialValues = useSelector((state) => formSelector(state, FIELD_ID));
  const openCustomerCreateDialog = () =>
    dispatch(
      openModalDialog(CustomerCreateForm, {
        size: 'lg',
        onSubmit: (formData) => {
          dispatch(change(FORM_ID, FIELD_ID, formData));
          dispatch(closeModalDialog());
        },
        initialValues,
      }),
    );
  return (
    <FormGroup
      labelClassName="control-label col-sm-3"
      valueClassName="col-sm-9"
      label={translate('Organization')}
      required={true}
    >
      <Button onClick={openCustomerCreateDialog}>
        {initialValues ? (
          <i className="fa fa-pencil" />
        ) : (
          <i className="fa fa-plus" />
        )}{' '}
        {initialValues
          ? translate('Edit organization request')
          : translate('Create organization request')}
      </Button>
    </FormGroup>
  );
};
