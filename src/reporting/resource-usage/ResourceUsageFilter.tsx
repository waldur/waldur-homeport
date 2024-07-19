import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { createSelector } from 'reselect';

import { AccountingPeriodField } from '@waldur/customer/list/AccountingPeriodField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { PeriodOption } from '@waldur/form/types';
import { makeLastTwelveMonthsFilterPeriods } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { ProjectFilter } from '@waldur/marketplace/resources/list/ProjectFilter';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';
import { Customer, WorkspaceType } from '@waldur/workspace/types';

interface ResourceUsageFilterProps {
  options: PeriodOption[];
  customer: Customer;
}

const PureResourceUsageFilter: FunctionComponent<ResourceUsageFilterProps> = (
  props,
) => (
  <>
    <TableFilterItem
      title={translate('Accounting period')}
      name="accounting_period"
      badgeValue={(value) => value?.label}
      ellipsis={false}
    >
      <AccountingPeriodField
        options={props.options}
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="project"
      badgeValue={(value) => value?.name}
    >
      <ProjectFilter
        customer_uuid={props.customer ? props.customer.uuid : null}
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => `${value.category_title} / ${value.name}`}
    >
      <OfferingAutocomplete
        offeringFilter={{ shared: true }}
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
  </>
);

export const FORM_ID = 'ResourceUsageFilter';

const selector = formValueSelector(FORM_ID);

const mapStateToProps = createSelector(
  (state: RootState) => selector(state, WorkspaceType.ORGANIZATION),
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

export const ResourceUsageFilter = enhance(PureResourceUsageFilter);
