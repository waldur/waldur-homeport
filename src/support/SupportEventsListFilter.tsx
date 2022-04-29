import { FunctionComponent } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { UserAutocomplete } from '@waldur/issues/feedback/UserAutocomplete';
import { EventDateFilter } from '@waldur/support/EventDateFilter';
import { EventGroupFilter } from '@waldur/support/EventGroupFilter';

import { SUPPORT_EVENTS_LIST_FILTER_FORM_ID } from './constants';

const PureSupportEventsListFilter: FunctionComponent = () => (
  <div className="mb-3">
    <Row>
      <Col sm={4}>
        <EventGroupFilter />
      </Col>
      <Col sm={4}>
        <Form.Label>{translate('Date')}</Form.Label>
        <EventDateFilter />
      </Col>
      <Col sm={4}>
        <Form.Label>{translate('User')}</Form.Label>
        <UserAutocomplete />
      </Col>
    </Row>
  </div>
);

const enhance = reduxForm({
  form: SUPPORT_EVENTS_LIST_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const SupportEventsListFilter = enhance(PureSupportEventsListFilter);
