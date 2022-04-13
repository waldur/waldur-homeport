import classNames from 'classnames';
import { useState, useCallback, FunctionComponent } from 'react';
import { Stack } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Customer } from '@waldur/workspace/types';

import { getCustomersPage } from './api';
import { CreateOrganizationButton } from './CreateOrganizationButton';
import { OrganizationListItem } from './OrganizationListItem';
import { SearchBox } from './SearchBox';
import { VirtualPaginatedList } from './VirtualPaginatedList';
import './OrganizationsSelector.scss';

const OrganizationsHeader = ({ organizationsCount }) => (
  <h5>
    {translate('Organizations ({count})', {
      count: organizationsCount,
    })}
  </h5>
);

const EmptyOrganizationListPlaceholder: FunctionComponent = () => (
  <span className="ellipsis">
    {translate('There are no organizations matching filter.')}
  </span>
);

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;

export const OrganizationsSelector: FunctionComponent<{
  selectedOrganization: Customer;
  selectOrganization;
  organizationsCount;
}> = ({ selectedOrganization, selectOrganization, organizationsCount }) => {
  const [filter, setFilter] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const getPage = useCallback(
    (page) => getCustomersPage(filter, page, VIRTUALIZED_SELECTOR_PAGE_SIZE),
    [filter],
  );

  const selectItem = useCallback(
    (item) => {
      selectOrganization(item);
      setShowOptions(false);
    },
    [selectOrganization],
  );

  return (
    <div className={classNames('metro-select', { active: showOptions })}>
      <div className="d-grid gap-2">
        <button
          className="toggle btn btn-lg"
          onClick={() => setShowOptions(!showOptions)}
        >
          {selectedOrganization?.name ? (
            <span className="organization-selected">
              <span className="image-placeholder"></span>
              <span className="mx-4">{selectedOrganization.name}</span>
              <i
                className="fa fa-times"
                onClick={() => selectOrganization(undefined)}
              />
            </span>
          ) : (
            translate('Select an organization...')
          )}
          <span className="icon">
            <i
              className={classNames(
                'fa',
                showOptions ? 'fa-angle-up' : 'fa-angle-down',
              )}
            />
          </span>
        </button>
      </div>
      <div
        className={classNames('metro-select-options', {
          active: showOptions,
        })}
      >
        <div className="p-4">
          <Stack direction="horizontal" gap={2} className="mb-4">
            <OrganizationsHeader organizationsCount={organizationsCount} />
            <CreateOrganizationButton />
          </Stack>
          <SearchBox
            groupId="organization-search-box"
            value={filter}
            onChange={setFilter}
            placeholder={translate('Filter organizations')}
          />
        </div>
        <VirtualPaginatedList
          height={300}
          itemSize={50}
          getPage={getPage}
          key={filter}
          elementsPerPage={VIRTUALIZED_SELECTOR_PAGE_SIZE}
          noResultsRenderer={EmptyOrganizationListPlaceholder}
        >
          {(listItemProps) => {
            const item = listItemProps.data[listItemProps.index];
            return (
              <OrganizationListItem
                {...listItemProps}
                selected={selectedOrganization?.uuid === item.uuid}
                onSelect={() => selectItem(item)}
              />
            );
          }}
        </VirtualPaginatedList>
      </div>
    </div>
  );
};
