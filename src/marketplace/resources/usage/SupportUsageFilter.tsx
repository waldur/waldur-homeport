import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { createSelector } from 'reselect';

import { AccountingPeriodFilter } from '@waldur/customer/list/AccountingPeriodFilter';
import { PeriodOption } from '@waldur/form/types';
import { makeLastTwelveMonthsFilterPeriods } from '@waldur/form/utils';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { RootState } from '@waldur/store/reducers';
import { Customer, ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

interface SupportUsageFilterProps {
  options: PeriodOption[];
  customer: Customer;
}

const PureSupportUsageFilter: FunctionComponent<SupportUsageFilterProps> = (
  props,
) => (
  <Row>
    <AccountingPeriodFilter options={props.options} />
    <OrganizationAutocomplete />
    <ProjectFilter
      customer_uuid={props.customer ? props.customer.uuid : null}
    />
    <OfferingAutocomplete offeringFilter={{ shared: true }} />
  </Row>
);

export const FORM_ID = 'SupportUsageFilter';

const selector = formValueSelector(FORM_ID);

const mapStateToProps = createSelector(
  (state: RootState) => selector(state, ORGANIZATION_WORKSPACE),
  (customer) => ({
    customer,
    options: makeLastTwelveMonthsFilterPeriods(),
  }),
);

const enhance = compose(
  reduxForm({
    form: FORM_ID,
    initialValues: {
      accounting_period: makeLastTwelveMonthsFilterPeriods()[0],
    },
    destroyOnUnmount: false,
  }),
  connect(mapStateToProps),
);

export const SupportUsageFilter = enhance(PureSupportUsageFilter);
