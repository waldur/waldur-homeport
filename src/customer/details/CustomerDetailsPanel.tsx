import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CheckOrX } from '@waldur/core/CheckOrX';
import { ENV } from '@waldur/core/config';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { renderFieldOrDash } from '@waldur/table/utils';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';
import { getUser } from '@waldur/workspace/selectors';

import { CustomerChecklistPanel } from './CustomerChecklistPanel';
import { CustomerLocationRow } from './CustomerLocationRow';
import { CustomerMediaPanel } from './CustomerMediaPanel';
import { CustomerOrganizationGroupsRow } from './CustomerOrganizationGroupsRow';
import { FieldEditButton } from './FieldEditButton';
import { StaffOnlyIndicator } from './StaffOnlyIndicator';
import { CustomerEditPanelProps } from './types';

export const CustomerDetailsPanel: FC<CustomerEditPanelProps> = (props) => {
  const nativeNameVisible = isProfileAttributeEnabled('native_name');
  const user = useSelector(getUser);

  const detailsRows = useMemo(
    () =>
      [
        {
          label: translate('Name'),
          key: 'name',
          value: props.customer.name,
        },
        nativeNameVisible
          ? {
              label: translate('Native name'),
              key: 'native_name',
              value: props.customer.native_name,
            }
          : null,
        {
          label: translate('Abbreviation'),
          key: 'abbreviation',
          value: props.customer.abbreviation,
        },
        {
          label: translate('Description'),
          key: 'description',
          value: props.customer.description,
        },
        isFeatureVisible(CustomerFeatures.show_domain)
          ? {
              label: translate('Domain name'),
              key: 'domain',
              value: props.customer.domain,
            }
          : null,
        ENV.plugins.WALDUR_CORE.ORGANIZATION_SUBNETS_VISIBLE
          ? {
              label: translate('Subnets'),
              key: 'access_subnets',
              value: props.customer.access_subnets,
            }
          : null,
        {
          label: translate('Address'),
          key: 'address',
          value: props.customer.address,
        },
        {
          label: translate('Country'),
          key: 'country',
          value: props.customer.country_name,
        },
        {
          label: translate('City'),
          key: 'city',
          value: props.customer.city,
        },
        {
          label: translate('State'),
          key: 'state',
          value: props.customer.state,
        },
        {
          label: translate('Parish'),
          key: 'parish',
          value: props.customer.parish,
        },
        {
          label: translate('Street'),
          key: 'street',
          value: props.customer.street,
        },
        {
          label: translate('House number'),
          key: 'house_nr',
          value: props.customer.house_nr,
        },
        {
          label: translate('Postal code'),
          key: 'postal',
          value: props.customer.postal,
        },
        {
          label: translate('Apartment number'),
          key: 'apartment_nr',
          value: props.customer.apartment_nr,
        },
        {
          label: translate('Household'),
          key: 'household',
          value: props.customer.household,
        },
        user?.is_staff && {
          label: translate('Maximum number of service accounts'),
          key: 'max_service_accounts',
          value: renderFieldOrDash(props.customer.max_service_accounts),
        },
        {
          label: translate('Grace period (days)'),
          description: translate(
            'Number of extra days after project end date before resources are terminated',
          ),
          key: 'grace_period_days',
          value: props.customer.grace_period_days,
        },
        user?.is_staff && {
          label: translate('Display billing info in projects'),
          key: 'display_billing_info_in_projects',
          value: (
            <CheckOrX value={props.customer.display_billing_info_in_projects} />
          ),
        },
      ].filter(Boolean),
    [props.customer, nativeNameVisible],
  );

  const identifiersRows = useMemo(
    () => [
      {
        label: translate('Registration code'),
        key: 'registration_code',
        value: props.customer.registration_code,
      },
      {
        label: translate('Agreement number'),
        key: 'agreement_number',
        value: props.customer.agreement_number,
      },
      {
        label: translate('Sponsor number'),
        key: 'sponsor_number',
        value: props.customer.sponsor_number,
      },
    ],

    [props.customer],
  );

  return (
    <>
      <CustomerMediaPanel {...props} />

      <FormTable.Card
        title={translate('Details')}
        className="card-bordered mb-5"
      >
        <FormTable>
          {detailsRows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              description={row.description}
              value={renderFieldOrDash(row.value)}
              actions={
                props.canUpdate &&
                ([
                  'max_service_accounts',
                  'grace_period_days',
                  'display_billing_info_in_projects',
                  'agreement_number',
                  'domain',
                  'sponsor_number',
                ].includes(row.key)
                  ? user?.is_staff
                  : true) ? (
                  <>
                    {[
                      'max_service_accounts',
                      'grace_period_days',
                      'display_billing_info_in_projects',
                      'agreement_number',
                      'domain',
                      'sponsor_number',
                    ].includes(row.key) && <StaffOnlyIndicator />}
                    <FieldEditButton
                      customer={props.customer}
                      name={row.key}
                      callback={props.callback}
                    />
                  </>
                ) : null
              }
            />
          ))}
          <CustomerOrganizationGroupsRow
            customer={props.customer}
            canUpdate={props.canUpdate}
          />
          <CustomerLocationRow
            customer={props.customer}
            callback={props.callback}
            canUpdate={props.canUpdate}
          />
        </FormTable>
      </FormTable.Card>

      <FormTable.Card
        title={translate('Identifiers')}
        className="card-bordered mb-5"
      >
        <FormTable>
          <FormTable.Item
            label={translate('UUID')}
            value={props.customer.uuid}
          />

          <FormTable.Item
            label={translate('Slug')}
            value={props.customer.slug}
            actions={
              user?.is_staff ? (
                <>
                  <StaffOnlyIndicator />
                  <FieldEditButton
                    customer={props.customer}
                    name="slug"
                    callback={props.callback}
                  />
                </>
              ) : null
            }
          />

          {identifiersRows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              value={renderFieldOrDash(row.value)}
              actions={
                props.canUpdate ? (
                  <FieldEditButton
                    customer={props.customer}
                    name={row.key}
                    callback={props.callback}
                  />
                ) : null
              }
            />
          ))}
        </FormTable>
      </FormTable.Card>

      <CustomerChecklistPanel {...props} />
    </>
  );
};
