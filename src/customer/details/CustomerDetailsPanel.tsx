import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  checklistsAdminRetrieve,
  customersRetrieve,
  rolesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { CompactEditButton } from '@/form/CompactEditButton';
import {
  BooleanEditField,
  CountryEditField,
  EditFieldProvider,
  NumberEditField,
  StringEditField,
  TextEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { TabbedSection } from '@/form/TabbedSection';
import { clearToBlank } from '@/form/utils';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';
import { useSetCustomer, useUser } from '@/workspace/hooks';

import { CustomerLocationRow } from './CustomerLocationRow';
import { CustomerMediaPanel } from './CustomerMediaPanel';
import { CustomerOrganizationGroupsRow } from './CustomerOrganizationGroupsRow';
import { StaffOnlyIndicator } from './StaffOnlyIndicator';
import { CustomerEditPanelProps } from './types';

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

const EditCustomerChecklistDialog = lazyComponent(() =>
  import('./EditCustomerChecklistDialog').then((module) => ({
    default: module.EditCustomerChecklistDialog,
  })),
);

const AffiliationsEditButton: FC<{ customer }> = ({ customer }) => {
  const { openDialog } = useModal();
  const setCurrentCustomer = useSetCustomer();
  const refresh = useCallback(async () => {
    const response = await customersRetrieve({
      path: { uuid: customer.uuid },
    });
    setCurrentCustomer(response.data);
  }, [customer.uuid]);

  const onClick = useCallback(() => {
    openDialog(EditDefaultAffiliationsDialog, {
      resolve: { customer, callback: refresh },
      size: 'lg',
    });
  }, [customer, refresh, openDialog]);
  return <CompactEditButton onClick={onClick} variant="secondary" />;
};

const BasicInfoTab: FC<CustomerEditPanelProps> = (props) => {
  const nativeNameVisible = isProfileAttributeEnabled('native_name');

  return (
    <>
      <StringEditField name="name" label={translate('Name')} />
      {nativeNameVisible && (
        <StringEditField name="native_name" label={translate('Native name')} />
      )}
      <StringEditField name="abbreviation" label={translate('Abbreviation')} />
      <TextEditField name="description" label={translate('Description')} />
      {isFeatureVisible(CustomerFeatures.show_domain) && (
        <StringEditField
          name="domain"
          label={translate('Domain name')}
          description={translate('Home organization domain name')}
        />
      )}
      {ENV.plugins.WALDUR_CORE.ORGANIZATION_SUBNETS_VISIBLE && (
        <StringEditField
          name="access_subnets"
          label={translate('Subnets')}
          description={translate(
            'Subnets from where connection to self-service is allowed.',
          )}
        />
      )}
      <CustomerOrganizationGroupsRow
        customer={props.customer}
        canUpdate={props.canUpdate}
      />
    </>
  );
};

const AddressTab: FC<CustomerEditPanelProps> = (props) => {
  return (
    <>
      <StringEditField name="address" label={translate('Address')} />
      <CountryEditField
        name="country"
        label={translate('Country')}
        parse={clearToBlank}
        renderValue={() => props.customer.country_name}
      />
      <StringEditField name="city" label={translate('City')} />
      <StringEditField name="state" label={translate('State')} />
      <StringEditField name="parish" label={translate('Parish')} />
      <StringEditField name="street" label={translate('Street')} />
      <StringEditField name="house_nr" label={translate('House number')} />
      <StringEditField name="postal" label={translate('Postal code')} />
      <StringEditField
        name="apartment_nr"
        label={translate('Apartment number')}
      />
      <StringEditField name="household" label={translate('Household')} />
      <CustomerLocationRow
        customer={props.customer}
        canUpdate={props.canUpdate}
      />
    </>
  );
};

const SettingsTab: FC<CustomerEditPanelProps> = (props) => {
  const user = useUser();
  const { openDialog } = useModal();

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

  return (
    <>
      {user?.is_staff && (
        <NumberEditField
          name="max_service_accounts"
          label={translate('Maximum number of service accounts')}
          min={0}
          isStaffOnly
        />
      )}
      <NumberEditField
        name="grace_period_days"
        label={translate('Default grace period (days)')}
        description={translate(
          'Default grace period applied to projects that do not set their own. Resources are terminated this many days after the project end date.',
        )}
        min={0}
      />
      <FormTable.Item
        label={translate('Available affiliations')}
        description={translate(
          'Affiliations offered to project creators in this organization. Staff can pick from the full registry.',
        )}
        value={renderFieldOrDash(affiliationsDisplay)}
        actions={
          props.canUpdate && user?.is_staff ? (
            <>
              <StaffOnlyIndicator />
              <AffiliationsEditButton customer={props.customer} />
            </>
          ) : null
        }
      />
      {user?.is_staff && (
        <BooleanEditField
          name="display_billing_info_in_projects"
          label={translate('Display billing info in projects')}
          isStaffOnly
        />
      )}
      {user?.is_staff && (
        <StringEditField
          name="project_slug_template"
          label={translate('Project slug template')}
          description={translate(
            'Placeholders: {customer_slug}, {project_name}, {year}, {month}, {counter}, {counter_padded}. Leave empty for default name-based slug.',
          )}
          isStaffOnly
        />
      )}
      {user?.is_staff && (
        <FormTable.Item
          label={translate('Project metadata schema')}
          description={translate(
            'Checklist used for project metadata collection.',
          )}
          value={<ProjectMetadataSchemaValue customer={props.customer} />}
          actions={
            props.canUpdate ? (
              <>
                <StaffOnlyIndicator />
                <CompactEditButton
                  variant="secondary"
                  onClick={() =>
                    openDialog(EditCustomerChecklistDialog, {
                      resolve: {
                        customer: props.customer,
                        name: 'project_metadata_checklist',
                        callback: props.callback,
                      },
                    })
                  }
                />
              </>
            ) : null
          }
        />
      )}
    </>
  );
};

const IdentifiersTab: FC<CustomerEditPanelProps> = (props) => {
  // Cloned (custom) roles embed the organization slug in their name, so changing
  // the slug renames them. Warn about that only when such roles exist.
  const { data: hasCustomRoles } = useQuery({
    queryKey: ['customer-has-custom-roles', props.customer.uuid],
    queryFn: async () => {
      const response = await rolesList({
        query: {
          available_for_customer: props.customer.uuid,
          is_system_role: false,
          page_size: 1,
        },
      });
      return (response.data?.length ?? 0) > 0;
    },
    staleTime: UI_STALE_TIME,
  });

  const slugDescription = hasCustomRoles
    ? translate(
        'Warning: Changing the slug may break external integrations that rely on this value, and it will rename this organization’s custom roles (their names include the slug). Ensure that all dependent systems are updated before proceeding.',
      )
    : translate(
        'Warning: Changing the slug may break external integrations that rely on this value. Ensure that all dependent systems are updated before proceeding.',
      );

  return (
    <>
      <FormTable.Item label={translate('UUID')} value={props.customer.uuid} />

      <StringEditField
        name="slug"
        label={translate('Slug')}
        description={slugDescription}
        isStaffOnly
      />

      <StringEditField
        name="registration_code"
        label={translate('Registration code')}
      />

      <StringEditField
        name="agreement_number"
        label={translate('Agreement number')}
        isStaffOnly
      />

      <StringEditField
        name="sponsor_number"
        label={translate('Sponsor number')}
        isStaffOnly
      />
    </>
  );
};

export const CustomerDetailsPanel: FC<CustomerEditPanelProps> = (props) => {
  const user = useUser();
  const tabStats = useTabStats(user?.is_staff);

  return (
    <EditFieldProvider scope={props.customer} callback={props.callback}>
      <TabbedSection
        title={translate('Details')}
        hideActions={!props.canUpdate}
      >
        <TabbedSection.Tab
          id="basic"
          title={
            <>
              {translate('Basic info')}
              <TabBadge count={tabStats.basic} tabKey="basic" />
            </>
          }
        >
          <BasicInfoTab {...props} />
        </TabbedSection.Tab>
        <TabbedSection.Tab
          id="address"
          title={
            <>
              {translate('Address')}
              <TabBadge count={tabStats.address} tabKey="address" />
            </>
          }
        >
          <AddressTab {...props} />
        </TabbedSection.Tab>
        <TabbedSection.Tab
          id="settings"
          title={
            <>
              {translate('Settings')}
              <TabBadge count={tabStats.settings} tabKey="settings" />
            </>
          }
        >
          <SettingsTab {...props} />
        </TabbedSection.Tab>
        <TabbedSection.Tab
          id="identifiers"
          title={
            <>
              {translate('Identifiers')}
              <TabBadge count={tabStats.identifiers} tabKey="identifiers" />
            </>
          }
        >
          <IdentifiersTab {...props} />
        </TabbedSection.Tab>
        <TabbedSection.Tab id="media" title={translate('Media')}>
          <tr>
            <td colSpan={2} className="p-0">
              <CustomerMediaPanel {...props} embedded />
            </td>
          </tr>
        </TabbedSection.Tab>
      </TabbedSection>
    </EditFieldProvider>
  );
};
