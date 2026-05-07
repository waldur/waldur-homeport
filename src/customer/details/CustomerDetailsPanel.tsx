import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { checklistsAdminRetrieve, customersRetrieve } from 'waldur-js-client';

import { CheckOrX } from '@/core/CheckOrX';
import { ENV } from '@/core/config';
import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { CompactEditButton } from '@/form/CompactEditButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';
import { setCurrentCustomer } from '@/workspace/actions';
import { useUser } from '@/workspace/hooks';

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

    let settings = 2; // grace_period_days, default_affiliations
    if (isStaff) settings += 4; // max_service_accounts, display_billing_info_in_projects, project_slug_template, project_metadata_checklist

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
  'project_slug_template',
  'default_affiliations',
  'project_metadata_checklist',
];

const ProjectMetadataSchemaValue: FC<{ customer }> = ({ customer }) => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['checklistAdmin', customer.project_metadata_checklist],
    queryFn: () =>
      customer.project_metadata_checklist
        ? checklistsAdminRetrieve({
            path: { uuid: customer.project_metadata_checklist },
          }).then((response) => response.data)
        : null,
    staleTime: UI_STALE_TIME,
  });

  if (!customer.project_metadata_checklist) return <>—</>;
  if (isLoading) {
    return (
      <>
        {customer.project_metadata_checklist} <LoadingSpinnerSimple />
      </>
    );
  }
  if (error) {
    return (
      <LoadingErred loadData={refetch} className="d-flex flex-center gap-4" />
    );
  }
  if (!data) return <>—</>;
  return (
    <>
      {data.name}
      <span className="text-muted ms-2">
        ({translate('{count} questions', { count: data.questions_count })})
      </span>
    </>
  );
};

const EditDefaultAffiliationsDialog = lazyComponent(() =>
  import('./EditDefaultAffiliationsDialog').then((module) => ({
    default: module.EditDefaultAffiliationsDialog,
  })),
);

const AffiliationsEditButton: FC<{ customer }> = ({ customer }) => {
  const { openDialog } = useModal();
  const dispatch = useDispatch();
  const refresh = useCallback(async () => {
    const response = await customersRetrieve({
      path: { uuid: customer.uuid },
    });
    dispatch(setCurrentCustomer(response.data));
  }, [customer.uuid, dispatch]);
  const onClick = useCallback(() => {
    openDialog(EditDefaultAffiliationsDialog, {
      resolve: { customer, callback: refresh },
      size: 'lg',
    });
  }, [customer, refresh, openDialog]);
  return <CompactEditButton onClick={onClick} variant="secondary" />;
};

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
  const user = useUser();

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
  const user = useUser();

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
  const user = useUser();

  const affiliations = props.customer.default_affiliations ?? [];
  const AFFILIATIONS_PREVIEW = 5;
  const affiliationsDisplay = useMemo(() => {
    if (affiliations.length === 0) return null;
    const labels = affiliations.map((o) => o.abbreviation || o.name);
    if (labels.length <= AFFILIATIONS_PREVIEW) {
      return translate('{count} enabled: {names}', {
        count: affiliations.length,
        names: labels.join(', '),
      });
    }
    return translate('{count} enabled: {preview}, +{remaining} more', {
      count: affiliations.length,
      preview: labels.slice(0, AFFILIATIONS_PREVIEW).join(', '),
      remaining: labels.length - AFFILIATIONS_PREVIEW,
    });
  }, [affiliations]);

  const rows = useMemo(
    () =>
      [
        user?.is_staff && {
          label: translate('Maximum number of service accounts'),
          key: 'max_service_accounts',
          value: renderFieldOrDash(props.customer.max_service_accounts),
        },
        {
          label: translate('Default grace period (days)'),
          description: translate(
            'Default grace period applied to projects that do not set their own. Resources are terminated this many days after the project end date.',
          ),
          key: 'grace_period_days',
          value: renderFieldOrDash(props.customer.grace_period_days),
        },
        {
          label: translate('Available affiliations'),
          description: translate(
            'Affiliations offered to project creators in this organization. Staff can pick from the full registry.',
          ),
          key: 'default_affiliations',
          value: renderFieldOrDash(affiliationsDisplay),
          customAction: <AffiliationsEditButton customer={props.customer} />,
        },
        user?.is_staff && {
          label: translate('Display billing info in projects'),
          key: 'display_billing_info_in_projects',
          value: (
            <CheckOrX value={props.customer.display_billing_info_in_projects} />
          ),
        },
        user?.is_staff && {
          label: translate('Project slug template'),
          description: translate(
            'Template for auto-generating project slugs when new projects are created.',
          ),
          key: 'project_slug_template',
          value: renderFieldOrDash(props.customer.project_slug_template),
        },
        user?.is_staff && {
          label: translate('Project metadata schema'),
          description: translate(
            'Checklist used for project metadata collection.',
          ),
          key: 'project_metadata_checklist',
          value: <ProjectMetadataSchemaValue customer={props.customer} />,
        },
      ].filter(Boolean),
    [props.customer, user?.is_staff, affiliationsDisplay],
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
            row.customAction ? (
              props.canUpdate && user?.is_staff ? (
                <>
                  <StaffOnlyIndicator />
                  {row.customAction}
                </>
              ) : null
            ) : (
              <FieldActions
                fieldKey={row.key}
                customer={props.customer}
                canUpdate={props.canUpdate}
                callback={props.callback}
                isStaff={user?.is_staff}
              />
            )
          }
        />
      ))}
    </FormTable>
  );
};

const IdentifiersTab: FC<CustomerEditPanelProps> = (props) => {
  const user = useUser();

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
  const user = useUser();

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
  );
};
