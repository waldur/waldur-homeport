import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getNativeNameVisible } from '@waldur/store/config';
import { getUser } from '@waldur/workspace/selectors';

import { CustomerLocationRow } from './CustomerLocationRow';
import { CustomerMediaPanel } from './CustomerMediaPanel';
import { CustomerOrganizationGroupsRow } from './CustomerOrganizationGroupsRow';
import { FieldEditButton } from './FieldEditButton';
import { CustomerEditPanelProps } from './types';

export const CustomerDetailsPanel: FC<CustomerEditPanelProps> = (props) => {
  const nativeNameVisible = getNativeNameVisible();
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
          label: translate('Postal code'),
          key: 'postal',
          value: props.customer.postal,
        },
        {
          label: translate('Country'),
          key: 'country',
          value: props.customer.country_name,
        },
        user?.is_staff && {
          label: translate('Maximum number of service accounts'),
          key: 'max_service_accounts',
          value: props.customer.max_service_accounts
            ? props.customer.max_service_accounts
            : 'N/A',
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
              value={row.value || 'N/A'}
              actions={
                <FieldEditButton
                  customer={props.customer}
                  name={row.key}
                  callback={props.callback}
                />
              }
            />
          ))}
          <CustomerOrganizationGroupsRow customer={props.customer} />
          <CustomerLocationRow
            customer={props.customer}
            callback={props.callback}
          />
        </FormTable>
      </FormTable.Card>

      <FormTable.Card
        title={translate('Identifiers')}
        className="card-bordered"
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
                <FieldEditButton
                  customer={props.customer}
                  name="slug"
                  callback={props.callback}
                />
              ) : null
            }
          />

          {identifiersRows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              value={row.value || 'N/A'}
              actions={
                <FieldEditButton
                  customer={props.customer}
                  name={row.key}
                  callback={props.callback}
                />
              }
            />
          ))}
        </FormTable>
      </FormTable.Card>
    </>
  );
};
