import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { createSelector } from 'reselect';

import { AccountingPeriodField } from '@waldur/customer/list/AccountingPeriodField';
import { PeriodOption } from '@waldur/form/types';
import { makeLastTwelveMonthsFilterPeriods } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { Customer, ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

interface SupportUsageFilterProps {
  options: PeriodOption[];
  customer: Customer;
}

const PureSupportUsageFilter: FunctionComponent<SupportUsageFilterProps> = (
  props,
) => (
  <>
    <TableFilterItem
      title={translate('Accounting period')}
      name="accounting_period"
      badgeValue={(value) => value?.label}
      ellipsis={false}
    >
      <AccountingPeriodField options={props.options} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="project"
      badgeValue={(value) => value?.name}
    >
      <ProjectFilter
        customer_uuid={props.customer ? props.customer.uuid : null}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => `${value.category_title} / ${value.name}`}
    >
      <OfferingAutocomplete offeringFilter={{ shared: true }} />
    </TableFilterItem>
  </>
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
