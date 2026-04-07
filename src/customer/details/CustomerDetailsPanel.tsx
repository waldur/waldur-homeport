import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { CheckOrX } from '@waldur/core/CheckOrX';
import { ENV } from '@waldur/core/config';
import { Tip } from '@waldur/core/Tooltip';
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

type TabKey = 'basic' | 'address' | 'settings' | 'identifiers' | 'media';

const TAB_KEYS: TabKey[] = [
  'basic',
  'address',
  'settings',
  'identifiers',
  'media',
];

const TabBadge = ({ count, tabKey }: { count: number; tabKey: string }) => (
  <Tip
    label={translate('{count} fields', { count })}
    id={`org-tab-badge-${tabKey}`}
  >
    <span className="badge badge-sm badge-circle badge-light ms-2">
      {count}
    </span>
  </Tip>
);

const useTabStats = (isStaff: boolean) => {
  return useMemo(() => {
    const nativeNameVisible = isProfileAttributeEnabled('native_name');
    const domainVisible = isFeatureVisible(CustomerFeatures.show_domain);
    const subnetsVisible = ENV.plugins.WALDUR_CORE.ORGANIZATION_SUBNETS_VISIBLE;

    // Count total visible fields per tab (not filled — matches profile pattern)
    let basic = 4; // name, abbreviation, description, org groups
    if (nativeNameVisible) basic++;
    if (domainVisible) basic++;
    if (subnetsVisible) basic++;

    const address = 11; // address, country, city, state, parish, street, house_nr, postal, apartment_nr, household, location

    let settings = 1; // grace_period_days
    if (isStaff) settings += 2; // max_service_accounts, display_billing_info_in_projects

    const identifiers = 5; // uuid, slug, registration_code, agreement_number, sponsor_number

    return { basic, address, settings, identifiers };
  }, [isStaff]);
};

const STAFF_ONLY_FIELDS = [
  'max_service_accounts',
  'grace_period_days',
  'display_billing_info_in_projects',
  'agreement_number',
  'domain',
  'sponsor_number',
];

const FieldActions: FC<{
  fieldKey: string;
  customer;
  canUpdate: boolean;
  callback;
  isStaff: boolean;
}> = ({ fieldKey, customer, canUpdate, callback, isStaff }) => {
  if (!canUpdate) return null;
  if (STAFF_ONLY_FIELDS.includes(fieldKey) && !isStaff) return null;
  return (
    <>
      {STAFF_ONLY_FIELDS.includes(fieldKey) && <StaffOnlyIndicator />}
      <FieldEditButton
        customer={customer}
        name={fieldKey}
        callback={callback}
      />
    </>
  );
};

const BasicInfoTab: FC<CustomerEditPanelProps> = (props) => {
  const nativeNameVisible = isProfileAttributeEnabled('native_name');
  const user = useSelector(getUser);

  const rows = useMemo(
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
      ].filter(Boolean),
    [props.customer, nativeNameVisible],
  );

  return (
    <FormTable>
      {rows.map((row) => (
        <FormTable.Item
          key={row.key}
          label={row.label}
          value={renderFieldOrDash(row.value)}
          actions={
            <FieldActions
              fieldKey={row.key}
              customer={props.customer}
              canUpdate={props.canUpdate}
              callback={props.callback}
              isStaff={user?.is_staff}
            />
          }
        />
      ))}
      <CustomerOrganizationGroupsRow
        customer={props.customer}
        canUpdate={props.canUpdate}
      />
    </FormTable>
  );
};

const AddressTab: FC<CustomerEditPanelProps> = (props) => {
  const user = useSelector(getUser);

  const rows = useMemo(
    () => [
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
    ],
    [props.customer],
  );

  return (
    <FormTable>
      {rows.map((row) => (
        <FormTable.Item
          key={row.key}
          label={row.label}
          value={renderFieldOrDash(row.value)}
          actions={
            <FieldActions
              fieldKey={row.key}
              customer={props.customer}
              canUpdate={props.canUpdate}
              callback={props.callback}
              isStaff={user?.is_staff}
            />
          }
        />
      ))}
      <CustomerLocationRow
        customer={props.customer}
        callback={props.callback}
        canUpdate={props.canUpdate}
      />
    </FormTable>
  );
};

