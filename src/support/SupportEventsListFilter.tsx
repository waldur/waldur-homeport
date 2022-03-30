import { FunctionComponent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';
import { EventDateFilter } from '@waldur/support/EventDateFilter';
import { EventGroupFilter } from '@waldur/support/EventGroupFilter';

import { SUPPORT_EVENTS_LIST_FILTER_FORM_ID } from './constants';

const PureSupportEventsListFilter: FunctionComponent = () => (
  <div className="m-b-md">
    <Row>
      <Col sm={4}>
        <EventGroupFilter />
      </Col>
      <Col sm={4}>
        <div>
          <Form.Label>{translate('Date')}</Form.Label>
          <EventDateFilter />
        </div>
      </Col>
      <Col sm={4}>
        <div>
          <Form.Label>{translate('User')}</Form.Label>
          <UserAutocomplete />
        </div>
      </Col>
    </Row>
  </div>
);

const enhance = reduxForm({
  form: SUPPORT_EVENTS_LIST_FILTER_FORM_ID,
});

export const SupportEventsListFilter = enhance(PureSupportEventsListFilter);
