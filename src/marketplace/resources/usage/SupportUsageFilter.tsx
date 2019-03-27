import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';
import { reduxForm } from 'redux-form';

import { AccountingPeriodFilter } from '@waldur/customer/AccountingPeriodFilter';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';

const PureSupportUsageFilter = props => (
  <Row>
    <AccountingPeriodFilter/>
    <OrganizationAutocomplete/>
    <ProjectFilter customer_uuid={props.customer_uuid}/>
  </Row>
);

const enhance = reduxForm({form: 'SupportUsageFilter'});

export const SupportUsageFilter = enhance(PureSupportUsageFilter);
