import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { Field, change } from 'redux-form';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { refreshCustomers } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { ISSUE_REGISTRATION_FORM_ID } from './constants';
import { callerSelector, customerSelector } from './selectors';

const filterOptions = options => options;

export const OrganizationGroup = ({ onSearch }) => {
  const dispatch = useDispatch();
  const caller = useSelector(callerSelector);
  const customer = useSelector(customerSelector);
  const openCustomerDialog = () =>
    dispatch(
      openModalDialog('customerPopover', {
        size: 'lg',
        resolve: { customer_uuid: customer.uuid },
      }),
    );
  const filterByCustomer = () => onSearch({ customer });
  const loadOptions = React.useCallback(
    name => refreshCustomers(name, caller),
    [caller],
  );

  React.useEffect(() => {
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
            clearable={true}
            loadOptions={loadOptions}
            labelKey="name"
            valueKey="name"
            filterOptions={filterOptions}
          />
        ) : (
          <Select
            options={[]}
            disabled={true}
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
