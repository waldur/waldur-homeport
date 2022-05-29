import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';

import { titleCase } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { FormContainer, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { HookTypeField } from './HookTypeField';
import { MultiSelectField } from './MultiSelectField';
import { EventGroupOption } from './types';

interface OwnProps {
  isNew: boolean;
  eventGroups: EventGroupOption[];
}

const selector = formValueSelector('HookForm');

export const HookForm: React.FC<OwnProps> = ({ isNew, eventGroups }) => {
  const hookType = useSelector((state: RootState) =>
    selector(state, 'hook_type'),
  );
  return (
    <FormContainer
      submitting={false}
      labelClass="col-sm-12"
      controlClass="col-sm-12"
    >
      {isNew ? (
        <Field
          name="hook_type"
          component={HookTypeField}
          validate={required}
          hideLabel={true}
        />
      ) : (
        <>
          <Form.Group as={Row} className="mb-7">
            <Form.Label column sm={6}>
              {translate('Notification method')}
            </Form.Label>
            <Col sm={6}>
              <Form.Control plaintext value={titleCase(hookType)} />
            </Col>
          </Form.Group>
          <Form.Group className="mb-7">
            <Field
              name="is_active"
              component={AwesomeCheckboxField}
              label={translate('Enabled')}
            />
          </Form.Group>
        </>
      )}

      {hookType == 'email' ? (
        <Field
          name="email"
          component={StringField}
          type="email"
          placeholder={translate('Email address')}
          validate={required}
          hideLabel={true}
        />
      ) : hookType == 'webhook' ? (
        <Field
          name="destination_url"
          component={StringField}
          type="url"
          placeholder={translate('Destination URL')}
          validate={required}
          hideLabel={true}
        />
      ) : null}

      <Field
        name="event_groups"
        component={MultiSelectField}
        options={eventGroups}
        hideLabel={true}
      />
    </FormContainer>
  );
};
