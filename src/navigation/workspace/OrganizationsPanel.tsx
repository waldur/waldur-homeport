import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getUser, checkCustomerUser } from '@waldur/workspace/selectors';

import { BaseList } from './BaseList';
import { FilterGroup } from './FilterGroup';
import { useCreateOrganization, useOrganizationFilter } from './utils';

const CreateOrganizationButton = () => {
  const [enabled, onClick] = useCreateOrganization();
  if (!enabled) {
    return null;
  }
  return (
    <a
      className="pull-right btn btn-sm btn-default"
      onClick={onClick}
      id="add-new-organization"
    >
      <i className="fa fa-plus" /> {translate('Add new')}{' '}
      <span className="hidden-xs">{translate('organization')}</span>
    </a>
  );
};

const OrganizationsHeader = ({ organizations }) => (
  <h3 className="m-b-md">
    {translate('Organizations ({count})', {
      count: organizations.length,
    })}
  </h3>
);

const ServiceProviderIcon = ({ organization }) =>
  organization.is_service_provider ? (
    <Tooltip
      label={translate('Service provider')}
      id={`service-provider-${organization.uuid}`}
      className="pull-right"
    >
      <i className="provider-icon svgfonticon svgfonticon-provider" />
    </Tooltip>
  ) : null;

const OrganizationTitle = ({ organization }) =>
  organization.abbreviation ? (
    <Tooltip
      label={organization.name}
      id={`full-name-${organization.uuid}`}
      className="select-workspace-dialog__tooltip--order"
    >
      <div className="ellipsis">
        {organization.abbreviation}
        <ServiceProviderIcon organization={organization} />
      </div>
    </Tooltip>
  ) : (
    <div className="ellipsis">
      {organization.name}
      <ServiceProviderIcon organization={organization} />
    </div>
  );

const SelectOrganizationButton = ({ organization }) => {
  const user = useSelector(getUser);
  const canGotoDashboard = React.useMemo(
    () => user.is_support || checkCustomerUser(organization, user),
    [organization, user],
  );
  if (!canGotoDashboard) {
    return null;
  }
  return (
    <Link
      className="btn btn-xs btn-default pull-right"
      state="organization.dashboard"
      params={{ uuid: organization.uuid }}
    >
      {translate('Select')}
    </Link>
  );
};

const EmptyOrganizationListPlaceholder = () => (
  <span className="ellipsis">
    {translate('There are no organizations matching filter.')}
  </span>
);

const OrganizationListItem = ({ item }) => (
  <>
    <SelectOrganizationButton organization={item} />
    <OrganizationTitle organization={item} />
  </>
);

export const OrganizationsPanel = ({
  selectedOrganization,
  selectOrganization,
  organizations,
}) => {
  const { filter, setFilter, filteredOrganizations } = useOrganizationFilter(
    organizations,
  );

  return (
    <Col className="workspace-listing m-b-md" md={6} xs={12}>
      <CreateOrganizationButton />
      <OrganizationsHeader organizations={organizations} />
      <FilterGroup
        groupId="organization-search-box"
        value={filter}
        onChange={setFilter}
        placeholder={translate('Filter organizations')}
      />
      <BaseList
        items={filteredOrganizations}
        selectedItem={selectedOrganization}
        selectItem={selectOrganization}
        EmptyPlaceholder={EmptyOrganizationListPlaceholder}
        ItemComponent={OrganizationListItem}
      />
    </Col>
  );
};
