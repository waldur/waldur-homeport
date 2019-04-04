import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';

import { AccountingPeriodFilter } from '@waldur/customer/AccountingPeriodFilter';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';

const PureSupportUsageFilter = props => (
  <Row>
    <AccountingPeriodFilter/>
    <OrganizationAutocomplete/>
    <ProjectFilter customer_uuid={props.customer ? props.customer.uuid : null}/>
    <OfferingAutocomplete/>
  </Row>
);

export const FORM_ID = 'SupportUsageFilter';

const selector = formValueSelector(FORM_ID);

const enhance = compose(
  reduxForm({form: FORM_ID}),
  connect(state => ({
    customer: selector(state, 'organization'),
  }))
);

export const SupportUsageFilter = enhance(PureSupportUsageFilter);