const SettingsTab: FC<CustomerEditPanelProps> = (props) => {
  const user = useSelector(getUser);

  const rows = useMemo(
    () =>
      [
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
    [props.customer, user?.is_staff],
  );

  return (
    <FormTable>
      {rows.map((row) => (
        <FormTable.Item
          key={row.key}
          label={row.label}
          description={row.description}
          value={renderFieldOrDash(row.value)}
          actions={
            <FieldActions
              fieldKey={row.key}
              customer={props.customer}
              canUpdate={props.canUpdate}
              callback={props.callback}
              isStaff={user?.is_staff}
            />
          }
        />
      ))}
    </FormTable>
  );
};

const IdentifiersTab: FC<CustomerEditPanelProps> = (props) => {
  const user = useSelector(getUser);

  const rows = useMemo(
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
    <FormTable>
      <FormTable.Item label={translate('UUID')} value={props.customer.uuid} />

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

      {rows.map((row) => (
        <FormTable.Item
          key={row.key}
          label={row.label}
          value={renderFieldOrDash(row.value)}
          actions={
            props.canUpdate ? (
              <>
                {STAFF_ONLY_FIELDS.includes(row.key) && <StaffOnlyIndicator />}
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
    </FormTable>
  );
};

export const CustomerDetailsPanel: FC<CustomerEditPanelProps> = (props) => {
  const { params } = useCurrentStateAndParams();
  const user = useSelector(getUser);

  const initialTab =
    params.section && TAB_KEYS.includes(params.section as TabKey)
      ? (params.section as TabKey)
      : 'basic';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
    const url = new URL(window.location.href);
    url.searchParams.set('section', key);
    window.history.replaceState(null, '', url.toString());
  }, []);

  useEffect(() => {
    if (params.section && TAB_KEYS.includes(params.section as TabKey)) {
      setActiveTab(params.section as TabKey);
    }
  }, [params.section]);

  const tabStats = useTabStats(user?.is_staff);

  const tabs: { key: TabKey; title: React.ReactNode; show: boolean }[] = [
    {
      key: 'basic',
      title: (
        <>
          {translate('Basic info')}
          <TabBadge count={tabStats.basic} tabKey="basic" />
        </>
      ),
      show: true,
    },
    {
      key: 'address',
      title: (
        <>
          {translate('Address')}
          <TabBadge count={tabStats.address} tabKey="address" />
        </>
      ),
      show: true,
    },
    {
      key: 'settings',
      title: (
        <>
          {translate('Settings')}
          <TabBadge count={tabStats.settings} tabKey="settings" />
        </>
      ),
      show: true,
    },
    {
      key: 'identifiers',
      title: (
        <>
          {translate('Identifiers')}
          <TabBadge count={tabStats.identifiers} tabKey="identifiers" />
        </>
      ),
      show: true,
    },
    {
      key: 'media',
      title: translate('Media'),
      show: true,
    },
  ];

  const visibleTabs = tabs.filter((tab) => tab.show);

  const tabContent: Record<TabKey, React.ReactNode> = {
    basic: <BasicInfoTab {...props} />,
    address: <AddressTab {...props} />,
    settings: <SettingsTab {...props} />,
    identifiers: <IdentifiersTab {...props} />,
    media: <CustomerMediaPanel {...props} embedded />,
  };

  return (
    <>
      <Card className="card-bordered mb-7">
        <Card.Header>
          <Card.Title>{translate('Details')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Tab.Container
            activeKey={activeTab}
            onSelect={(k) => handleTabChange(k as TabKey)}
          >
            <Nav variant="tabs" className="nav-line-tabs mb-4">
              {visibleTabs.map((tab) => (
                <Nav.Item key={tab.key}>
                  <Nav.Link eventKey={tab.key} className="cursor-pointer">
                    {tab.title}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
            <Tab.Content>
              {visibleTabs.map((tab) => (
                <Tab.Pane key={tab.key} eventKey={tab.key}>
                  {tabContent[tab.key]}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>

      <CustomerChecklistPanel {...props} />
    </>
  );
};
