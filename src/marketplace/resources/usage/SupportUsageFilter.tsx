import moment from 'moment-timezone';
import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { createSelector } from 'reselect';

import { AccountingPeriodFilter } from '@waldur/customer/list/AccountingPeriodFilter';
import { AccountingPeriodOption } from '@waldur/customer/list/types';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { RootState } from '@waldur/store/reducers';
import { Customer, ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

const makeAccountingPeriods = () => {
  let date = moment().startOf('month');
  const choices = [];
  for (let i = 0; i < 12; i++) {
    const month = date.month() + 1;
    const year = date.year();
    const label = date.format('MMMM, YYYY');
    choices.push({
      label,
      value: { year, month, current: i === 0 },
    });
    date = date.subtract(1, 'month');
  }
  return choices;
};

interface Props {
  options: AccountingPeriodOption[];
  customer: Customer;
}

const PureSupportUsageFilter: FunctionComponent<Props> = (props) => (
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
    options: makeAccountingPeriods(),
  }),
);

const enhance = compose(
  reduxForm({
    form: FORM_ID,
    initialValues: { accounting_period: makeAccountingPeriods()[0] },
  }),
  connect(mapStateToProps),
);

export const SupportUsageFilter = enhance(PureSupportUsageFilter);
