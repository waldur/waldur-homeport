import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { useDispatch, useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { refreshUsers } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { callerSelector } from './selectors';

const renderer = option => option.full_name || option.username;

const CallerActions = ({ onSearch }) => {
  const dispatch = useDispatch();
  const caller = useSelector(callerSelector);
  const openUserDialog = () =>
    dispatch(openModalDialog('userPopover', { resolve: { user: caller } }));
  const filterByCaller = () => onSearch({ caller });
  if (!caller) {
    return null;
  }
  return (
    <Col sm={3}>
      <ButtonGroup>
        <Button onClick={openUserDialog}>
          <i className="fa fa-eye" /> {translate('Details')}
        </Button>
        <Button onClick={filterByCaller}>
          <i className="fa fa-search" /> {translate('Filter')}
        </Button>
      </ButtonGroup>
    </Col>
  );
};

const filterOptions = options => options;

export const CallerGroup = ({ onSearch }) => (
  <FormGroup>
    <Col sm={3} componentClass={ControlLabel}>
      {translate('Caller')}
      <span className="text-danger">*</span>
    </Col>
    <Col sm={6}>
      <Field
        name="caller"
        component={AsyncSelectField}
        required={true}
        placeholder={translate('Select caller...')}
        clearable={true}
        labelKey="username"
        valueKey="uuid"
        valueRenderer={renderer}
        optionRenderer={renderer}
        loadOptions={refreshUsers}
        filterOptions={filterOptions}
      />
    </Col>
    <CallerActions onSearch={onSearch} />
  </FormGroup>
);
