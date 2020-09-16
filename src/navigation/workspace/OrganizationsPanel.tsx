import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { getCustomersPage } from './api';
import { CreateOrganizationButton } from './CreateOrganizationButton';
import { FilterGroup } from './FilterGroup';
import { OrganizationListItem } from './OrganizationListItem';
import { VirtualPaginatedList } from './VirtualPaginatedList';

const OrganizationsHeader = ({ organizationsCount }) => (
  <h3 className="m-b-md">
    {translate('Organizations ({count})', {
      count: organizationsCount,
    })}
  </h3>
);

const EmptyOrganizationListPlaceholder = () => (
  <span className="ellipsis">
    {translate('There are no organizations matching filter.')}
  </span>
);

export const OrganizationsPanel = ({
  selectedOrganization,
  selectOrganization,
  organizationsCount,
}) => {
  const [filter, setFilter] = React.useState('');
  const getPage = React.useCallback((page) => getCustomersPage(filter, page), [
    filter,
  ]);

  return (
    <Col className="workspace-listing m-b-md" md={6} xs={12}>
      <CreateOrganizationButton />
      <OrganizationsHeader organizationsCount={organizationsCount} />
      <FilterGroup
        groupId="organization-search-box"
        value={filter}
        onChange={setFilter}
        placeholder={translate('Filter organizations')}
      />
      <VirtualPaginatedList
        height={300}
        itemSize={40}
        getPage={getPage}
        key={filter}
        elementsPerPage={ENV.pageSize}
        noResultsRenderer={EmptyOrganizationListPlaceholder}
      >
        {(listItemProps) => {
          const item = listItemProps.data[listItemProps.index];
          return (
            <OrganizationListItem
              {...listItemProps}
              selected={selectedOrganization?.uuid === item.uuid}
              onSelect={() => selectOrganization(item)}
            />
          );
        }}
      </VirtualPaginatedList>
    </Col>
  );
};
