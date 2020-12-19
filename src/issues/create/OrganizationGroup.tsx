import { useCallback, useEffect, FunctionComponent } from 'react';
import {
  Button,
  ButtonGroup,
  Col,
  ControlLabel,
  FormGroup,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { Field, change } from 'redux-form';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { refreshCustomers } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { ISSUE_REGISTRATION_FORM_ID } from './constants';
import { callerSelector, customerSelector } from './selectors';

const CustomerPopover = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerPopover" */ '@waldur/customer/popover/CustomerPopover'
    ),
  'CustomerPopover',
);

const filterOption = (options) => options;

export const OrganizationGroup: FunctionComponent<{ onSearch }> = ({
  onSearch,
}) => {
  const dispatch = useDispatch();
  const caller = useSelector(callerSelector);
  const customer = useSelector(customerSelector);
  const openCustomerDialog = () =>
    dispatch(
      openModalDialog(CustomerPopover, {
        size: 'lg',
        resolve: { customer_uuid: customer.uuid },
      }),
    );
  const filterByCustomer = () => onSearch({ customer });
  const loadOptions = useCallback((name) => refreshCustomers(name, caller), [
    caller,
  ]);

  useEffect(() => {
    dispatch(change(ISSUE_REGISTRATION_FORM_ID, 'customer', undefined));
  }, [dispatch, caller]);

  return (
    <FormGroup>
      <Col sm={3} componentClass={ControlLabel}>
        {translate('Organization')}
        <span className="text-danger">*</span>
      </Col>
      <Col sm={6}>
        {caller ? (
          <Field
            name="customer"
            component={AsyncSelectField}
            required
            placeholder={translate('Select organization...')}
            isClearable={true}
            defaultOptions
            loadOptions={loadOptions}
            getOptionValue={(option) => option.name}
            getOptionLabel={(option) => option.name}
            filterOption={filterOption}
          />
        ) : (
          <Select
            options={[]}
            isDisabled={true}
            placeholder={translate('Select organization...')}
          />
        )}
      </Col>
      {customer && (
        <Col sm={3}>
          <ButtonGroup>
            <Button onClick={openCustomerDialog}>
              <i className="fa fa-eye" /> {translate('Details')}
            </Button>
            <Button onClick={filterByCustomer}>
              <i className="fa fa-search" /> {translate('Filter')}
            </Button>
          </ButtonGroup>
        </Col>
      )}
    </FormGroup>
  );
};
